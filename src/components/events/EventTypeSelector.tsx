import { useEffect, useState } from 'react'
import { timelineApi } from '@/lib/api-client'

type Props = {
	value?: string
	onChange: (v: string) => void
}

export default function EventTypeSelector({ value, onChange }: Props) {
	const [types, setTypes] = useState<string[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		let mounted = true
		const load = async () => {
			setLoading(true)
			try {
				const res = await timelineApi.eventSchemas.list()
				if (!mounted) return
				if (res.error) {
					// fallback to events list
					const ev = await timelineApi.events.listAll()
					if (ev.data) {
						const t = [...new Set(ev.data.map((e: any) => e.event_type))]
						setTypes(t)
					}
				} else if (res.data) {
					const t = [...new Set(res.data.map((s: any) => s.event_type).filter(Boolean))]
					setTypes(t)
				}
			} catch (err) {
				console.error(err)
			} finally {
				setLoading(false)
			}
		}
		load()
		return () => { mounted = false }
	}, [])

	return (
		<div>
			<select value={value} onChange={(e) => onChange(e.target.value)} className="w-full px-3 py-2 bg-background border border-input rounded-sm">
				<option value="">Select event type</option>
				{loading ? (
					<option value="">Loading...</option>
				) : (
					types.map((t) => (
						<option key={t} value={t}>{t}</option>
					))
				)}
			</select>
		</div>
	)
}
