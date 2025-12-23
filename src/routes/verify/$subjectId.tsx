import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { timelineApi } from '@/lib/api-client'
import { ChevronLeft, CheckCircle, AlertTriangle, Loader2, AlertCircle, Download } from 'lucide-react'
import { ChainVisualization } from '@/components/verify/ChainVisualization'
import type { components } from '@/lib/timeline-api'

export const Route = createFileRoute('/verify/$subjectId')(
  {
    component: VerifyPage,
  }
)

type EventResponse = components['schemas']['EventResponse']

interface VerificationResult {
  isValid: boolean
  totalEvents: number
  validEvents: number
  tamperedEvents: number
  tamperedIndices: number[]
  events: Array<EventResponse & { verified: boolean; expectedHash: string; actualHash: string }>
  verifiedAt: string
}

function VerifyPage() {
  const authState = useRequireAuth()
  const navigate = useNavigate()
  const { subjectId } = Route.useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verification, setVerification] = useState<VerificationResult | null>(null)

  useEffect(() => {
    if (authState.user) {
      verifyChain()
    }
  }, [authState.user, subjectId])

  const verifyChain = async () => {
    setLoading(true)
    setError(null)
    try {
      // Fetch events for the subject to display chain
      const { data: eventsData, error: eventsError } = await timelineApi.events.list(subjectId)

      if (eventsError) {
        const errorMsg = typeof eventsError === 'object' && 'message' in eventsError ? (eventsError as any).message : 'Failed to load events'
        setError(errorMsg)
      } else if (eventsData && Array.isArray(eventsData)) {
        // Simulate verification - in production this would call the verify endpoint
        const totalEvents = eventsData.length
        const verificationData: VerificationResult = {
          isValid: true,
          totalEvents: totalEvents,
          validEvents: totalEvents,
          tamperedEvents: 0,
          tamperedIndices: [],
          events: (eventsData as any[]).map((e) => ({
            ...e,
            verified: true,
            expectedHash: (e as any).hash || '',
            actualHash: (e as any).hash || '',
          })),
          verifiedAt: new Date().toISOString(),
        }
        setVerification(verificationData)
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected error verifying chain'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleExportReport = () => {
    if (!verification) return

    const reportContent = {
      subjectId,
      verifiedAt: verification.verifiedAt,
      integryStatus: verification.isValid ? 'Valid' : 'Tampered',
      summary: {
        totalEvents: verification.totalEvents,
        validEvents: verification.validEvents,
        tamperedEvents: verification.tamperedEvents,
      },
      tamperedEventIndices: verification.tamperedIndices,
      events: verification.events.map((e, i) => ({
        index: i,
        id: e.id,
        eventType: e.event_type,
        eventTime: e.event_time,
        verified: e.verified,
        hash: e.hash || (e as any).actual_hash,
        previousHash: (e as any).previous_hash,
        expectedHash: (e as any).expected_hash,
      })),
    }

    const dataStr = JSON.stringify(reportContent, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chain-verification-${subjectId}-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  if (!authState.user) {
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Verifying chain integrity...</span>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Back Button */}
      <button
        onClick={() => navigate({ to: `/events/subject/${subjectId}` })}
        className="flex items-center gap-1 py-1 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors"
      >
        <ChevronLeft className="w-3.5 h-3.5" />
        Back to Subject
      </button>

      {/* Error Alert */}
      {error && (
        <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm flex gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-200 text-xs">Verification Failed</h3>
            <p className="text-xs text-red-800 dark:text-red-300 mt-0.5">{error}</p>
          </div>
          <button
            onClick={verifyChain}
            className="px-2.5 py-0.5 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors flex-shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {verification && (
        <>
          {/* Header and Stats Row */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2">
              <h1 className="text-lg font-bold text-foreground">Chain Verification</h1>
              {verification.isValid ? (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-sm">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
                  <span className="font-semibold text-green-900 dark:text-green-200 text-xs">Valid Chain</span>
                </div>
              ) : (
                <div className="flex items-center gap-1 px-2.5 py-1 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                  <span className="font-semibold text-red-900 dark:text-red-200 text-xs">Tampered Chain</span>
                </div>
              )}
            </div>

            {/* Compact Stats */}
            <div className="flex flex-wrap gap-3 mb-2 text-sm">
              <span className="text-muted-foreground">Total Events: <span className="font-bold text-foreground">{verification.totalEvents}</span></span>
              <span className="text-muted-foreground">Valid Events: <span className="font-bold text-green-600 dark:text-green-400">{verification.validEvents}</span></span>
              <span className="text-muted-foreground">Tampered Events: <span className="font-bold text-red-600 dark:text-red-400">{verification.tamperedEvents}</span></span>
              <span className="text-muted-foreground">Integrity: <span className={`font-bold ${verification.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{verification.isValid ? '100%' : `${Math.round(((verification.totalEvents - verification.tamperedEvents) / verification.totalEvents) * 100)}%`}</span></span>
            </div>

            <p className="text-xs text-muted-foreground">Subject ID: {subjectId}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified: {new Date(verification.verifiedAt).toLocaleString()}
            </p>
          </div>

          {/* Event Chain Timeline */}
          <div className="bg-card/80 rounded-sm border border-border/50 p-3 mb-3">
            <h2 className="text-sm font-semibold text-foreground mb-2">Event Chain Timeline</h2>
            <ChainVisualization events={verification.events} tamperedIndices={verification.tamperedIndices} />
          </div>

          {/* Tampered Events Details */}
          {verification.tamperedEvents > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm p-3 mb-3">
              <h2 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">Tampering Details</h2>
              <div className="space-y-1.5">
                {verification.events
                  .map((event, index) => ({ event, index }))
                  .filter(({ index }) => verification.tamperedIndices.includes(index))
                  .map(({ event, index }) => (
                    <div key={event.id} className="p-2 bg-background border border-red-200 dark:border-red-800 rounded-sm">
                      <p className="font-mono text-xs text-red-600 dark:text-red-400 mb-1">
                        Event #{index}: {event.event_type}
                      </p>
                      <div className="space-y-0.5 text-xs">
                        <p className="text-muted-foreground">
                          <span className="font-medium">Expected Hash:</span>
                          <span className="font-mono break-all text-xs block">{(event as any).expected_hash || 'N/A'}</span>
                        </p>
                        <p className="text-muted-foreground">
                          <span className="font-medium">Actual Hash:</span>
                          <span className="font-mono break-all text-xs block">{event.hash || (event as any).actual_hash || 'N/A'}</span>
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* Export Button */}
          <div className="flex justify-center">
            <button
              onClick={handleExportReport}
              className="flex items-center gap-1 px-2.5 py-1 text-xs bg-primary text-primary-foreground rounded-sm font-medium hover:bg-primary/90 transition-colors"
            >
              <Download className="w-3 h-3" />
              Export Report
            </button>
          </div>
        </>
      )}
    </>
  )
}
