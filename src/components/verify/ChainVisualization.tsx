import { CheckCircle, AlertTriangle, Link2 } from 'lucide-react'
import type { components } from '@/lib/timeline-api'

type EventResponse = components['schemas']['EventResponse']

interface ChainVisualizationProps {
  events: Array<EventResponse & { verified: boolean; expectedHash: string; actualHash: string }>
  tamperedIndices: number[]
}

export function ChainVisualization({ events, tamperedIndices }: ChainVisualizationProps) {
  const isTampered = (index: number) => tamperedIndices.includes(index)
  const isGenesis = (index: number) => index === 0

  return (
    <div className="space-y-1">
      {events.map((event, index) => {
        const tampered = isTampered(index)
        const genesis = isGenesis(index)

        return (
          <div key={event.id}>
            {/* Event Node */}
            <div
              className={`relative p-4 border rounded-sm transition-colors ${
                tampered
                  ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                  : 'bg-background border-border hover:bg-muted/50'
              }`}
            >
              <div className="flex items-start gap-3">
                {/* Status Icon */}
                <div className="flex-shrink-0 pt-1">
                  {genesis ? (
                    <div className="w-8 h-8 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">G</span>
                    </div>
                  ) : tampered ? (
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  ) : (
                    <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                  )}
                </div>

                {/* Event Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-muted-foreground">Event {index}</span>
                    {genesis && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-primary/20 text-primary rounded-sm">
                        Genesis
                      </span>
                    )}
                    {tampered && (
                      <span className="px-1.5 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-sm">
                        Tampered
                      </span>
                    )}
                  </div>

                  <h3 className="font-semibold text-foreground text-sm mb-2">{event.event_type}</h3>

                  <div className="grid gap-2 text-xs">
                    <p className="text-muted-foreground">
                      <span className="font-medium">Time:</span>{' '}
                      {new Date(event.event_time).toLocaleString()}
                    </p>

                    <p className="text-muted-foreground">
                      <span className="font-medium">Event ID:</span>
                      <br />
                      <span className="font-mono text-xs text-muted-foreground break-all">
                        {event.id.slice(0, 16)}...
                      </span>
                    </p>

                    {/* Hash Information */}
                    <div className="space-y-1 p-2 bg-background/50 rounded border border-border/50">
                      {!genesis && (
                        <div>
                          <p className="font-medium text-muted-foreground mb-1">Previous Hash:</p>
                          <code className="text-xs font-mono text-muted-foreground break-all block p-1 bg-background rounded">
                            {(event as any).previous_hash?.slice(0, 32) || 'N/A'}...
                          </code>
                        </div>
                      )}

                      <div>
                        <p className="font-medium text-muted-foreground mb-1">
                          {tampered ? 'Expected Hash:' : 'Hash:'}
                        </p>
                        <code
                          className={`text-xs font-mono break-all block p-1 rounded ${
                            tampered
                              ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                              : 'bg-background text-muted-foreground'
                          }`}
                        >
                          {(event as any).expected_hash?.slice(0, 32) ||
                            event.hash?.slice(0, 32) ||
                            'N/A'}
                          ...
                        </code>
                      </div>

                      {tampered && (
                        <div>
                          <p className="font-medium text-red-700 dark:text-red-300 mb-1">Actual Hash:</p>
                          <code className="text-xs font-mono text-red-600 dark:text-red-400 break-all block p-1 bg-red-50 dark:bg-red-900/20 rounded">
                            {(event as any).actual_hash?.slice(0, 32) || 'N/A'}...
                          </code>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Chain Link */}
            {index < events.length - 1 && (
              <div className="flex items-center justify-center py-1">
                <div
                  className={`flex items-center gap-1 text-xs font-medium ${
                    isTampered(index + 1)
                      ? 'text-red-600 dark:text-red-400'
                      : 'text-muted-foreground'
                  }`}
                >
                  <Link2 className="w-3 h-3 transform -rotate-90" />
                  Chain Link
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
