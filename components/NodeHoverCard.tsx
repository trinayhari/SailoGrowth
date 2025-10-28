'use client'

import React, { useState } from 'react'
import { Database, Brain, Monitor, Bell, CheckCircle2, Clock, AlertTriangle } from 'lucide-react'
import { WorkflowNode } from '../lib/workflow-builder-types'

interface NodeHoverCardProps {
  node: WorkflowNode
  children: React.ReactNode
}

// Quick preview data for hover cards - dynamic based on configuration
const getQuickPreview = (nodeType: string, nodeConfig: any) => {
  switch (nodeType) {
    case 'data-connector':
      const tables = nodeConfig?.detectedTables || []
      return {
        title: 'Data Connection',
        status: tables.length > 0 ? `Connected to ${tables.length} tables` : 'Not connected',
        icon: <Database className="h-4 w-4 text-blue-500" />,
        details: tables.length > 0 ? tables : ['No tables detected']
      }

    case 'schema-interpreter':
      const metrics = nodeConfig?.availableMetrics || []
      const entities = nodeConfig?.detectedEntities || []
      return {
        title: 'Schema Analysis',
        status: metrics.length > 0 ? `${metrics.length} metrics identified` : 'No analysis yet',
        icon: <Brain className="h-4 w-4 text-purple-500" />,
        details: entities.length > 0 ? [entities.join(', '), `${nodeConfig?.relationships?.length || 0} relationships`] : ['No entities detected']
      }

    case 'monitor-builder':
      const cron = nodeConfig?.cronExpression
      const query = nodeConfig?.generatedQuery
      return {
        title: 'Monitor Status',
        status: cron ? `Schedule: ${cron}` : 'Not configured',
        icon: <Monitor className="h-4 w-4 text-orange-500" />,
        details: [
          query ? 'SQL query generated' : 'No query generated',
          nodeConfig?.condition ? `Condition: ${nodeConfig.condition}` : 'No condition set'
        ]
      }

    case 'action-executor':
      const actionType = nodeConfig?.actionType
      const hasDestination = nodeConfig?.slackWebhook || nodeConfig?.emailRecipients
      return {
        title: 'Action Setup',
        status: actionType ? `${actionType} notifications` : 'Not configured',
        icon: <Bell className="h-4 w-4 text-red-500" />,
        details: [
          hasDestination ? 'Destination configured' : 'No destination set',
          nodeConfig?.message ? 'Message template ready' : 'No message template'
        ]
      }

    case 'chat-interface':
      const sessions = nodeConfig?.activeSessions || 0
      const chatMetrics = nodeConfig?.availableMetrics || []
      return {
        title: 'Chat Interface',
        status: sessions > 0 ? `${sessions} active conversations` : 'No active sessions',
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        details: [
          nodeConfig?.avgResponseTime ? `Response time: ${nodeConfig.avgResponseTime}ms` : 'No response data',
          `${chatMetrics.length} metrics available`
        ]
      }

    default:
      return {
        title: 'Node Status',
        status: 'Ready',
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
        details: ['Node configured']
      }
  }
}

export default function NodeHoverCard({ node, children }: NodeHoverCardProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  
  const preview = getQuickPreview(node.type, node.data.config)

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setPosition({
      x: rect.right + 10,
      y: rect.top
    })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  return (
    <>
      <div
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        {children}
      </div>

      {/* Hover Card */}
      {isVisible && (
        <div
          className="fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-3 max-w-xs"
          style={{
            left: position.x,
            top: position.y,
            transform: 'translateY(-50%)'
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-2 mb-2">
            {preview.icon}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                {preview.title}
              </h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {preview.status}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1">
            {preview.details.map((detail: string, index: number) => (
              <div key={index} className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-1">
                <div className="w-1 h-1 bg-gray-400 rounded-full" />
                {detail}
              </div>
            ))}
          </div>

          {/* Status indicator */}
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <div className={`w-2 h-2 rounded-full ${
              node.data.status === 'completed' ? 'bg-green-400' :
              node.data.status === 'running' ? 'bg-blue-400 animate-pulse' :
              node.data.status === 'error' ? 'bg-red-400' :
              'bg-gray-400'
            }`} />
            <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
              {node.data.status}
            </span>
          </div>
        </div>
      )}
    </>
  )
}
