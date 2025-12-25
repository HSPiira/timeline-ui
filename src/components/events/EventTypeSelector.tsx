import { useEffect, useState } from 'react'
import { timelineApi } from '@/lib/api-client'
import { getApiErrorMessage } from '@/lib/api-utils'
import { Select } from '@/components/ui/select'
import type { EventResponse, EventSchemaResponse } from '@/lib/types'

type Props = {
	value?: string
	onChange: (v: string) => void
}

export default function EventTypeSelector({ value, onChange }: Props) {
	const [types, setTypes] = useState<string[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		let mounted = true
		const load = async () => {
			setLoading(true)
			setError(null)
			try {
				const res = await timelineApi.eventSchemas.list()
				if (!mounted) return
				if (res.error) {
					// fallback to events list
					const ev = await timelineApi.events.listAll()
					if (ev.data) {
						const t = [...new Set(ev.data.map((e: EventResponse) => e.event_type))]
						setTypes(t)
					} else if (ev.error) {
						setError(getApiErrorMessage(ev.error, 'Failed to load event types'))
					}
				} else if (res.data) {
					const t = [...new Set(res.data.map((s: EventSchemaResponse) => s.event_type).filter(Boolean))]
					setTypes(t)
				}
			} catch (err) {
				if (mounted) {
					setError(getApiErrorMessage(err, 'An unexpected error occurred'))
				}
			} finally {
				if (mounted) {
					setLoading(false)
				}
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	return (
		<Select
			value={value}
			onChange={(e) => onChange(e.target.value)}
			error={error || undefined}
			disabled={loading}
		>
			<option value="">Select event type</option>
			{loading ? (
				<option value="">Loading...</option>
			) : (
				types.map((t) => (
					<option key={t} value={t}>{t}</option>
				))
			)}
		</Select>
	)
}
