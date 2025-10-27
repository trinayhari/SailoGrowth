'use client'

import React, { useState, memo, useCallback } from 'react'
import { Handle, Position, NodeProps } from '@xyflow/react'
import { Edit2, Check, X } from 'lucide-react'

type NodeCardData = {
  label: string
  icon: string
  description: string
  state: string
  type: string
  color: string
}

function NodeCard({ data, selected }: NodeProps) {
  const nodeData = data as NodeCardData
  const [isEditing, setIsEditing] = useState(false)
  const [label, setLabel] = useState(nodeData.label || 'Node')

  const handleSaveLabel = useCallback(() => {
    nodeData.label = label
    setIsEditing(false)
  }, [nodeData, label])

  const handleCancelEdit = useCallback(() => {
    setLabel(nodeData.label)
    setIsEditing(false)
  }, [nodeData.label])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSaveLabel()
    if (e.key === 'Escape') handleCancelEdit()
  }, [handleSaveLabel, handleCancelEdit])

  return (
    <div className="relative group">
      {/* Input Handle - left side (all nodes can receive input except data-connector) */}
      {nodeData.type !== 'data-connector' && (
        <Handle
          type="target"
          position={Position.Left}
          className="w-3 h-3 !bg-blue-400 !border-2 !border-white hover:!bg-blue-600 hover:scale-125 transition-all shadow-md"
          style={{ left: -6 }}
        />
      )}

      {/* Node Card */}
      <div
        className={`
          w-72 bg-white rounded-xl p-5 shadow-sm
          border-2 transition-all duration-200
          ${selected 
            ? `border-${nodeData.color}-500 shadow-lg shadow-${nodeData.color}-100` 
            : `border-${nodeData.color}-200 hover:border-${nodeData.color}-300`
          }
        `}
        style={{
          borderColor: selected 
            ? `var(--color-${nodeData.color}-500, #3b82f6)` 
            : `var(--color-${nodeData.color}-200, #e5e7eb)`
        }}
      >
        {/* Header */}
        <div className="flex items-start gap-3 mb-3">
          <div className="text-3xl flex-shrink-0 mt-0.5">{nodeData.icon}</div>
          
          <div className="flex-1 min-w-0">
            {isEditing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="flex-1 px-2 py-1 text-base font-bold border-2 border-blue-400 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  autoFocus
                />
                <button
                  onClick={handleSaveLabel}
                  className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Save"
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Cancel"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-gray-900 truncate">
                  {label}
                </h3>
                <button
                  onClick={() => setIsEditing(true)}
                  className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded transition-all"
                  title="Rename node"
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-3 min-h-[2.5rem]">
          {nodeData.description}
        </p>

        {/* State */}
        <div className="text-xs italic text-gray-400 flex items-center gap-2">
          <div 
            className="w-1.5 h-1.5 rounded-full"
            style={{
              backgroundColor: nodeData.state === 'Completed' ? '#10b981' :
                             nodeData.state === 'Running' ? '#3b82f6' :
                             nodeData.state === 'Error' ? '#ef4444' :
                             '#9ca3af'
            }}
          />
          {nodeData.state}
        </div>
      </div>

      {/* Output Handle - right side (all nodes can send output except action-executor) */}
      {nodeData.type !== 'action-executor' && (
        <Handle
          type="source"
          position={Position.Right}
          className="w-3 h-3 !bg-green-400 !border-2 !border-white hover:!bg-green-600 hover:scale-125 transition-all shadow-md"
          style={{ right: -6 }}
        />
      )}
    </div>
  )
}

export default memo(NodeCard)
