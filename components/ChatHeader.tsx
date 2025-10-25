'use client'

import { MessageSquare, Settings, HelpCircle } from 'lucide-react'
import ConnectionSelector from './ConnectionSelector'

interface ChatHeaderProps {
  selectedConnectionId?: string | null
  onConnectionChange: (connectionId: string | null) => void
}

export default function ChatHeader({ selectedConnectionId, onConnectionChange }: ChatHeaderProps) {
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
              Analytics Chat
            </h2>
          </div>
          
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Ask questions about your data in natural language
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ConnectionSelector
            selectedConnectionId={selectedConnectionId}
            onConnectionChange={onConnectionChange}
          />
          
          <button
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
          
          <button
            className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            title="Settings"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
