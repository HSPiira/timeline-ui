# Timeline UI - Project TODO

**Last Updated**: December 22, 2024
**Project**: Timeline Event Sourcing System - React Frontend
**Backend**: FastAPI with multi-tenant event sourcing architecture

---

## 📊 Implementation Status Overview

### Backend Status (from ~/dev/timeline)
| Feature | Status | API Available |
|---------|--------|--------------|
| Multi-Tenancy | ✅ Complete | Yes |
| User Authentication | ✅ Complete | Yes |
| Subject Management | ✅ Complete | Yes |
| Event Sourcing | ✅ Complete | Yes |
| Cryptographic Chaining | ✅ Complete | Yes |
| Schema Registry | ✅ Complete | Yes |
| Document Storage | ✅ Complete | Yes |
| RBAC System | ✅ Complete | Yes |
| Workflows | ✅ Complete | Yes |
| Email Integration | ✅ Complete | Yes |

### Frontend Status (ui.timeline)
| Feature | Status | Route/Component |
|---------|--------|----------------|
| Authentication | ✅ Complete | `/login`, `/register` |
| Dashboard | 🟡 Partial | `/` - using dummy data |
| Subjects List | ✅ Complete | `/subjects` |
| Subject Detail | ✅ Complete | `/events/subject/$subjectId` |
| Events List | ✅ Complete | `/events` |
| Event Detail (by Subject) | ✅ Complete | `/events/subject/$subjectId` |
| Event Creation | ❌ Missing | - |
| Subject Creation | ✅ Complete | `/subjects` (modal) |
| Document Upload | ❌ Missing | - |
| Event Schemas | ❌ Missing | - |
| Workflows | ❌ Missing | - |
| Email Accounts | ❌ Missing | - |
| RBAC Management | ❌ Missing | - |
| Chain Verification | ❌ Missing | - |

---

## 🎯 Priority Tasks

### P0 - Critical (Required for MVP)

#### 1. Connect Dashboard to Real API ⭐
**File**: `src/routes/index.tsx`

**Current State**: Using dummy data from `src/lib/dummy-data.ts`

**Tasks**:
- [ ] Remove dummy data imports
- [ ] Implement `useEffect` to fetch data on mount
- [ ] Add state for `events`, `subjects`, `workflows`
- [ ] Implement API calls:
  - [ ] `timelineApi.events.listAll()` - Get all events
  - [ ] `timelineApi.subjects.list()` - Get subjects count
  - [ ] `timelineApi.workflows.list()` - Get active workflows
- [ ] Add loading state with spinner
- [ ] Add error handling with retry button
- [ ] Calculate real stats:
  - [ ] Subjects this week (filter by `created_at`)
  - [ ] Events today (filter by `event_time`)
  - [ ] Active workflows (filter by `is_active`)
- [ ] Add refresh functionality

**Priority**: P0
**Estimated Effort**: 2-3 hours
**Dependencies**: Backend API running at `http://localhost:8000`

---

#### 2. Event Creation Form ⭐⭐
**Location**: Create `/src/routes/events/create.tsx`

**Features**:
- [ ] Create new route file
- [ ] Form layout with proper sections
- [ ] Subject selection dropdown:
  - [ ] Fetch subjects from API
  - [ ] Search/filter subjects
  - [ ] Display `subject_type` and `id`
- [ ] Event type input:
  - [ ] Text input or dropdown of existing types
  - [ ] Fetch from event schemas if available
- [ ] Event time picker:
  - [ ] DateTime picker component
  - [ ] Default to current time
  - [ ] Support backdating
- [ ] Dynamic payload form:
  - [ ] Fetch event schema for selected type
  - [ ] Generate form fields from JSON Schema
  - [ ] Validate inputs against schema
  - [ ] Support nested objects
- [ ] Form validation:
  - [ ] Required field validation
  - [ ] Type validation (number, string, etc.)
  - [ ] Schema compliance validation
- [ ] Submit handler:
  - [ ] Call `timelineApi.events.create()`
  - [ ] Show success message
  - [ ] Redirect to event timeline or subject page
- [ ] Error handling:
  - [ ] Display validation errors
  - [ ] Show API errors
  - [ ] Allow retry

**Additional Components**:
- [ ] Create `JsonSchemaForm.tsx` component for dynamic forms
- [ ] Create `SubjectSelector.tsx` component
- [ ] Create `EventTypeSelector.tsx` component

**Priority**: P0
**Estimated Effort**: 8-10 hours
**API Endpoint**: `POST /events/`
**Related**: Event Schemas needed for validation

---

#### 3. Document Upload & Management ⭐
**Location**: Create `/src/components/documents/`

**Components to Create**:
- [ ] `DocumentUpload.tsx`:
  - [ ] File input with drag & drop
  - [ ] File type validation
  - [ ] Size limit validation (100MB)
  - [ ] Upload progress indicator
  - [ ] Multiple file support
- [ ] `DocumentList.tsx`:
  - [ ] Table view of documents
  - [ ] Columns: filename, type, size, uploaded date
  - [ ] Download button per document
  - [ ] Delete button (soft delete)
  - [ ] Filter by document type
- [ ] `DocumentViewer.tsx`:
  - [ ] PDF preview
  - [ ] Image preview
  - [ ] Download option
  - [ ] Print option

**Integration Points**:
- [ ] Add document upload to Subject Detail page
- [ ] Add document upload to Event Creation form
- [ ] Add document list to Subject Detail page
- [ ] Show document indicators on events

**API Integration**:
- [ ] Upload: `POST /documents/upload`
- [ ] List by subject: `GET /documents/subject/{id}`
- [ ] List by event: `GET /documents/event/{id}`
- [ ] Get metadata: `GET /documents/{id}`
- [ ] Download: `GET /documents/{id}/download`
- [ ] Delete: `DELETE /documents/{id}` (soft delete)

**Priority**: P0
**Estimated Effort**: 8-10 hours
**Dependencies**: Backend document storage configured

---

### P1 - High Priority (Core Features)

#### 4. Event Schema Management
**Location**: Create `/src/routes/schemas/`

**Pages**:
- [ ] `/schemas/index.tsx` - List all schemas:
  - [ ] Table with columns: event_type, version, is_active, created_at
  - [ ] Filter by event type
  - [ ] Search functionality
  - [ ] Create new schema button
  - [ ] Edit/view schema actions
- [ ] `/schemas/create.tsx` - Create new schema:
  - [ ] Event type input
  - [ ] Version number (auto-increment)
  - [ ] JSON Schema editor (Monaco or textarea)
  - [ ] Schema validation
  - [ ] Preview form generation
  - [ ] Save & activate
- [ ] `/schemas/$schemaId.tsx` - View/edit schema:
  - [ ] Display schema details
  - [ ] JSON Schema editor
  - [ ] Version history
  - [ ] Activate/deactivate toggle
  - [ ] Delete (soft delete)

**Features**:
- [ ] JSON Schema validator
- [ ] Live preview of form generation
- [ ] Schema versioning support
- [ ] Migration guide between versions

**Priority**: P1
**Estimated Effort**: 10-12 hours
**API Endpoints**: `GET /event-schemas/`, `POST /event-schemas/`, `PATCH /event-schemas/{id}`

---

#### 5. Workflow Management
**Location**: Create `/src/routes/workflows/`

**Pages**:
- [ ] `/workflows/index.tsx` - List workflows:
  - [ ] Table view with name, trigger, status
  - [ ] Filter by event type
  - [ ] Active/inactive toggle
  - [ ] Create workflow button
  - [ ] View execution history
- [ ] `/workflows/create.tsx` - Create workflow:
  - [ ] Workflow name & description
  - [ ] Trigger configuration:
    - [ ] Event type selector
    - [ ] Condition builder (payload field matching)
  - [ ] Actions configuration:
    - [ ] Action type selector (create_event, etc.)
    - [ ] Action parameters form
    - [ ] Multiple actions support
  - [ ] Settings:
    - [ ] Execution order
    - [ ] Rate limiting (max executions per day)
    - [ ] Active/inactive
- [ ] `/workflows/$workflowId.tsx` - View/edit workflow:
  - [ ] Workflow details
  - [ ] Edit trigger & actions
  - [ ] Execution history table
  - [ ] Test workflow button
- [ ] `/workflows/$workflowId/executions.tsx` - Execution logs:
  - [ ] Execution list with status
  - [ ] Filter by date, status
  - [ ] Detailed execution log view
  - [ ] Actions executed/failed count
  - [ ] Error messages

**Features**:
- [ ] Visual workflow builder (drag & drop optional)
- [ ] Condition builder UI (field, operator, value)
- [ ] Action configuration forms
- [ ] Workflow testing without saving
- [ ] Execution log viewer with JSON diff

**Priority**: P1
**Estimated Effort**: 14-16 hours
**API Endpoints**: `GET /workflows/`, `POST /workflows/`, `GET /workflow-executions/`

---

#### 6. Cryptographic Chain Verification UI
**Location**: Create `/src/routes/verify/` and enhance Subject Detail

**Features**:
- [ ] Subject chain verification page:
  - [ ] Verify button on Subject Detail page
  - [ ] Call `GET /events/subject/{id}/verify`
  - [ ] Display verification result
  - [ ] Show integrity status (✅ Valid / ❌ Tampered)
- [ ] Chain visualization:
  - [ ] Timeline view showing hash links
  - [ ] Display `hash` and `previous_hash` for each event
  - [ ] Visual indicators for chain breaks
  - [ ] Highlight genesis event (first in chain)
- [ ] Hash comparison view:
  - [ ] Stored hash vs. computed hash
  - [ ] Show which events failed verification
  - [ ] Details about tampering location
- [ ] Export verification report:
  - [ ] PDF report with chain status
  - [ ] Include all hashes and verification results
  - [ ] Timestamp of verification

**Priority**: P1
**Estimated Effort**: 6-8 hours
**API Endpoint**: `GET /events/subject/{subject_id}/verify`

---

### P2 - Medium Priority (Enhanced Features)

#### 7. Email Integration UI
**Location**: Create `/src/routes/email-accounts/`

**Pages**:
- [ ] `/email-accounts/index.tsx` - List email accounts:
  - [ ] Table: email, provider, last sync, status
  - [ ] Connect new account button
  - [ ] Sync now button per account
  - [ ] View sync history
- [ ] `/email-accounts/create.tsx` - Connect email account:
  - [ ] Provider selection (Gmail, Outlook, IMAP, iCloud, Yahoo)
  - [ ] Gmail OAuth flow:
    - [ ] OAuth redirect
    - [ ] Handle callback
    - [ ] Store tokens
  - [ ] Outlook OAuth flow:
    - [ ] MSAL integration
    - [ ] Handle callback
  - [ ] IMAP credentials form:
    - [ ] Email address
    - [ ] Password (app-specific)
    - [ ] IMAP server & port
  - [ ] Test connection
  - [ ] Save account
- [ ] `/email-accounts/$accountId.tsx` - Account details:
  - [ ] Account info
  - [ ] Sync status & history
  - [ ] Manual sync button
  - [ ] Disconnect account
  - [ ] View email events timeline

**Features**:
- [ ] OAuth popup/redirect flow
- [ ] Credential encryption (handled by backend)
- [ ] Sync progress indicator
- [ ] Email events integration with main timeline
- [ ] Filter events by `event_type=email_received`

**Priority**: P2
**Estimated Effort**: 12-14 hours
**API Endpoints**: `GET /email-accounts/`, `POST /email-accounts/`, `POST /email-accounts/{id}/sync`

---

#### 8. RBAC & Permissions Management
**Location**: Create `/src/routes/admin/`

**Pages**:
- [ ] `/admin/roles/index.tsx` - List roles:
  - [ ] Table: role name, description, permissions count
  - [ ] Create role button
  - [ ] Edit/delete role
- [ ] `/admin/roles/create.tsx` - Create role:
  - [ ] Role name & description
  - [ ] Permission selector (multi-select)
  - [ ] Save role
- [ ] `/admin/roles/$roleId.tsx` - Edit role:
  - [ ] Update name & description
  - [ ] Add/remove permissions
  - [ ] View users with this role
- [ ] `/admin/permissions/index.tsx` - List permissions:
  - [ ] Table: permission name, resource, action
  - [ ] Create permission button
  - [ ] Filter by resource
- [ ] `/admin/users/$userId/roles.tsx` - Assign roles:
  - [ ] User info
  - [ ] Current roles list
  - [ ] Add role selector
  - [ ] Remove role button

**Features**:
- [ ] Permission matrix view
- [ ] Role hierarchy visualization
- [ ] User role assignment
- [ ] Permission-based UI rendering
- [ ] Protected routes

**Frontend Permission Checks**:
- [ ] Hide/show UI elements based on permissions
- [ ] Disable actions without permission
- [ ] Redirect unauthorized users
- [ ] Display permission denied message

**Priority**: P2
**Estimated Effort**: 10-12 hours
**API Endpoints**: `GET /roles/`, `POST /roles/`, `GET /permissions/`, `POST /user-roles/`

---

#### 9. Tenant Management (Admin Only)
**Location**: Create `/src/routes/admin/tenants/`

**Pages**:
- [ ] `/admin/tenants/index.tsx` - List tenants:
  - [ ] Table: code, name, status, created_at
  - [ ] Create tenant button
  - [ ] Suspend/activate tenant
  - [ ] View tenant details
- [ ] `/admin/tenants/create.tsx` - Create tenant:
  - [ ] Tenant code (unique)
  - [ ] Organization name
  - [ ] Status (active/suspended)
  - [ ] Create tenant
- [ ] `/admin/tenants/$tenantId.tsx` - Tenant details:
  - [ ] Tenant info
  - [ ] User count
  - [ ] Subject count
  - [ ] Event count
  - [ ] Update settings
  - [ ] Suspend/delete tenant

**Features**:
- [ ] Tenant status management
- [ ] Usage statistics per tenant
- [ ] Tenant configuration
- [ ] Superadmin only access

**Priority**: P2
**Estimated Effort**: 6-8 hours
**API Endpoints**: `GET /tenants/`, `POST /tenants/`, `PATCH /tenants/{id}`

---

### P3 - Low Priority (Polish & UX)

#### 10. Enhanced Dashboard Analytics
**File**: `src/routes/index.tsx`

**Features**:
- [ ] Event volume chart:
  - [ ] Line chart for last 7/30 days
  - [ ] Event count per day
  - [ ] Hover tooltips with details
- [ ] Event type distribution:
  - [ ] Pie chart of event types
  - [ ] Percentage breakdown
  - [ ] Click to filter
- [ ] Subject type breakdown:
  - [ ] Bar chart of subject types
  - [ ] Count per type
- [ ] Recent workflow executions:
  - [ ] List of last 10 executions
  - [ ] Status indicators
  - [ ] Link to workflow details
- [ ] System health indicators:
  - [ ] API status
  - [ ] Database status
  - [ ] Storage usage
- [ ] Quick actions section:
  - [ ] Create subject button
  - [ ] Log event button
  - [ ] Verify chain button

**Chart Library**: Recharts or Chart.js

**Priority**: P3
**Estimated Effort**: 8-10 hours

---

#### 11. Advanced Search & Filtering
**Location**: Enhance existing list pages

**Global Features**:
- [ ] Global search bar in header
- [ ] Search across subjects and events
- [ ] Advanced filter panel:
  - [ ] Date range picker
  - [ ] Event type multi-select
  - [ ] Subject type filter
  - [ ] Payload field filters
- [ ] Saved filters:
  - [ ] Save current filter as preset
  - [ ] Quick access to saved filters
  - [ ] Share filters via URL
- [ ] Export functionality:
  - [ ] Export results to CSV
  - [ ] Export to JSON
  - [ ] Include filters in export

**Priority**: P3
**Estimated Effort**: 8-10 hours

---

#### 12. User Profile & Settings
**Location**: Create `/src/routes/profile/`

**Pages**:
- [ ] `/profile/index.tsx` - User profile:
  - [ ] Display user info
  - [ ] Edit name, email
  - [ ] Avatar upload
  - [ ] Change password
- [ ] `/profile/settings.tsx` - User settings:
  - [ ] Email notifications
  - [ ] UI preferences (theme, language)
  - [ ] API tokens management
  - [ ] Activity log

**Features**:
- [ ] Profile picture upload
- [ ] Password change with validation
- [ ] API token generation
- [ ] Personal activity log viewer

**Priority**: P3
**Estimated Effort**: 6-8 hours

---

#### 13. Notifications System
**Location**: Create `/src/components/notifications/`

**Components**:
- [ ] `NotificationToast.tsx` - Toast notifications
- [ ] `NotificationCenter.tsx` - Notification panel
- [ ] `NotificationBell.tsx` - Bell icon with count

**Features**:
- [ ] Toast notifications for:
  - [ ] Event created
  - [ ] Subject created
  - [ ] Workflow executed
  - [ ] Document uploaded
  - [ ] Errors
- [ ] Notification center:
  - [ ] List of recent notifications
  - [ ] Mark as read
  - [ ] Clear all
- [ ] Real-time notifications (WebSocket optional)

**Priority**: P3
**Estimated Effort**: 6-8 hours

---

## 🔧 Technical Debt & Improvements

### Code Quality

#### Refactoring
- [ ] Extract event timeline to `<EventTimeline />` component
- [ ] Create shared form components:
  - [ ] `<DateTimePicker />`
  - [ ] `<SubjectSelector />`
  - [ ] `<EventTypeSelector />`
- [ ] Consolidate error handling patterns
- [ ] Standardize loading states
- [ ] Create custom hooks:
  - [ ] `useEvents()`
  - [ ] `useSubjects()`
  - [ ] `useWorkflows()`
  - [ ] `useEventSchemas()`

#### TypeScript
- [x] All components have proper TypeScript types
- [x] No `any` types in components
- [ ] Add JSDoc comments to utility functions
- [ ] Type guards for API responses
- [ ] Shared types package between frontend/backend
- [ ] Strict mode enabled

#### Testing
- [ ] Set up Vitest for unit tests
- [ ] Add React Testing Library
- [ ] Test authentication flows:
  - [ ] Login
  - [ ] Register
  - [ ] Logout
  - [ ] Token refresh
- [ ] Test CRUD operations:
  - [ ] Subject creation
  - [ ] Event creation
  - [ ] Document upload
- [ ] E2E tests with Playwright:
  - [ ] User journey tests
  - [ ] Critical path coverage
- [ ] API mocking with MSW

---

### Performance

#### Optimization
- [ ] Implement TanStack Query for caching:
  - [ ] Cache subjects list
  - [ ] Cache events
  - [ ] Cache event schemas
  - [ ] Cache workflows
  - [ ] Stale-while-revalidate strategy
- [ ] Add pagination:
  - [ ] Subjects list (100 per page)
  - [ ] Events list (50 per page)
  - [ ] Workflow executions (50 per page)
- [ ] Virtual scrolling:
  - [ ] Long event timelines
  - [ ] Large subject lists
- [ ] Debounce search inputs (300ms)
- [ ] Lazy load routes:
  - [ ] Code splitting per route
  - [ ] Suspense boundaries
- [ ] Bundle optimization:
  - [ ] Tree shaking
  - [ ] Dynamic imports
  - [ ] Minimize bundle size

#### Caching Strategy
- [ ] Cache TTL configuration
- [ ] Invalidation on mutations
- [ ] Optimistic updates for:
  - [ ] Event creation
  - [ ] Subject creation
  - [ ] Document upload
- [ ] Background refetching

---

### UX/UI Polish

#### Design System
- [ ] Component documentation
- [ ] Storybook setup
- [ ] Component usage examples
- [ ] Accessibility audit (WCAG 2.1 AA):
  - [ ] Keyboard navigation
  - [ ] Screen reader support
  - [ ] Focus management
  - [ ] Color contrast
  - [ ] ARIA labels

#### Responsive Design
- [x] Mobile-responsive layouts
- [ ] Touch-friendly controls (larger tap targets)
- [ ] Mobile navigation menu (hamburger)
- [ ] Tablet layout optimizations
- [ ] Progressive Web App:
  - [ ] Service worker
  - [ ] Offline support
  - [ ] Install prompt

#### Dark Mode
- [x] Theme toggle implemented
- [x] All pages support dark mode
- [x] OKLCH monochromatic color scheme
- [ ] System theme sync
- [ ] Persist theme preference to backend
- [ ] Chart colors for dark mode

---

## 🚀 Future Enhancements (Post-MVP)

### Advanced Features

#### 1. Event Replay & Time Travel
- [ ] Query state at specific timestamp
- [ ] Event replay functionality
- [ ] State snapshots
- [ ] Historical comparisons
- [ ] "What-if" scenarios

#### 2. GraphQL API Layer
- [ ] GraphQL schema
- [ ] Apollo Client integration
- [ ] Subscription support
- [ ] Real-time updates
- [ ] Optimistic UI

#### 3. Real-time Collaboration
- [ ] WebSocket connection
- [ ] Live event updates
- [ ] Multi-user presence
- [ ] Conflict resolution
- [ ] Collaborative editing

#### 4. Compliance Features
- [ ] GDPR data export
- [ ] Right to deletion UI
- [ ] Retention policy management
- [ ] Audit log viewer
- [ ] Compliance reports

#### 5. Integration Marketplace
- [ ] Plugin system
- [ ] Third-party integrations
- [ ] Webhook configuration
- [ ] OAuth app management

---

## 📋 Immediate Next Steps (This Week)

### Sprint 1: Core Functionality
**Days 1-2**: Dashboard API Integration
1. [ ] Remove dummy data from `src/routes/index.tsx`
2. [ ] Implement `useEffect` to fetch real data
3. [ ] Add loading states
4. [ ] Add error handling
5. [ ] Test with backend

**Days 3-5**: Event Creation
1. [ ] Create `/src/routes/events/create.tsx`
2. [ ] Build subject selector component
3. [ ] Build event type selector
4. [ ] Implement dynamic form based on schema
5. [ ] Add validation
6. [ ] Test event creation flow

**Day 6**: Document Upload (Basic)
1. [ ] Create `DocumentUpload.tsx`
2. [ ] Integrate with subject page
3. [ ] Test upload flow

**Day 7**: Testing & Bug Fixes
1. [ ] Test all new features
2. [ ] Fix bugs
3. [ ] Code review

---

## 🔗 Related Documentation

### Backend
- **Architecture Guide**: `~/dev/timeline/docs/ARCHITECTURE_GUIDE.md`
- **API Documentation**: `http://localhost:8000/docs`
- **Models**: `~/dev/timeline/models/`
- **API Endpoints**: `~/dev/timeline/api/`
- **Services**: `~/dev/timeline/services/`

### Frontend
- **Components**: `src/components/`
- **Routes**: `src/routes/`
- **API Client**: `src/lib/api-client.ts`
- **Types**: `src/lib/types.ts`
- **Hooks**: `src/hooks/`

---

## 📝 Notes & Known Issues

### Known Issues
1. **Session Timeout**: JWT tokens expire after 8 hours
   - Backend config: `~/dev/timeline/core/config.py:18`
   - Recently increased from 30 minutes
2. **Dashboard**: Currently using dummy data
   - File: `src/lib/dummy-data.ts`
   - TODO: Connect to real API
3. **No Event Creation**: UI not yet implemented
4. **No Document Upload**: Backend ready, UI missing

### Design Decisions
- **Monochromatic Theme**: Pure grayscale OKLCH for accessibility
- **Type Safety**: OpenAPI-generated types ensure alignment
- **Component Structure**: Shared in `/components`, page-specific in routes
- **State Management**: TanStack Store for auth, TanStack Query for data
- **Routing**: TanStack Router with type-safe routes

### Questions for Product Owner
- [ ] Email integration visibility: all users or admin-only?
- [ ] Permissions for event creation vs. viewing?
- [ ] Workflows: tenant-wide or user-specific?
- [ ] Compliance requirements: GDPR, HIPAA, SOC 2?
- [ ] Mobile app needed or responsive web only?

---

**Status Key**:
- ✅ Complete - Fully implemented and tested
- 🟡 Partial - Started but incomplete
- ❌ Missing - Not yet started
- 🔄 In Progress - Currently being worked on
- ⭐ High priority item
