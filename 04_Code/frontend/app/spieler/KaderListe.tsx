'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronRight, Phone, X, Plus } from 'lucide-react'
import { addPlayer } from './actions'
import { inviteContact } from './contact-actions'

type Player = { id: string; first_name: string }
type Contact = {
  id: string
  player_id: string
  full_name: string
  role: string
  phone: string | null
  email: string
  status: 'pending' | 'active'
}

const ROLE_OPTIONS = [
  'Mutter', 'Vater', 'Erziehungsberechtigte/r',
  'Großmutter', 'Großvater', 'Sonstige',
]

export default function KaderListe({
  players,
  contacts,
}: {
  players: Player[]
  contacts: Contact[]
}) {
  const router = useRouter()
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [addingPlayer, setAddingPlayer] = useState(false)
  const [sheetView, setSheetView] = useState<'contacts' | 'invite-form' | 'success'>('contacts')
  const [formError, setFormError] = useState('')
  const [addError, setAddError] = useState('')
  const [isPending, startTransition] = useTransition()

  const contactsByPlayer = new Map<string, Contact[]>()
  for (const c of contacts) {
    const arr = contactsByPlayer.get(c.player_id) ?? []
    arr.push(c)
    contactsByPlayer.set(c.player_id, arr)
  }

  function openSheet(player: Player) {
    setSelectedPlayer(player)
    setAddingPlayer(false)
    setSheetView('contacts')
    setFormError('')
  }

  function closeSheet() {
    setSelectedPlayer(null)
    setAddingPlayer(false)
  }

  function openAddPlayer() {
    setAddingPlayer(true)
    setSelectedPlayer(null)
    setAddError('')
  }

  function handleAddPlayer(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    setAddError('')
    startTransition(async () => {
      try {
        const newPlayer = await addPlayer(formData)
        router.refresh()
        setAddingPlayer(false)
        setSelectedPlayer(newPlayer)
        setSheetView('contacts')
      } catch (err: unknown) {
        setAddError(err instanceof Error ? err.message : 'Fehler beim Anlegen')
      }
    })
  }

  function handleInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!selectedPlayer) return
    const formData = new FormData(e.currentTarget)
    setFormError('')
    startTransition(async () => {
      try {
        await inviteContact(selectedPlayer.id, formData)
        setSheetView('success')
      } catch (err: unknown) {
        setFormError(err instanceof Error ? err.message : 'Fehler beim Einladen')
      }
    })
  }

  const playerContacts = selectedPlayer
    ? (contactsByPlayer.get(selectedPlayer.id) ?? [])
    : []

  const sheetOpen = selectedPlayer !== null || addingPlayer

  return (
    <>
      {/* Roter Header mit + Button */}
      <div className="bg-[#9B1C2E] px-4 pt-8 pb-5 flex items-end justify-between">
        <div>
          <p className="text-white/65 text-xs mb-0.5">TSG 1861 Kaiserslautern</p>
          <h1 className="text-white text-xl font-bold">Kader</h1>
          <p className="text-white/60 text-xs mt-1">{players.length} Spieler</p>
        </div>
        <button
          onClick={openAddPlayer}
          className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center mb-1"
        >
          <Plus size={20} color="white" strokeWidth={2.5} />
        </button>
      </div>

      {/* Spielerliste */}
      <div className="px-3 pt-3 pb-20 flex flex-col gap-3">
        {players.length === 0 && (
          <p className="text-sm text-gray-400 text-center py-8">
            Noch keine Spieler — tippe auf das + oben rechts.
          </p>
        )}

        {players.map(player => {
          const pc = contactsByPlayer.get(player.id) ?? []
          return (
            <button
              key={player.id}
              onClick={() => openSheet(player)}
              className="flex items-center gap-3 bg-white rounded-xl px-3.5 py-3 border border-gray-100 text-left w-full"
            >
              <div className="w-9 h-9 rounded-full bg-[#9B1C2E]/10 flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-bold text-[#9B1C2E]">{player.first_name[0]}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900">{player.first_name}</p>
                <p className={`text-xs mt-0.5 ${pc.length > 0 ? 'text-[#9B1C2E] font-medium' : 'text-gray-400'}`}>
                  {pc.length > 0
                    ? `${pc.length} ${pc.length === 1 ? 'Kontakt' : 'Kontakte'} verknüpft`
                    : 'Kein Kontakt'}
                </p>
              </div>
              <ChevronRight size={14} className="text-gray-300 flex-shrink-0" />
            </button>
          )
        })}
      </div>

      {/* Sheet Overlay */}
      {sheetOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40" onClick={closeSheet} />
          <div
            className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-[#f5f5f7] rounded-t-2xl z-50 overflow-y-auto"
            style={{ maxHeight: 'calc(100dvh - 5rem)' }}
          >

            {/* NEUEN SPIELER ANLEGEN */}
            {addingPlayer && (
              <>
                <div className="bg-[#9B1C2E] rounded-t-2xl px-4 pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={closeSheet}
                      className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0"
                    >
                      <X size={16} color="white" />
                    </button>
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-widest mb-0.5">Kader</p>
                      <h2 className="text-white text-lg font-bold">Neuer Spieler</h2>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleAddPlayer} className="p-3 flex flex-col gap-3 pb-20">
                  <div className="bg-white rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Vorname</p>
                    <input
                      name="first_name"
                      type="text"
                      placeholder="z.B. Leon"
                      required
                      autoFocus
                      className="w-full border-none outline-none text-sm text-gray-900 placeholder:text-gray-400"
                    />
                  </div>

                  {addError && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{addError}</p>
                  )}

                  <button
                    type="submit"
                    disabled={isPending}
                    className="w-full py-3.5 bg-[#9B1C2E] text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                  >
                    {isPending ? 'Wird angelegt…' : 'Spieler anlegen'}
                  </button>
                </form>
              </>
            )}

            {/* SPIELER DETAIL — KONTAKTE */}
            {selectedPlayer && sheetView === 'contacts' && (
              <>
                <div className="bg-[#9B1C2E] rounded-t-2xl px-4 pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-white/20 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
                      {selectedPlayer.first_name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-white/60 text-xs uppercase tracking-widest mb-0.5">Spieler</p>
                      <h2 className="text-white text-lg font-bold">{selectedPlayer.first_name}</h2>
                    </div>
                    <button
                      onClick={closeSheet}
                      className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center"
                    >
                      <X size={16} color="white" />
                    </button>
                  </div>
                </div>

                <div className="p-3 flex flex-col gap-2 pb-20">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-1 pt-1 mb-1">
                    Kontakte
                  </p>

                  {playerContacts.length === 0 && (
                    <div className="bg-white rounded-xl px-4 py-4 border border-gray-100 text-center text-sm text-gray-400">
                      Noch kein Kontakt verknüpft
                    </div>
                  )}

                  {playerContacts.map(c => (
                    <div key={c.id} className="bg-white rounded-xl px-3.5 py-3 border border-gray-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#9B1C2E]/10 flex items-center justify-center flex-shrink-0">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
                            stroke="#9B1C2E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900">{c.full_name}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{c.role}</p>
                        </div>
                        {c.phone && (
                          <a href={`tel:${c.phone}`}
                            className="w-9 h-9 rounded-lg bg-[#9B1C2E]/10 flex items-center justify-center flex-shrink-0">
                            <Phone size={16} color="#9B1C2E" />
                          </a>
                        )}
                      </div>
                      <div className="mt-2.5 pt-2.5 border-t border-gray-100">
                        {c.status === 'active' ? (
                          <span className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-green-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                            Aktiv
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block" />
                            Einladung ausstehend
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={() => setSheetView('invite-form')}
                    className="w-full mt-1 py-3.5 bg-[#9B1C2E] text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                      stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <line x1="19" y1="8" x2="19" y2="14"/>
                      <line x1="22" y1="11" x2="16" y2="11"/>
                    </svg>
                    Kontakt einladen
                  </button>
                </div>
              </>
            )}

            {/* KONTAKT EINLADEN FORMULAR */}
            {selectedPlayer && sheetView === 'invite-form' && (
              <>
                <div className="bg-[#9B1C2E] rounded-t-2xl px-4 pt-5 pb-4">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSheetView('contacts')}
                      className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center flex-shrink-0"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                        stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="15 18 9 12 15 6"/>
                      </svg>
                    </button>
                    <div>
                      <p className="text-white/60 text-xs uppercase tracking-widest mb-0.5">Kontakt für</p>
                      <h2 className="text-white text-lg font-bold">{selectedPlayer.first_name}</h2>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleInvite} className="p-3 flex flex-col gap-3 pb-20">
                  <div className="bg-white rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Name</p>
                    <input name="full_name" type="text" placeholder="z.B. Sandra Nono" required
                      className="w-full border-none outline-none text-sm text-gray-900 placeholder:text-gray-400" />
                  </div>

                  <div className="bg-white rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Beziehung</p>
                    <select name="role" required className="w-full border-none outline-none text-sm text-gray-900 bg-white">
                      {ROLE_OPTIONS.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>

                  <div className="bg-white rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">E-Mail</p>
                    <input name="email" type="email" placeholder="z.B. sandra@mail.de" required
                      className="w-full border-none outline-none text-sm text-gray-900 placeholder:text-gray-400" />
                  </div>

                  <div className="bg-white rounded-xl px-4 py-3 border border-gray-100">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Telefon</p>
                    <input name="phone" type="tel" placeholder="z.B. +49 151 12345678"
                      className="w-full border-none outline-none text-sm text-gray-900 placeholder:text-gray-400" />
                  </div>

                  <div className="flex gap-2.5 items-start bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
                    <svg className="flex-shrink-0 mt-0.5" width="15" height="15" viewBox="0 0 24 24" fill="none"
                      stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="12" y1="8" x2="12" y2="12"/>
                      <line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      {selectedPlayer.first_name} wird mit diesem Kontakt verknüpft. Die eingeladene Person erhält
                      eine E-Mail und kann die App für {selectedPlayer.first_name} nutzen.
                    </p>
                  </div>

                  {formError && (
                    <p className="text-sm text-red-600 bg-red-50 rounded-xl px-4 py-3">{formError}</p>
                  )}

                  <button type="submit" disabled={isPending}
                    className="w-full py-3.5 bg-[#9B1C2E] text-white rounded-xl text-sm font-semibold disabled:opacity-50">
                    {isPending ? 'Wird gesendet…' : 'Einladung senden'}
                  </button>
                </form>
              </>
            )}

            {/* ERFOLG */}
            {selectedPlayer && sheetView === 'success' && (
              <div className="flex flex-col items-center justify-center px-6 py-12 gap-4 pb-20">
                <div className="w-14 h-14 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                    stroke="#16a34a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-gray-900 mb-1.5">Einladung verschickt</p>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    Der Kontakt erhält eine E-Mail und wird dann mit {selectedPlayer.first_name} verknüpft.
                  </p>
                </div>
                <button onClick={() => setSheetView('contacts')}
                  className="px-6 py-2.5 bg-[#9B1C2E] text-white rounded-xl text-sm font-semibold">
                  Zurück zum Spieler
                </button>
              </div>
            )}

          </div>
        </>
      )}
    </>
  )
}
