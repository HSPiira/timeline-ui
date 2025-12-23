import { useEffect, useState } from 'react'
import { timelineApi } from '@/lib/api-client'

type Props = {
	value?: string
	onChange: (v: string) => void
}

export default function SubjectSelector({ value, onChange }: Props) {
	const [subjects, setSubjects] = useState<any[]>([])
	const [loading, setLoading] = useState(false)

	useEffect(() => {
		let mounted = true
		const load = async () => {
			setLoading(true)
			try {
				const res = await timelineApi.subjects.list()
				if (!mounted) return
				if (res.data) {
					setSubjects(res.data)
				}
			} catch (err) {
				console.error('Failed to load subjects', err)
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
				<option value="">Select subject</option>
				{loading ? (
					<option value="">Loading...</option>
				) : (
					subjects.map((s) => (
						<option key={s.id} value={s.id}>
							{((s as any).subject_type || (s as any).type || 'subject')} - {((s as any).name) || s.id.slice(0,8)}
						</option>
					))
				)}
			</select>
		</div>
	)
}
