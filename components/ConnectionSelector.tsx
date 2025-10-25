'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Database, CheckCircle, XCircle, AlertCircle, Clock } from 'lucide-react'
import { Connection, ConnectionManager, CONNECTION_TYPES } from '../lib/connections'

interface ConnectionSelectorProps {
  selectedConnectionId?: string | null
  onConnectionChange: (connectionId: string | null) => void
}

export default function ConnectionSelector({ selectedConnectionId, onConnectionChange }: ConnectionSelectorProps) {
  const [connections, setConnections] = useState<Connection[]>([])
  const [showDropdown, setShowDropdown] = useState(false)
  const [connectionManager] = useState(() => new ConnectionManager())
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    loadConnections()
  }, [])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadConnections = () => {
    const allConnections = connectionManager.getAllConnections()
    setConnections(allConnections)
    
    // Auto-select first active connection if none selected
    if (!selectedConnectionId && allConnections.length > 0) {
      const activeConnection = allConnections.find(conn => conn.isActive && conn.status === 'connected')
      if (activeConnection) {
        onConnectionChange(activeConnection.id)
      }
    }
  }

  const selectedConnection = connections.find(conn => conn.id === selectedConnectionId)
  const activeConnections = connections.filter(conn => conn.isActive)

  const getStatusIcon = (status: Connection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-3 w-3 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-3 w-3 text-gray-400" />
      case 'testing':
        return <Clock className="h-3 w-3 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-3 w-3 text-red-500" />
      default:
        return <XCircle className="h-3 w-3 text-gray-400" />
    }
  }

  const getConnectionDisplay = (connection: Connection) => {
    const typeInfo = CONNECTION_TYPES[connection.type]
    return {
      name: connection.name,
      type: typeInfo?.name || connection.type,
      icon: typeInfo?.icon || '🔗'
    }
  }

  if (activeConnections.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/30 rounded-lg">
        <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        <span className="text-sm text-yellow-800 dark:text-yellow-200">
          No connections available. 
          <button 
            onClick={() => window.location.hash = '#connections'}
            className="ml-1 underline hover:no-underline"
          >
            Add one
          </button>
        </span>
      </div>
    )
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-w-[200px]"
      >
        <Database className="h-4 w-4 text-gray-500 dark:text-gray-400" />
        
        {selectedConnection ? (
          <div className="flex items-center gap-2 flex-1">
            <span className="text-lg">{getConnectionDisplay(selectedConnection).icon}</span>
            <div className="flex-1 text-left">
              <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {getConnectionDisplay(selectedConnection).name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {getConnectionDisplay(selectedConnection).type}
              </div>
            </div>
            {getStatusIcon(selectedConnection.status)}
          </div>
        ) : (
          <div className="flex-1 text-left">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Select connection...
            </div>
          </div>
        )}
        
        <ChevronDown className="h-4 w-4 text-gray-400" />
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 z-50 max-h-64 overflow-y-auto">
          {activeConnections.map((connection) => {
            const display = getConnectionDisplay(connection)
            const isSelected = connection.id === selectedConnectionId
            
            return (
              <button
                key={connection.id}
                onClick={() => {
                  onConnectionChange(connection.id)
                  setShowDropdown(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors ${
                  isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
              >
                <span className="text-lg">{display.icon}</span>
                <div className="flex-1">
                  <div className={`text-sm font-medium ${
                    isSelected 
                      ? 'text-blue-700 dark:text-blue-300' 
                      : 'text-gray-900 dark:text-gray-100'
                  }`}>
                    {display.name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {display.type}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(connection.status)}
                  {isSelected && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </button>
            )
          })}
          
          {activeConnections.length === 0 && (
            <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No active connections found
            </div>
          )}
        </div>
      )}
    </div>
  )
}
