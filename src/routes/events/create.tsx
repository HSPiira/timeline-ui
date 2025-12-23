import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useEffect, useState, useMemo } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { timelineApi } from '@/lib/api-client'
import SubjectSelector from '@/components/subjects/SubjectSelector'
import EventTypeSelector from '@/components/events/EventTypeSelector'
import { JsonSchemaForm } from '@/components/shared/JsonSchemaForm'
import { Loader2, AlertCircle } from 'lucide-react'
import type { components } from '@/lib/timeline-api'

export const Route = createFileRoute('/events/create')({
  component: CreateEventPage,
})

interface CreateEventState {
  subjectId: string
  eventType: string
  eventTime: string
  payload: Record<string, any>
  fieldErrors: Record<string, string>
}

function CreateEventPage() {
  const authState = useRequireAuth()
  const navigate = useNavigate()

  const [state, setState] = useState<CreateEventState>({
    subjectId: '',
    eventType: '',
    eventTime: new Date().toISOString().slice(0, 16),
    payload: {},
    fieldErrors: {},
  })
  const [schema, setSchema] = useState<Record<string, any> | null>(null)
  const [schemaLoading, setSchemaLoading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [apiError, setApiError] = useState<string | null>(null)

  // Fetch schema when event type changes
  useEffect(() => {
    if (!state.eventType) {
      setSchema(null)
      return
    }

    let mounted = true
    const fetchSchema = async () => {
      setSchemaLoading(true)
      try {
        const res = await timelineApi.eventSchemas.getActive(state.eventType)
        if (!mounted) return

        if (res.data) {
          setSchema(res.data.schema_definition || null)
        } else {
          setSchema(null)
        }
      } catch (err) {
        console.error('Failed to fetch schema:', err)
        setSchema(null)
      } finally {
        setSchemaLoading(false)
      }
    }

    fetchSchema()
    return () => {
      mounted = false
    }
  }, [state.eventType])

  // Validate payload against schema
  const validatePayload = useMemo(() => {
    const errors: Record<string, string> = {}

    if (!schema?.properties) return errors

    const requiredFields = schema?.required ?? []

    for (const field of requiredFields) {
      if (!state.payload[field]) {
        errors[field] = `${field} is required`
      }
    }

    return errors
  }, [schema, state.payload])

  const handlePayloadChange = (newPayload: Record<string, any>) => {
    setState((prev) => ({
      ...prev,
      payload: newPayload,
      fieldErrors: {},
    }))
    setApiError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setApiError(null)

    // Validate required fields
    const errors: Record<string, string> = {}
    if (!state.subjectId) errors.subjectId = 'Subject is required'
    if (!state.eventType) errors.eventType = 'Event type is required'

    if (Object.keys(validatePayload).length > 0) {
      setState((prev) => ({
        ...prev,
        fieldErrors: validatePayload,
      }))
      return
    }

    if (Object.keys(errors).length > 0) {
      setState((prev) => ({
        ...prev,
        fieldErrors: errors,
      }))
      return
    }

    setLoading(true)
    try {
      const eventCreateData: components['schemas']['EventCreate'] = {
        subject_id: state.subjectId,
        event_type: state.eventType,
        event_time: new Date(state.eventTime).toISOString(),
        payload: state.payload,
      }

      const { data, error: createError } = await timelineApi.events.create(eventCreateData)

      if (createError) {
        const errorMessage =
          typeof createError === 'object' && 'message' in createError
            ? (createError as any).message
            : 'Failed to create event'
        setApiError(errorMessage)
      } else if (data) {
        navigate({ to: '/events' })
      }
    } catch (err) {
      console.error('Error creating event:', err)
      setApiError('An unexpected error occurred while creating the event')
    } finally {
      setLoading(false)
    }
  }

  if (authState.isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-background flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    )
  }

  if (!authState.user) return null

  return (
    <>
        <h1 className="text-lg font-bold mb-3">Create Event</h1>

        <form onSubmit={handleSubmit} className="space-y-3 bg-card/80 p-3 rounded-sm border border-border/50">
          {/* API Error Alert */}
          {apiError && (
            <div className="p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm flex gap-2">
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 dark:text-red-200 text-sm">Error</h3>
                <p className="text-sm text-red-800 dark:text-red-300">{apiError}</p>
              </div>
            </div>
          )}

          {/* Subject Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <SubjectSelector value={state.subjectId} onChange={(value) => setState((prev) => ({ ...prev, subjectId: value }))} />
            {state.fieldErrors.subjectId && <p className="text-sm text-red-500 mt-0.5">{state.fieldErrors.subjectId}</p>}
          </div>

          {/* Event Type Selection */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Event Type <span className="text-red-500">*</span>
            </label>
            <EventTypeSelector value={state.eventType} onChange={(value) => setState((prev) => ({ ...prev, eventType: value }))} />
            {state.fieldErrors.eventType && <p className="text-sm text-red-500 mt-0.5">{state.fieldErrors.eventType}</p>}
          </div>

          {/* Event Time */}
          <div>
            <label className="block text-sm font-medium mb-1">Event Time</label>
            <input
              type="datetime-local"
              value={state.eventTime}
              onChange={(e) => setState((prev) => ({ ...prev, eventTime: e.target.value }))}
              className="w-full px-2.5 py-1.5 bg-background border border-input rounded-sm text-sm"
            />
            <p className="text-sm text-muted-foreground mt-0.5">Defaults to current time</p>
          </div>

          {/* Payload / Dynamic Form */}
          <div>
            <label className="block text-sm font-medium mb-1.5">
              Event Data
              {schema?.required?.length ? ' ' : ''}
            </label>

            {schemaLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-sm">Loading schema...</span>
                </div>
              </div>
            ) : schema?.properties ? (
              <div className="space-y-2 p-2.5 bg-background/50 rounded-sm border border-border/50">
                <JsonSchemaForm schema={schema} value={state.payload} onChange={handlePayloadChange} errors={state.fieldErrors} />
              </div>
            ) : (
              <div className="text-sm text-muted-foreground italic p-2.5 bg-background/50 rounded-sm border border-border/50">
                Select an event type to see available fields
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || schemaLoading}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Creating...
                </>
              ) : (
                'Create Event'
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate({ to: '/events' })}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Cancel
            </button>
          </div>
        </form>
    </>
  )
}
 
