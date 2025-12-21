import { LucideIcon, TrendingUp } from "lucide-react"

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
    return (
        <div className="bg-card/80 rounded-sm p-6 border border-border/50">
          <div className="flex justify-between">
            <div>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="text-3xl font-bold">{value}</p>
              <p className="text-xs text-muted-foreground flex gap-1 mt-2">
                <TrendingUp className="w-3 h-3" />
                {subtitle}
              </p>
            </div>
            <Icon className="w-10 h-10" />
          </div>
        </div>
      )
    }