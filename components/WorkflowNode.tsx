'use client'

import React, { useState, useRef } from 'react'
import { Settings, Play, Pause, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'
import { WorkflowNode as WorkflowNodeType } from '../lib/workflow-builder-types'

interface WorkflowNodeProps {
  node: WorkflowNodeType
  isSelected: boolean
  onSelect: (nodeId: string) => void
  onDrag: (nodeId: string, position: { x: number; y: number }) => void
  onConnect: (sourceId: string, targetId: string) => void
  onConnectionStart?: (nodeId: string, type: 'input' | 'output') => void
  onConnectionEnd?: (nodeId: string, type: 'input' | 'output') => void
  scale: number
}

export default function WorkflowNode({ 
  node, 
  isSelected, 
  onSelect, 
  onDrag, 
  onConnect,
  onConnectionStart,
  onConnectionEnd,
  scale 
}: WorkflowNodeProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionStart, setConnectionStart] = useState<'input' | 'output' | null>(null)
  const nodeRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return // Only left click
    
    e.preventDefault()
    e.stopPropagation()
    
    onSelect(node.id)
    
    setDragOffset({
      x: e.clientX - node.position.x,
      y: e.clientY - node.position.y
    })
    setIsDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    }
    
    onDrag(node.id, newPosition)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleConnectionPointMouseDown = (e: React.MouseEvent, type: 'input' | 'output') => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsConnecting(true)
    setConnectionStart(type)
    onConnectionStart?.(node.id, type)
  }

  const handleConnectionPointMouseUp = (e: React.MouseEvent, type: 'input' | 'output') => {
    e.preventDefault()
    e.stopPropagation()
    
    onConnectionEnd?.(node.id, type)
    
    setIsConnecting(false)
    setConnectionStart(null)
  }

  // Add global mouse event listeners when dragging
  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging, dragOffset, scale])

  const getStatusIcon = () => {
    switch (node.data.status) {
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
    switch (node.data.status) {
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

  return (
    <div
      ref={nodeRef}
      className={`absolute cursor-move select-none ${
        isDragging ? 'z-50' : 'z-10'
      }`}
      style={{
        left: node.position.x,
        top: node.position.y
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Connection Points */}
      {node.inputs.length > 0 && (
        <div 
          className="absolute -left-2 top-1/2 transform -translate-y-1/2 z-10"
          onMouseDown={(e) => handleConnectionPointMouseDown(e, 'input')}
          onMouseUp={(e) => handleConnectionPointMouseUp(e, 'input')}
        >
          <div 
            className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 transition-all cursor-pointer ${
              isConnecting && connectionStart === 'input'
                ? 'bg-blue-500 scale-125' 
                : 'bg-gray-400 dark:bg-gray-500 hover:bg-blue-500 hover:scale-110'
            }`}
            title={`Input: ${node.inputs.join(', ')}`}
          />
        </div>
      )}
      
      {node.outputs.length > 0 && (
        <div 
          className="absolute -right-2 top-1/2 transform -translate-y-1/2 z-10"
          onMouseDown={(e) => handleConnectionPointMouseDown(e, 'output')}
          onMouseUp={(e) => handleConnectionPointMouseUp(e, 'output')}
        >
          <div 
            className={`w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 transition-all cursor-pointer ${
              isConnecting && connectionStart === 'output'
                ? 'bg-blue-500 scale-125' 
                : 'bg-gray-400 dark:bg-gray-500 hover:bg-blue-500 hover:scale-110'
            }`}
            title={`Output: ${node.outputs.join(', ')}`}
          />
        </div>
      )}

      {/* Node Card */}
      <div
        className={`w-64 border-2 rounded-lg p-4 shadow-lg ${
          isSelected 
            ? 'border-blue-500 bg-white dark:bg-gray-800 shadow-blue-200 dark:shadow-blue-900' 
            : getStatusColor()
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{node.data.icon}</span>
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
              {node.data.title}
            </h3>
          </div>
          
          <div className="flex items-center gap-1">
            {getStatusIcon()}
            <button
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
              onClick={(e) => {
                e.stopPropagation()
                // Handle settings click
              }}
            >
              <Settings className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-2 leading-relaxed">
          {node.data.description}
        </p>

        {/* Outcome */}
        <div className="text-xs font-medium text-gray-900 dark:text-gray-100 mb-3">
          → {node.data.outcome}
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500 dark:text-gray-400 capitalize">
            {node.data.status}
          </div>
          
          {node.data.status === 'running' && (
            <button className="p-1 text-red-500 hover:text-red-600 rounded">
              <Pause className="h-3 w-3" />
            </button>
          )}
          
          {node.data.status === 'idle' && (
            <button className="p-1 text-green-500 hover:text-green-600 rounded">
              <Play className="h-3 w-3" />
            </button>
          )}
        </div>

        {/* Input/Output Labels */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
            <div>
              {node.inputs.length > 0 && (
                <span>In: {node.inputs.join(', ')}</span>
              )}
            </div>
            <div>
              {node.outputs.length > 0 && (
                <span>Out: {node.outputs.join(', ')}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
