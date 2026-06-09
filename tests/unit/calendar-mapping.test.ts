import { describe, expect, it } from 'vitest'
import { booleanToPerformedStatus, mapEventsFullRowToCalendarEvent, performedStatusToBoolean } from '@/components/audit-plan/calendar/db-mapping'

describe('calendar db mapping', () => {
  it('maps events_full rows to UI calendar events', () => {
    const event = mapEventsFullRowToCalendarEvent({
      id: 'event-1',
      audit_id: 'audit-1',
      auditor_id: 'auditor-1',
      start_datetime: '2026-05-15T09:00:00+00:00',
      end_datetime: '2026-05-15T17:00:00+00:00',
      all_day: false,
      title: 'Sorveglianza',
      status: 'pianificato',
      performed_status: 'no',
      notes: 'Nota',
      audit_number: 'AU-TEST-001',
      audit_type: 'Sorveglianza',
      client_id: 'client-1',
      standards: [
        { id: 'standard-1', code: 'ISO 9001' },
        { id: 'standard-2', code: 'ISO 14001' },
      ],
    })

    expect(event).toMatchObject({
      id: 'event-1',
      auditId: 'audit-1',
      auditorId: 'auditor-1',
      auditorIds: ['auditor-1'],
      clientId: 'client-1',
      standardIds: ['standard-1', 'standard-2'],
      performed: false,
      auditNumber: 'AU-TEST-001',
    })
  })

  it('maps performed_status values explicitly', () => {
    expect(performedStatusToBoolean('yes')).toBe(true)
    expect(performedStatusToBoolean('no')).toBe(false)
    expect(performedStatusToBoolean('unknown')).toBe(false)
    expect(booleanToPerformedStatus(true)).toBe('yes')
    expect(booleanToPerformedStatus(false)).toBe('no')
  })
})
