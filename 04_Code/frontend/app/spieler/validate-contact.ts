export function validateContact(data: {
  full_name: string
  email: string
  role: string
}): string | null {
  if (!data.full_name.trim()) return 'Name ist erforderlich'
  if (!data.email.trim()) return 'E-Mail ist erforderlich'
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email.trim())) return 'Ungültige E-Mail-Adresse'
  if (!data.role.trim()) return 'Beziehung ist erforderlich'
  return null
}
