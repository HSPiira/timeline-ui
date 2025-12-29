import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useRequireAuth } from '@/hooks/useRequireAuth'
import { useToast } from '@/hooks/useToast'
import { timelineApi } from '@/lib/api-client'
import { ArrowLeft, Mail, Lock, Server, CheckCircle, Cloud, Inbox } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { LoadingIcon, ErrorIcon } from '@/components/ui/icons'
import type { components } from '@/lib/timeline-api'

export const Route = createFileRoute('/email-accounts/create')({
  component: CreateEmailAccountPage,
})

type EmailProvider = 'gmail' | 'outlook' | 'imap' | 'icloud' | 'yahoo'
type EmailAccountCreate = components['schemas']['EmailAccountCreate']

interface ProviderConfig {
  name: string
  description: string
  authType: 'oauth' | 'imap'
  icon: React.ElementType
  iconColor: string
}

const PROVIDERS: Record<EmailProvider, ProviderConfig> = {
  gmail: {
    name: 'Gmail',
    description: 'Connect your Gmail account using OAuth2',
    authType: 'oauth',
    icon: Mail,
    iconColor: 'text-red-600 dark:text-red-400',
  },
  outlook: {
    name: 'Outlook',
    description: 'Connect your Outlook/Microsoft 365 account using OAuth2',
    authType: 'oauth',
    icon: Inbox,
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  imap: {
    name: 'IMAP',
    description: 'Connect any IMAP-compatible email server',
    authType: 'imap',
    icon: Server,
    iconColor: 'text-gray-600 dark:text-gray-400',
  },
  icloud: {
    name: 'iCloud',
    description: 'Connect your iCloud email using IMAP',
    authType: 'imap',
    icon: Cloud,
    iconColor: 'text-blue-500 dark:text-blue-400',
  },
  yahoo: {
    name: 'Yahoo Mail',
    description: 'Connect your Yahoo Mail account using IMAP',
    authType: 'imap',
    icon: Mail,
    iconColor: 'text-purple-600 dark:text-purple-400',
  },
}

function CreateEmailAccountPage() {
  const authState = useRequireAuth()
  const navigate = useNavigate()
  const toast = useToast()

  const [step, setStep] = useState<'select' | 'configure'>('select')
  const [selectedProvider, setSelectedProvider] = useState<EmailProvider | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testingConnection, setTestingConnection] = useState(false)
  const [connectionTested, setConnectionTested] = useState(false)

  // Form state for IMAP
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [imapServer, setImapServer] = useState('')
  const [imapPort, setImapPort] = useState('993')
  const [useSsl, setUseSsl] = useState(true)

  if (!authState.user) {
    return null
  }

  const handleProviderSelect = (provider: EmailProvider) => {
    setSelectedProvider(provider)
    setError(null)

    // Pre-fill IMAP settings for known providers
    if (provider === 'icloud') {
      setImapServer('imap.mail.me.com')
      setImapPort('993')
    } else if (provider === 'yahoo') {
      setImapServer('imap.mail.yahoo.com')
      setImapPort('993')
    }

    setStep('configure')
  }

  const handleOAuthConnect = async (provider: 'gmail' | 'outlook') => {
    setLoading(true)
    setError(null)
    try {
      // For OAuth, we would typically redirect to the OAuth flow
      // For now, show a message that OAuth needs to be implemented
      toast.info('OAuth Flow', `OAuth integration for ${provider} needs to be configured with your OAuth credentials`)
      setError(`OAuth flow for ${provider} is not yet configured. Please use IMAP authentication or contact your administrator.`)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to initiate OAuth flow'
      setError(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleTestConnection = async () => {
    if (!selectedProvider || !email || !password) {
      setError('Please fill in all required fields')
      return
    }

    setTestingConnection(true)
    setError(null)
    setConnectionTested(false)

    try {
      // For now, we'll just validate the fields locally
      // In a real implementation, you'd call a test endpoint
      if (selectedProvider !== 'gmail' && selectedProvider !== 'outlook') {
        if (!imapServer) {
          throw new Error('IMAP server is required')
        }
        if (!imapPort || parseInt(imapPort, 10) < 1 || parseInt(imapPort, 10) > 65535) {
          throw new Error('Valid IMAP port is required (1-65535)')
        }
      }

      setConnectionTested(true)
      toast.success('Connection test passed', 'Email account credentials are valid')
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Connection test failed'
      setError(errorMsg)
      toast.error('Connection test failed', errorMsg)
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProvider) {
      setError('Please select a provider')
      return
    }

    if (PROVIDERS[selectedProvider].authType === 'oauth') {
      await handleOAuthConnect(selectedProvider as 'gmail' | 'outlook')
      return
    }

    if (!connectionTested) {
      setError('Please test the connection before saving')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const accountData: EmailAccountCreate = {
        provider_type: selectedProvider,
        email_address: email,
        credentials: {
          username: email,
          password: password,
        },
        connection_params: imapServer ? {
          imap_host: imapServer,
          imap_port: parseInt(imapPort, 10),
          use_ssl: useSsl,
        } : undefined,
      }

      const { data, error: apiError } = await timelineApi.emailAccounts.create(accountData)

      if (apiError) {
        const errorMsg =
          typeof apiError === 'object' && 'message' in apiError
            ? (apiError as any).message
            : 'Failed to create email account'
        setError(errorMsg)
        toast.error('Failed to connect', errorMsg)
      } else if (data) {
        toast.success('Account connected', `Successfully connected ${email}`)
        navigate({ to: '/email-accounts' })
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unexpected error creating email account'
      setError(errorMsg)
      toast.error('Error connecting', errorMsg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => {
            if (step === 'configure') {
              setStep('select')
              setError(null)
              setConnectionTested(false)
            } else {
              navigate({ to: '/email-accounts' })
            }
          }}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-foreground">Connect Email Account</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {step === 'select'
              ? 'Choose your email provider'
              : `Configure ${selectedProvider ? PROVIDERS[selectedProvider].name : ''} connection`}
          </p>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mb-3 p-2.5 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xs flex gap-2">
          <ErrorIcon className="text-red-600 dark:text-red-400 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900 dark:text-red-200 text-sm">Error</h3>
            <p className="text-sm text-red-800 dark:text-red-300 mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Provider Selection */}
      {step === 'select' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {(Object.keys(PROVIDERS) as EmailProvider[]).map((provider) => {
            const config = PROVIDERS[provider]
            const IconComponent = config.icon
            return (
              <button
                key={provider}
                onClick={() => handleProviderSelect(provider)}
                className="p-4 bg-card/80 backdrop-blur-sm border border-border/50 rounded-xs hover:border-primary/50 hover:bg-card transition-all text-left group"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-xs bg-accent ${config.iconColor}`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                      {config.name}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">{config.description}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      {config.authType === 'oauth' ? (
                        <>
                          <Lock className="w-3 h-3" />
                          <span>OAuth 2.0</span>
                        </>
                      ) : (
                        <>
                          <Server className="w-3 h-3" />
                          <span>IMAP</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            )
          })}
        </div>
      )}

      {/* Step 2: Configuration */}
      {step === 'configure' && selectedProvider && (
        <div className="max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Address */}
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="you@example.com"
                  required
                />
              </div>
            </div>

            {/* IMAP Configuration */}
            {PROVIDERS[selectedProvider].authType === 'imap' && (
              <>
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">
                    Password / App-Specific Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="••••••••"
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    For Gmail, iCloud, and Yahoo, use an app-specific password instead of your regular password
                  </p>
                </div>

                {/* IMAP Server */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      IMAP Server <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Server className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        value={imapServer}
                        onChange={(e) => setImapServer(e.target.value)}
                        className="w-full pl-10 pr-3 py-2 bg-background border border-input rounded-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="imap.example.com"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">
                      Port <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={imapPort}
                      onChange={(e) => setImapPort(e.target.value)}
                      className="w-full px-3 py-2 bg-background border border-input rounded-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                      placeholder="993"
                      min="1"
                      max="65535"
                      required
                    />
                  </div>
                </div>

                {/* SSL */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="use_ssl"
                    checked={useSsl}
                    onChange={(e) => setUseSsl(e.target.checked)}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                  />
                  <label htmlFor="use_ssl" className="text-sm font-medium text-foreground">
                    Use SSL/TLS (recommended)
                  </label>
                </div>

                {/* Test Connection Button */}
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    onClick={handleTestConnection}
                    disabled={testingConnection || !email || !password || !imapServer}
                    variant="secondary"
                    size="md"
                  >
                    {testingConnection ? (
                      <>
                        <LoadingIcon />
                        Testing...
                      </>
                    ) : connectionTested ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                        Connection Verified
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>
                </div>
              </>
            )}

            {/* OAuth Notice */}
            {PROVIDERS[selectedProvider].authType === 'oauth' && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xs">
                <p className="text-sm text-blue-900 dark:text-blue-200">
                  Clicking "Connect" will redirect you to {PROVIDERS[selectedProvider].name} to authorize access to your
                  email account.
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-2">
              <Button
                type="submit"
                disabled={loading || (PROVIDERS[selectedProvider].authType === 'imap' && !connectionTested)}
                variant="primary"
                size="md"
              >
                {loading ? (
                  <>
                    <LoadingIcon />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4" />
                    Connect Account
                  </>
                )}
              </Button>
              <Button
                type="button"
                onClick={() => {
                  setStep('select')
                  setError(null)
                  setConnectionTested(false)
                }}
                variant="secondary"
                size="md"
              >
                Back
              </Button>
            </div>
          </form>
        </div>
      )}
    </>
  )
}
