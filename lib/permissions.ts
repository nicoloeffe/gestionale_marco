import type { UserRole } from './db-types'

export type PermissionKey =
  | 'readOperationalData'
  | 'mutateOperationalData'
  | 'manageRegistries'
  | 'manageUsers'
  | 'exportData'

export type PermissionMatrix = Record<UserRole, Record<PermissionKey, boolean>>

export const permissionMatrix: PermissionMatrix = {
  viewer: {
    readOperationalData: true,
    mutateOperationalData: false,
    manageRegistries: false,
    manageUsers: false,
    exportData: true,
  },
  operator: {
    readOperationalData: true,
    mutateOperationalData: true,
    manageRegistries: true,
    manageUsers: false,
    exportData: true,
  },
  admin: {
    readOperationalData: true,
    mutateOperationalData: true,
    manageRegistries: true,
    manageUsers: true,
    exportData: true,
  },
}

export function can(role: UserRole, permission: PermissionKey) {
  return permissionMatrix[role][permission]
}

export function canMutateOperationalData(role: UserRole) {
  return can(role, 'mutateOperationalData')
}

export function canManageUsers(role: UserRole) {
  return can(role, 'manageUsers')
}

