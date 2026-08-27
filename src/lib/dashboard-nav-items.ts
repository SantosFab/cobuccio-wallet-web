// Shared by DashboardSidebar (the links) and the navbar's page title
// (which section is active) — one source of truth for route <-> label.
export const DASHBOARD_NAV_ITEMS = [
  { href: '/dashboard', key: 'balance' },
  { href: '/dashboard/transfer', key: 'transfer' },
  { href: '/dashboard/profile', key: 'profile' },
] as const
