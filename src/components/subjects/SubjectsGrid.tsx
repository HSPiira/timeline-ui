import { useNavigate } from '@tanstack/react-router'
import { Calendar, Tag, ArrowRight, Activity, Pencil } from 'lucide-react'
import type { SubjectWithMetadata } from '@/hooks/useSubjects'
import { User, Users, Building2, ShoppingCart, FolderKanban, FileText, Package, type LucideIcon } from 'lucide-react'

// Helper to get icon and color for subject type
function getSubjectIcon(
  subjectType: string
): { icon: LucideIcon; bgColor: string; textColor: string } {
  const type = subjectType.toLowerCase()

  const iconMap: Record<string, { icon: LucideIcon; bgColor: string; textColor: string }> = {
    user: { icon: User, bgColor: 'bg-blue-100 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400' },
    users: { icon: Users, bgColor: 'bg-blue-100 dark:bg-blue-900/20', textColor: 'text-blue-600 dark:text-blue-400' },
    customer: { icon: Building2, bgColor: 'bg-purple-100 dark:bg-purple-900/20', textColor: 'text-purple-600 dark:text-purple-400' },
    order: { icon: ShoppingCart, bgColor: 'bg-green-100 dark:bg-green-900/20', textColor: 'text-green-600 dark:text-green-400' },
    project: { icon: FolderKanban, bgColor: 'bg-orange-100 dark:bg-orange-900/20', textColor: 'text-orange-600 dark:text-orange-400' },
    invoice: { icon: FileText, bgColor: 'bg-amber-100 dark:bg-amber-900/20', textColor: 'text-amber-600 dark:text-amber-400' },
    shipment: { icon: Package, bgColor: 'bg-cyan-100 dark:bg-cyan-900/20', textColor: 'text-cyan-600 dark:text-cyan-400' },
    package: { icon: Package, bgColor: 'bg-cyan-100 dark:bg-cyan-900/20', textColor: 'text-cyan-600 dark:text-cyan-400' },
  }

  return iconMap[type] || { icon: Tag, bgColor: 'bg-gray-100 dark:bg-gray-900/20', textColor: 'text-gray-600 dark:text-gray-400' }
}

interface SubjectsGridProps {
  data: SubjectWithMetadata[]
  onEdit?: (subject: SubjectWithMetadata) => void
}

export function SubjectsGrid({ data, onEdit }: SubjectsGridProps) {
  const navigate = useNavigate()

  const handleSubjectClick = (subjectId: string) => {
    navigate({ to: `/events/subject/${subjectId}` })
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {data.map((subject) => {
        const { icon: Icon, bgColor, textColor } = getSubjectIcon(subject.subject_type)
        const createdDate = new Date(subject.created_at).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })

        return (
          <div
            key={subject.id}
            onClick={() => handleSubjectClick(subject.id)}
            className="bg-card/80 backdrop-blur-sm rounded-sm border border-border/50 hover:border-primary/50 transition-all hover:shadow-md cursor-pointer overflow-hidden group"
          >
            {/* Header with icon and type */}
            <div className="p-4 border-b border-border/30">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className={`w-10 h-10 rounded-sm ${bgColor} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-5 h-5 ${textColor}`} />
                </div>
                <div className="px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                  {subject.subject_type}
                </div>
              </div>

              {/* Subject ID */}
              <h3 className="font-semibold text-foreground truncate text-sm mb-1 group-hover:text-primary transition-colors">
                {subject.id}
              </h3>

              {/* External Reference */}
              {subject.external_ref && (
                <p className="text-xs text-muted-foreground truncate">
                  Ref: {subject.external_ref}
                </p>
              )}
            </div>

            {/* Body with metadata */}
            <div className="p-4 space-y-3">
              {/* Created Date */}
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="w-4 h-4 text-muted-foreground/60" />
                <span className="text-muted-foreground">Created {createdDate}</span>
              </div>

              {/* Events Count */}
              <div className="flex items-center gap-2 text-xs">
                <Activity className="w-4 h-4 text-muted-foreground/60" />
                <span className="text-muted-foreground">
                  {subject.eventCount} event{subject.eventCount !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Last Event Date */}
              {subject.lastEventDate && (
                <div className="flex items-center gap-2 text-xs">
                  <Calendar className="w-4 h-4 text-muted-foreground/60" />
                  <span className="text-muted-foreground">
                    Last event {new Date(subject.lastEventDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              )}
            </div>

            {/* Footer with action hint */}
            <div className="px-4 py-3 bg-muted/30 border-t border-border/30 flex items-center justify-between group-hover:bg-muted/50 transition-colors">
              <span className="text-xs font-medium text-muted-foreground">View details</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    onEdit?.(subject)
                  }}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  title="Edit subject"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <ArrowRight className="w-4 h-4 text-muted-foreground/60 group-hover:text-primary transition-colors group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
