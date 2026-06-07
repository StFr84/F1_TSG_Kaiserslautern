import { MessageCircle } from 'lucide-react'

export default function NachrichtenPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <MessageCircle size={28} color="#9ca3af" />
      </div>
      <h1 className="text-lg font-semibold text-gray-800 mb-1">Nachrichten</h1>
      <p className="text-sm text-gray-500">Diese Funktion kommt in einer späteren Version.</p>
    </div>
  )
}
