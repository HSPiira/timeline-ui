import type { EventResponse } from './types'

export const dummyEvents: EventResponse[] = [
  {
    id: 'evt_001',
    subject_id: 'subj_user_12345',
    event_type: 'user.logged_in',
    event_time: '2024-12-18T14:30:00Z',
    payload: { ip_address: '192.168.1.100', device: 'desktop', browser: 'Chrome' },
    tenant_id: 'tenant_001'
  },
  {
    id: 'evt_002',
    subject_id: 'subj_order_67890',
    event_type: 'order.shipped',
    event_time: '2024-12-18T13:15:00Z',
    payload: { carrier: 'FedEx', tracking_number: '1Z999AA10123456784', destination: 'New York' },
    tenant_id: 'tenant_001'
  },
  {
    id: 'evt_003',
    subject_id: 'subj_user_12345',
    event_type: 'user.profile_updated',
    event_time: '2024-12-18T11:45:00Z',
    payload: { field: 'bio', old_value: null, new_value: 'Software Developer at TechCorp' },
    tenant_id: 'tenant_001'
  },
  {
    id: 'evt_004',
    subject_id: 'subj_project_abc123',
    event_type: 'project.milestone_completed',
    event_time: '2024-12-18T10:20:00Z',
    payload: { milestone: 'Phase 1 - Authentication', completion_rate: '100%', team_size: 3 },
    tenant_id: 'tenant_001'
  },
  {
    id: 'evt_005',
    subject_id: 'subj_order_67890',
    event_type: 'order.placed',
    event_time: '2024-12-17T16:00:00Z',
    payload: { total_amount: 299.99, items_count: 3, payment_method: 'credit_card' },
    tenant_id: 'tenant_001'
  }
]

export const dummyStats = {
  totalSubjects: 3,
  subjectsThisWeek: 2,
  totalEvents: 5,
  activeWorkflows: 0
}
