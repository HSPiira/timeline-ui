import { type LucideIcon, TrendingUp } from "lucide-react"

type StatCardProps = {
    label: string
    value: number | string
    subtitle: string
    icon: LucideIcon
}

export function StatCard({
    label,
    value,
    subtitle,
    icon: Icon
}: StatCardProps) {
    // Determine color scheme based on label
    const getColorScheme = (label: string) => {
      if (label.includes('Subject')) return {
        border: 'border-purple-200 dark:border-purple-900',
        bg: 'bg-gradient-to-br from-purple-50/50 to-purple-100/30 dark:from-purple-950/20 dark:to-purple-900/10',
        icon: 'text-purple-600 dark:text-purple-400',
        accent: 'text-purple-700 dark:text-purple-300'
      }
      if (label.includes('Event')) return {
        border: 'border-cyan-200 dark:border-cyan-900',
        bg: 'bg-gradient-to-br from-cyan-50/50 to-cyan-100/30 dark:from-cyan-950/20 dark:to-cyan-900/10',
        icon: 'text-cyan-600 dark:text-cyan-400',
        accent: 'text-cyan-700 dark:text-cyan-300'
      }
      return {
        border: 'border-emerald-200 dark:border-emerald-900',
        bg: 'bg-gradient-to-br from-emerald-50/50 to-emerald-100/30 dark:from-emerald-950/20 dark:to-emerald-900/10',
        icon: 'text-emerald-600 dark:text-emerald-400',
        accent: 'text-emerald-700 dark:text-emerald-300'
      }
    }

    const colors = getColorScheme(label)

    return (
        <div className={`${colors.bg} rounded-sm p-6 border ${colors.border} transition-all hover:shadow-md hover:border-opacity-100`}>
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className={`text-3xl font-bold ${colors.accent}`}>{value}</p>
              <p className="text-xs text-muted-foreground flex gap-1 mt-2">
                <TrendingUp className="w-3 h-3" />
                {subtitle}
              </p>
            </div>
            <Icon className={`w-10 h-10 ${colors.icon}`} />
          </div>
        </div>
      )
    }