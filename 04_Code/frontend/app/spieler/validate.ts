export function validatePlayer(data: { first_name: string; birth_year: number }): boolean {
  const currentYear = new Date().getFullYear()
  return (
    data.first_name.trim().length > 0 &&
    data.birth_year >= 1990 &&
    data.birth_year <= currentYear
  )
}
