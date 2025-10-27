'use client'

import React from 'react'
import { X, Settings, Play, Pause, CheckCircle } from 'lucide-react'
import { Node } from '@xyflow/react'

interface NodeDetailsPanelProps {
  node: Node | null
  onClose: () => void
}

export default function NodeDetailsPanel({ node, onClose }: NodeDetailsPanelProps) {
  if (!node) return null

  const nodeData = node.data as any

  return (
    <div className="absolute right-0 top-0 bottom-0 w-96 bg-white border-l border-gray-200 shadow-xl z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{nodeData.icon}</span>
          <h2 className="text-lg font-bold text-gray-900">{nodeData.label}</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          title="Close panel"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Status */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Status
          </label>
          <div className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full"
              style={{
                backgroundColor: nodeData.state === 'Completed' ? '#10b981' :
                               nodeData.state === 'Running' ? '#3b82f6' :
                               nodeData.state === 'Error' ? '#ef4444' :
                               '#9ca3af'
              }}
            />
            <span className="text-sm text-gray-700">{nodeData.state}</span>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Description
          </label>
          <p className="text-sm text-gray-700 leading-relaxed">
            {nodeData.description}
          </p>
        </div>

        {/* Type */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
            Module Type
          </label>
          <div className="inline-flex items-center px-3 py-1.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
            {nodeData.type}
          </div>
        </div>

        {/* Settings Placeholder */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Configuration
          </label>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1.5">Endpoint URL</label>
              <input
                type="text"
                placeholder="https://api.example.com"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5">API Key</label>
              <input
                type="password"
                placeholder="••••••••••••••••"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1.5">Polling Interval (seconds)</label>
              <input
                type="number"
                placeholder="60"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Actions
          </label>
          <div className="space-y-2">
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium">
              <Play className="h-4 w-4" />
              Start Module
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium">
              <Settings className="h-4 w-4" />
              Advanced Settings
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Node ID:</span>
              <span className="font-mono">{node.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Position:</span>
              <span className="font-mono">
                ({Math.round(node.position.x)}, {Math.round(node.position.y)})
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <button
          onClick={onClose}
          className="w-full px-4 py-2 border border-gray-300 hover:bg-white text-gray-700 rounded-lg transition-colors text-sm font-medium"
        >
          Close
        </button>
      </div>
    </div>
  )
}
