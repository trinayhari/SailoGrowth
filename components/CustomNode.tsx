'use client'

import React, { useState, memo } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Settings, Play, Pause, CheckCircle, XCircle, Clock, AlertCircle, Edit2, Check, X } from 'lucide-react'

type CustomNodeData = {
  label: string
  icon: string
  description: string
  outcome: string
  status: 'idle' | 'running' | 'completed' | 'error'
  type: string
}

function CustomNode({ data, selected }: NodeProps) {
  const nodeData = data as CustomNodeData
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(nodeData.label || 'Node')

  const getStatusIcon = () => {
    switch (nodeData.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'running':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = () => {
    switch (nodeData.status) {
      case 'completed':
        return 'border-green-400 bg-green-100 dark:bg-green-900'
      case 'running':
        return 'border-blue-400 bg-blue-100 dark:bg-blue-900'
      case 'error':
        return 'border-red-400 bg-red-100 dark:bg-red-900'
      default:
        return 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
    }
  }

  const handleSaveLabel = () => {
    nodeData.label = label
    setIsEditing(false)
  }

  const handleCancelEdit = () => {
    setLabel(nodeData.label)
    setIsEditing(false)
  }

  return (
    <div className="relative">
      {/* Input Handle - only show if node can receive input */}
      {nodeData.type !== 'data-connector' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-gray-400 dark:!bg-gray-500 border-2 border-white dark:border-gray-800 hover:!bg-blue-500 transition-colors"
        />
      )}

      {/* Node Card */}
      <div
        className={`w-64 border-2 rounded-lg p-4 shadow-lg transition-all ${
          selected
            ? 'border-blue-500 bg-white dark:bg-gray-800 shadow-blue-200 dark:shadow-blue-900 ring-2 ring-blue-200 dark:ring-blue-900'
            : getStatusColor()
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 flex-1">
            <span className="text-2xl">{nodeData.icon}</span>
            {isEditing ? (
              <div className="flex items-center gap-1 flex-1">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="flex-1 px-2 py-1 text-sm font-semibold border border-blue-500 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveLabel()
                    if (e.key === 'Escape') handleCancelEdit()
                  }}
                />
                <button
                  onClick={handleSaveLabel}
                  className="p-1 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded"
                >
                  <Check className="h-3 w-3" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : (
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm flex-1">
                {label}
              </h3>
            )}
          </div>

          <div className="flex items-center gap-1">
            {getStatusIcon()}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
                title="Rename node"
              >
                <Edit2 className="h-3 w-3" />
              </button>
            )}
            <button
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              title="Node settings"
            >
              <Settings className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
          {nodeData.description}
        </p>

        {/* Outcome */}
        <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-3">
          → {nodeData.outcome}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {nodeData.status}
          </div>

          {nodeData.status === 'running' && (
            <button className="p-1 text-red-500 hover:text-red-600 rounded">
              <Pause className="h-3 w-3" />
            </button>
          )}

          {nodeData.status === 'idle' && (
            <button className="p-1 text-green-500 hover:text-green-600 rounded">
              <Play className="h-3 w-3" />
            </button>
          )}
        </div>
      </div>

      {/* Output Handle - only show if node can send output */}
      {nodeData.type !== 'action-executor' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-gray-400 dark:!bg-gray-500 border-2 border-white dark:border-gray-800 hover:!bg-blue-500 transition-colors"
        />
      )}
    </div>
  )
}

export default memo(CustomNode)
