import { createFileRoute } from '@tanstack/react-router'
import { Plus, Users, Calendar, Tag } from 'lucide-react'

export const Route = createFileRoute('/subjects/')({
  component: SubjectsPage,
})

function SubjectsPage() {
  // TODO: Fetch subjects from API
  const subjects = []

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent mb-2">
              Subjects
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage entities and their event timelines
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
            <Plus className="w-4 h-4" />
            Create Subject
          </button>
        </div>

        {/* Empty State or Subjects List */}
        {subjects.length === 0 ? (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm p-12 border border-slate-200/50 dark:border-slate-700/50 text-center">
            <div className="w-16 h-16 rounded-sm bg-slate-100 dark:bg-slate-700 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-slate-400 dark:text-slate-500" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">
              No subjects yet
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-md mx-auto">
              Create your first subject to start tracking events. Subjects represent entities with timelines like users, orders, or projects.
            </p>
            <button className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-sm font-medium hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors">
              <Plus className="w-4 h-4" />
              Create Your First Subject
            </button>
          </div>
        ) : (
          <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-sm border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <div className="col-span-4 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Subject
              </div>
              <div className="col-span-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Type
              </div>
              <div className="col-span-2 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Events
              </div>
              <div className="col-span-3 text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
                Created
              </div>
            </div>

            {/* Table Body */}
            <div className="divide-y divide-slate-200 dark:divide-slate-700">
              {subjects.map((subject: any) => (
                <button
                  key={subject.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 w-full text-left hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="col-span-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {subject.id}
                        </p>
                        {subject.external_ref && (
                          <p className="text-sm text-slate-500 dark:text-slate-500">
                            {subject.external_ref}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {subject.subject_type}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <span className="text-sm text-slate-600 dark:text-slate-400">
                        {subject.event_count || 0}
                      </span>
                    </div>
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      {new Date(subject.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
