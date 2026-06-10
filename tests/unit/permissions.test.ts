import { describe, expect, it } from 'vitest'
import { can, canManageUsers, canMutateOperationalData, permissionMatrix } from '@/lib/permissions'

describe('permissionMatrix', () => {
  it('keeps viewer read-only but allows export', () => {
    expect(permissionMatrix.viewer).toMatchObject({
      readOperationalData: true,
      mutateOperationalData: false,
      manageRegistries: false,
      manageUsers: false,
      exportData: true,
    })
  })

  it('allows operators to mutate operational data but not manage users', () => {
    expect(canMutateOperationalData('operator')).toBe(true)
    expect(can('operator', 'manageRegistries')).toBe(true)
    expect(canManageUsers('operator')).toBe(false)
  })

  it('keeps admin as the only role that can manage users', () => {
    expect(canManageUsers('viewer')).toBe(false)
    expect(canManageUsers('operator')).toBe(false)
    expect(canManageUsers('admin')).toBe(true)
  })
})

