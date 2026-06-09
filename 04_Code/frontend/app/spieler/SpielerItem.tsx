'use client'

import { useState, useTransition } from 'react'
import { Trash2, Pencil, Check, X } from 'lucide-react'
import { deletePlayer, assignParent, renamePlayer } from './actions'

type Parent = { id: string; full_name: string; role: string }
type Player = { id: string; first_name: string; parent_id: string | null }

export default function SpielerItem({
  player,
  index,
  parents,
}: {
  player: Player
  index: number
  parents: Parent[]
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(player.first_name)
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    const trimmed = name.trim()
    if (!trimmed || trimmed === player.first_name) { setEditing(false); return }
    startTransition(async () => {
      await renamePlayer(player.id, trimmed)
      setEditing(false)
    })
  }

  function handleCancel() {
    setName(player.first_name)
    setEditing(false)
  }

  return (
    <li className="bg-gray-50 rounded-xl px-4 py-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="text-xs font-medium text-gray-400 w-5 flex-shrink-0">{index}.</span>
          {editing ? (
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
              autoFocus
              className="flex-1 border border-[#9B1C2E] rounded-lg px-2 py-1 text-sm font-medium text-gray-900"
            />
          ) : (
            <p className="font-medium text-gray-900">{player.first_name}</p>
          )}
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {editing ? (
            <>
              <button onClick={handleSave} disabled={isPending}
                className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50">
                <Check size={15} />
              </button>
              <button onClick={handleCancel}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <X size={15} />
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setEditing(true)}
                className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                <Pencil size={14} />
              </button>
              <form action={deletePlayer.bind(null, player.id)}>
                <button type="submit"
                  className="p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-400 rounded-lg">
                  <Trash2 size={14} />
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      <form action={assignParent.bind(null, player.id)} className="flex gap-2">
        <select name="parent_id" defaultValue={player.parent_id ?? ''}
          className="flex-1 border border-gray-200 rounded-lg px-2 py-1.5 text-xs bg-white text-gray-700">
          <option value="">Kein Elternteil</option>
          {parents.map(p => (
            <option key={p.id} value={p.id}>
              {p.full_name}{p.role === 'trainer' ? ' (Trainer)' : ''}
            </option>
          ))}
        </select>
        <button type="submit"
          className="px-3 py-1.5 rounded-lg text-white text-xs font-medium bg-[#9B1C2E]">✓</button>
      </form>
    </li>
  )
}
