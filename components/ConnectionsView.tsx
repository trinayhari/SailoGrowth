'use client'

import { useState, useEffect } from 'react'
import { Plus, Database, Settings, Trash2, TestTube, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { Connection, ConnectionManager, CONNECTION_TYPES, ConnectionType } from '../lib/connections'
import ConnectionForm from './ConnectionForm'

export default function ConnectionsView() {
  const [connections, setConnections] = useState<Connection[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingConnection, setEditingConnection] = useState<Connection | null>(null)
  const [connectionManager] = useState(() => new ConnectionManager())
  const [testingConnections, setTestingConnections] = useState<Set<string>>(new Set())

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = () => {
    setConnections(connectionManager.getAllConnections())
  }

  const handleAddConnection = (connectionData: any) => {
    connectionManager.addConnection(connectionData)
    loadConnections()
    setShowForm(false)
  }

  const handleEditConnection = (connection: Connection) => {
    setEditingConnection(connection)
    setShowForm(true)
  }

  const handleUpdateConnection = (connectionData: any) => {
    if (editingConnection) {
      connectionManager.updateConnection(editingConnection.id, connectionData)
      loadConnections()
      setShowForm(false)
      setEditingConnection(null)
    }
  }

  const handleDeleteConnection = (id: string) => {
    if (confirm('Are you sure you want to delete this connection?')) {
      connectionManager.deleteConnection(id)
      loadConnections()
    }
  }

  const handleTestConnection = async (id: string) => {
    setTestingConnections(prev => new Set(prev).add(id))
    
    try {
      const result = await connectionManager.testConnection(id)
      loadConnections()
      
      if (result.success) {
        alert('Connection successful!')
      } else {
        alert(`Connection failed: ${result.message}`)
      }
    } catch (error) {
      alert('Failed to test connection')
    } finally {
      setTestingConnections(prev => {
        const newSet = new Set(prev)
        newSet.delete(id)
        return newSet
      })
    }
  }

  const getStatusIcon = (status: Connection['status']) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-gray-500" />
      case 'testing':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <XCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusText = (status: Connection['status']) => {
    switch (status) {
      case 'connected':
        return 'Connected'
      case 'disconnected':
        return 'Not connected'
      case 'testing':
        return 'Testing...'
      case 'error':
        return 'Connection error'
      default:
        return 'Unknown'
    }
  }

  if (showForm) {
    return (
      <ConnectionForm
        connection={editingConnection}
        onSave={editingConnection ? handleUpdateConnection : handleAddConnection}
        onCancel={() => {
          setShowForm(false)
          setEditingConnection(null)
        }}
      />
    )
  }

  return (
    <div className="flex flex-col h-screen bg-gray-950">
      {/* Header */}
      <div className="border-b border-gray-800 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-100">Data Connections</h1>
            <p className="text-gray-400 mt-1">
              Manage your data sources and database connections
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-4 w-4" />
            Add Connection
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {connections.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <Database className="h-16 w-16 text-gray-600 mb-4" />
            <h3 className="text-lg font-medium text-gray-300 mb-2">No connections yet</h3>
            <p className="text-gray-500 mb-6 max-w-md">
              Connect to your databases and analytics platforms to start querying your data with natural language.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
              Add Your First Connection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {connections.map((connection) => (
              <div
                key={connection.id}
                className="bg-gray-900 rounded-lg border border-gray-800 p-6 hover:border-gray-700 transition-colors"
              >
                {/* Connection Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">
                      {CONNECTION_TYPES[connection.type]?.icon || '🔗'}
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-100">{connection.name}</h3>
                      <p className="text-sm text-gray-400">
                        {CONNECTION_TYPES[connection.type]?.name || connection.type}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    {getStatusIcon(connection.status)}
                  </div>
                </div>

                {/* Connection Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Status:</span>
                    <span className={`font-medium ${
                      connection.status === 'connected' ? 'text-green-400' :
                      connection.status === 'error' ? 'text-red-400' :
                      connection.status === 'testing' ? 'text-blue-400' :
                      'text-gray-400'
                    }`}>
                      {getStatusText(connection.status)}
                    </span>
                  </div>
                  
                  {connection.description && (
                    <div className="text-sm text-gray-500">
                      {connection.description}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Active:</span>
                    <span className={connection.isActive ? 'text-green-400' : 'text-gray-400'}>
                      {connection.isActive ? 'Yes' : 'No'}
                    </span>
                  </div>
                  
                  {connection.lastTested && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">Last tested:</span>
                      <span className="text-gray-400">
                        {connection.lastTested.toLocaleDateString()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleTestConnection(connection.id)}
                    disabled={testingConnections.has(connection.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors disabled:opacity-50"
                  >
                    <TestTube className="h-3 w-3" />
                    {testingConnections.has(connection.id) ? 'Testing...' : 'Test'}
                  </button>
                  
                  <button
                    onClick={() => handleEditConnection(connection)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                  >
                    <Settings className="h-3 w-3" />
                    Edit
                  </button>
                  
                  <button
                    onClick={() => handleDeleteConnection(connection.id)}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-red-900/20 hover:bg-red-900/30 text-red-400 rounded transition-colors"
                  >
                    <Trash2 className="h-3 w-3" />
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
