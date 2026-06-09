export function validatePlayer(data: { first_name: string }): boolean {
  return data.first_name.trim().length > 0
}
