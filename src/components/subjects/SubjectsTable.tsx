import {
    flexRender,
    getCoreRowModel,
    useReactTable,
  } from '@tanstack/react-table'
  import type { ColumnDef } from '@tanstack/react-table'
  import type { SubjectResponse } from '@/lib/types'
  import {
      Users,
      Calendar,
      Tag,
      ShoppingCart,
      FolderKanban,
      FileText,
      Package,
      Building2,
      User,
      LucideIcon,
    } from 'lucide-react'
  import { useNavigate } from '@tanstack/react-router'
  
  
  // Helper to get icon and color for subject type
  function getSubjectIcon(
      subjectType: string
    ): { icon: LucideIcon; gradient: string } {
      const type = subjectType.toLowerCase()
    
      // Map subject types to icons and gradients
      const iconMap: Record<string, { icon: LucideIcon; gradient: string }> = {
        user: { icon: User, gradient: 'from-foreground/80 to-foreground/60' },
        users: { icon: Users, gradient: 'from-foreground/80 to-foreground/60' },
        customer: { icon: Building2, gradient: 'from-foreground/70 to-foreground/50' },
        order: { icon: ShoppingCart, gradient: 'from-foreground/75 to-foreground/55' },
        project: { icon: FolderKanban, gradient: 'from-foreground/70 to-foreground/50' },
        invoice: { icon: FileText, gradient: 'from-foreground/75 to-foreground/55' },
        shipment: { icon: Package, gradient: 'from-foreground/80 to-foreground/60' },
        package: { icon: Package, gradient: 'from-foreground/80 to-foreground/60' },
      }
    
      // Return specific icon or default
      return iconMap[type] || { icon: Tag, gradient: 'from-foreground/70 to-foreground/50' }
    }
  
  const columns: ColumnDef<SubjectResponse>[] = [
    {
      accessorKey: 'id',
      header: 'Subject',
      cell: ({ row }) => {
        const subject = row.original
        const { icon: Icon, gradient } = getSubjectIcon(subject.subject_type)
        return (
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-sm bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}
            >
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="font-medium text-foreground truncate">{subject.id}</p>
              {subject.external_ref && (
                <p className="text-sm text-muted-foreground truncate">
                  {subject.external_ref}
                </p>
              )}
            </div>
          </div>
        )
      },
    },
    {
      accessorKey: 'subject_type',
      header: 'Type',
      cell: ({ row }) => {
          const subject = row.original
          return (
              <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-muted-foreground/70" />
                  <span className="text-sm font-medium text-foreground/90">
                  {subject.subject_type}
                  </span>
              </div>
          )
      }
    },
    {
      accessorKey: 'events',
      header: 'Events',
      cell: () => {
          return (
              <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground/70" />
                  <span className="text-sm text-muted-foreground">-</span>
              </div>
          )
      }
    },
    {
      accessorKey: 'created_at',
      header: 'Created',
      cell: ({ row }) => {
          const subject = row.original
          return (
              <span className="text-sm text-muted-foreground">
                  {new Date(subject.created_at).toLocaleDateString()}
              </span>
          )
      }
    },
  ]
  
  interface SubjectsTableProps {
    data: SubjectResponse[]
  }
  
  export function SubjectsTable({ data }: SubjectsTableProps) {
      const navigate = useNavigate()
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
    })
  
    const handleSubjectClick = (subjectId: string) => {
      navigate({ to: `/events/subject/${subjectId}` })
    }
  
    return (
      <div className="bg-card/80 backdrop-blur-sm rounded-sm border border-border/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted/50 border-b">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    className="px-6 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-border">
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} onClick={() => handleSubjectClick(row.original.id)} className="hover:bg-muted/30/50 transition-colors cursor-pointer">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-6 py-2.5">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }
  