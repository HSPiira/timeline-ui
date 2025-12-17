import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({ component: App })

function App() {
  return (
    <div className="min-h-screen">
      <h1 className="text-4xl font-bold p-8">Timeline UI</h1>
    </div>
  )
}
