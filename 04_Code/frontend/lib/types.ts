export type Role = 'trainer' | 'parent'
export type EventType = 'training' | 'game' | 'other'
export type RSVPStatus = 'attending' | 'absent'

export interface Profile {
  id: string
  full_name: string
  role: Role
  created_at: string
}

export interface Team {
  id: string
  name: string
  created_at: string
}

export interface Player {
  id: string
  team_id: string
  first_name: string
  birth_year: number
  parent_id: string | null
  created_at: string
}

export interface Event {
  id: string
  team_id: string
  type: EventType
  title: string
  starts_at: string
  location: string | null
  opponent: string | null
  meetup_at: string | null
  rsvp_deadline: string | null
  created_by: string
  created_at: string
}

export interface RSVP {
  id: string
  event_id: string
  player_id: string
  status: RSVPStatus
  reason: string | null
  updated_at: string
}
