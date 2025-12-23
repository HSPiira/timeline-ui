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

type ChainVerificationResponse = components['schemas']['ChainVerificationResponse']
type EventVerificationResult = components['schemas']['EventVerificationResult']
type EventResponse = components['schemas']['EventResponse']

// Adapter to convert API response to ChainVisualization format
interface VisualizationEvent extends EventResponse {
  verified: boolean
  expectedHash: string
  actualHash: string
}

function VerifyPage() {
  const authState = useRequireAuth()
  const navigate = useNavigate()
  const { subjectId } = Route.useParams()

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [verification, setVerification] = useState<ChainVerificationResponse | null>(null)

  useEffect(() => {
    if (authState.user) {
      verifyChain()
    }
  }, [authState.user, subjectId])

  const verifyChain = async () => {
    setLoading(true)
    setError(null)
    try {
      // Call the real verify endpoint
      const { data: verificationData, error: verifyError } = await timelineApi.events.verify(subjectId)

      if (verifyError) {
        const errorMsg = typeof verifyError === 'object' && 'message' in verifyError ? (verifyError as any).message : 'Failed to verify chain'
        setError(errorMsg)
      } else if (verificationData) {
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
      subjectId: verification.subject_id,
      tenantId: verification.tenant_id,
      verifiedAt: verification.verified_at,
      integrityStatus: verification.is_chain_valid ? 'Valid' : 'Tampered',
      summary: {
        totalEvents: verification.total_events,
        validEvents: verification.valid_events,
        invalidEvents: verification.invalid_events,
      },
      eventResults: verification.event_results?.map((e) => ({
        eventId: e.event_id,
        eventType: e.event_type,
        eventTime: e.event_time,
        sequence: e.sequence,
        isValid: e.is_valid,
        errorType: e.error_type || null,
        errorMessage: e.error_message || null,
        expectedHash: e.expected_hash || null,
        actualHash: e.actual_hash || null,
      })),
    }

    const dataStr = JSON.stringify(reportContent, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `chain-verification-${subjectId.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.json`
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
              {verification.is_chain_valid ? (
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
              <span className="text-muted-foreground">Total Events: <span className="font-bold text-foreground">{verification.total_events}</span></span>
              <span className="text-muted-foreground">Valid Events: <span className="font-bold text-green-600 dark:text-green-400">{verification.valid_events}</span></span>
              <span className="text-muted-foreground">Invalid Events: <span className="font-bold text-red-600 dark:text-red-400">{verification.invalid_events}</span></span>
              <span className="text-muted-foreground">Integrity: <span className={`font-bold ${verification.is_chain_valid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{verification.total_events > 0 ? Math.round((verification.valid_events / verification.total_events) * 100) : 0}%</span></span>
            </div>

            <p className="text-xs text-muted-foreground">Subject ID: {subjectId}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Verified: {new Date(verification.verified_at).toLocaleString()}
            </p>
          </div>

          {/* Event Chain Timeline */}
          <div className="bg-card/80 rounded-sm border border-border/50 p-3 mb-3">
            <h2 className="text-sm font-semibold text-foreground mb-2">Event Chain Timeline</h2>
            {verification.event_results && verification.event_results.length > 0 ? (
              <div className="space-y-2">
                {verification.event_results.map((event, index) => (
                  <div
                    key={event.event_id}
                    className={`p-3 rounded-sm border ${
                      event.is_valid
                        ? 'bg-green-50/50 dark:bg-green-900/10 border-green-200 dark:border-green-800'
                        : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="text-xs px-1.5 py-0.5 bg-primary/20 text-primary rounded-sm font-medium">
                            Genesis
                          </span>
                        )}
                        <span className="text-xs font-mono text-muted-foreground">#{event.sequence.toString().padStart(3, '0')}</span>
                        <span className="font-semibold text-sm text-foreground">{event.event_type}</span>
                      </div>
                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-sm text-xs font-medium ${
                        event.is_valid
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                          : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                      }`}>
                        {event.is_valid ? (
                          <>
                            <CheckCircle className="w-3 h-3" />
                            Valid
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            Invalid
                          </>
                        )}
                      </div>
                    </div>

                    <p className="text-xs text-muted-foreground mb-2">
                      {new Date(event.event_time).toLocaleString()}
                    </p>

                    {/* Hash Details */}
                    {(event.expected_hash || event.actual_hash) && (
                      <div className="space-y-1 text-xs">
                        {event.expected_hash && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Expected Hash:</span>
                            <span className="font-mono block break-all text-muted-foreground/80 mt-0.5">{event.expected_hash.slice(0, 40)}...</span>
                          </p>
                        )}
                        {event.actual_hash && (
                          <p className="text-muted-foreground">
                            <span className="font-medium">Actual Hash:</span>
                            <span className={`font-mono block break-all mt-0.5 ${
                              event.is_valid ? 'text-muted-foreground/80' : 'text-red-600 dark:text-red-400'
                            }`}>{event.actual_hash.slice(0, 40)}...</span>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Error Details */}
                    {!event.is_valid && event.error_type && (
                      <div className="mt-2 p-2 bg-red-100/50 dark:bg-red-900/30 rounded border border-red-200 dark:border-red-800">
                        <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">{event.error_type}</p>
                        {event.error_message && (
                          <p className="text-xs text-red-600 dark:text-red-300">{event.error_message}</p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">No events to display</p>
            )}
          </div>

          {/* Invalid Events Summary */}
          {verification.invalid_events > 0 && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-sm p-3 mb-3">
              <h2 className="text-sm font-semibold text-red-900 dark:text-red-200 mb-2">
                Chain Integrity Issues ({verification.invalid_events} {verification.invalid_events === 1 ? 'issue' : 'issues'})
              </h2>
              <p className="text-xs text-red-800 dark:text-red-300 mb-2">
                {verification.invalid_events} event{verification.invalid_events !== 1 ? 's' : ''} failed verification. See Event Chain Timeline above for details.
              </p>
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
