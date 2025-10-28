'use client'

import React, { useState } from 'react'
import { ChevronDown, ChevronRight, Database, Brain, Monitor, Bell, Code, Clock, CheckCircle2, AlertTriangle } from 'lucide-react'
import { WorkflowNode } from '../lib/workflow-builder-types'

// Utility function to format time ago
const formatTimeAgo = (timestamp: string | number | Date): string => {
  const now = new Date()
  const time = new Date(timestamp)
  const diffInSeconds = Math.floor((now.getTime() - time.getTime()) / 1000)
  
  if (diffInSeconds < 60) return `${diffInSeconds} seconds ago`
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`
  return `${Math.floor(diffInSeconds / 86400)} days ago`
}

// Utility function to format cron expression to human readable
const formatCronExpression = (cron: string): string => {
  const cronMap: { [key: string]: string } = {
    '*/5 * * * *': 'Every 5 minutes',
    '*/15 * * * *': 'Every 15 minutes', 
    '0 * * * *': 'Every hour',
    '0 */6 * * *': 'Every 6 hours',
    '0 0 * * *': 'Daily at midnight',
    '0 9 * * 1': 'Weekly on Monday at 9am'
  }
  return cronMap[cron] || `Custom schedule: ${cron}`
}

interface NodePreviewProps {
  node: WorkflowNode
  className?: string
}

// Dynamic preview data based on actual node configuration and state
const getPreviewData = (nodeType: string, nodeConfig: any, nodeData: any) => {
  switch (nodeType) {
    case 'data-connector':
      const tablesDetected = nodeConfig?.detectedTables || []
      const connectionStatus = nodeConfig?.connectionStatus || 'not_configured'
      const lastSync = nodeConfig?.lastSync || null
      
      return {
        title: 'Connection Status',
        items: [
          {
            label: 'Tables Detected',
            value: tablesDetected.length > 0 ? `${tablesDetected.length} tables` : 'No tables detected',
            detail: tablesDetected.length > 0 ? tablesDetected.join(', ') : 'Connect to data source to detect tables',
            icon: <Database className="h-4 w-4 text-blue-500" />,
            status: tablesDetected.length > 0 ? 'success' : 'warning'
          },
          {
            label: 'Connection Type',
            value: nodeConfig?.connectionType || 'Not configured',
            detail: nodeConfig?.endpoint || 'No endpoint configured',
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            status: nodeConfig?.connectionType ? 'success' : 'error'
          },
          {
            label: 'Last Sync',
            value: lastSync ? formatTimeAgo(lastSync) : 'Never synced',
            detail: connectionStatus === 'connected' ? 'Schema introspection completed' : 'Connection not established',
            icon: <Clock className="h-4 w-4 text-gray-500" />,
            status: lastSync ? 'info' : 'warning'
          }
        ]
      }

    case 'schema-interpreter':
      const detectedEntities = nodeConfig?.detectedEntities || []
      const availableMetrics = nodeConfig?.availableMetrics || []
      const relationships = nodeConfig?.relationships || []
      const schemaMapping = nodeConfig?.schemaMapping || null
      
      return {
        title: 'Schema Analysis',
        items: [
          {
            label: 'Key Entities',
            value: detectedEntities.length > 0 ? `${detectedEntities.length} identified` : 'No entities detected',
            detail: detectedEntities.length > 0 ? detectedEntities.join(', ') : 'Connect data source to analyze schema',
            icon: <Brain className="h-4 w-4 text-purple-500" />,
            status: detectedEntities.length > 0 ? 'success' : 'warning'
          },
          {
            label: 'Metrics Available',
            value: availableMetrics.length > 0 ? `${availableMetrics.length} metrics` : 'No metrics identified',
            detail: availableMetrics.length > 0 ? availableMetrics.slice(0, 4).join(', ') + (availableMetrics.length > 4 ? '...' : '') : 'Schema analysis needed',
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            status: availableMetrics.length > 0 ? 'success' : 'warning'
          },
          {
            label: 'Relationships',
            value: relationships.length > 0 ? `${relationships.length} foreign keys` : 'No relationships found',
            detail: relationships.length > 0 ? relationships.join(', ') : 'No foreign key relationships detected',
            icon: <Database className="h-4 w-4 text-blue-500" />,
            status: relationships.length > 0 ? 'success' : 'info'
          }
        ],
        codePreview: schemaMapping ? {
          title: 'Generated Schema Mapping',
          code: JSON.stringify(schemaMapping, null, 2)
        } : undefined
      }

    case 'monitor-builder':
      const cronExpression = nodeConfig?.cronExpression || null
      const queryType = nodeConfig?.queryType || null
      const condition = nodeConfig?.condition || null
      const nextRun = nodeConfig?.nextRun || null
      const generatedQuery = nodeConfig?.generatedQuery || null
      
      return {
        title: 'Monitor Configuration',
        items: [
          {
            label: 'Schedule',
            value: cronExpression || 'Not configured',
            detail: cronExpression ? formatCronExpression(cronExpression) : 'Set up monitoring schedule',
            icon: <Clock className="h-4 w-4 text-orange-500" />,
            status: cronExpression ? 'info' : 'warning'
          },
          {
            label: 'Query Type',
            value: queryType || 'Not configured',
            detail: condition || 'No monitoring condition set',
            icon: <Monitor className="h-4 w-4 text-orange-500" />,
            status: queryType && condition ? 'success' : 'warning'
          },
          {
            label: 'Next Run',
            value: nextRun ? formatTimeAgo(nextRun) : 'Not scheduled',
            detail: nextRun ? new Date(nextRun).toLocaleString() : 'Configure schedule to enable monitoring',
            icon: <AlertTriangle className="h-4 w-4 text-yellow-500" />,
            status: nextRun ? 'info' : 'warning'
          }
        ],
        codePreview: generatedQuery ? {
          title: 'Generated SQL Query',
          code: generatedQuery
        } : undefined
      }

    case 'action-executor':
      const actionType = nodeConfig?.actionType || null
      const webhookUrl = nodeConfig?.slackWebhook || nodeConfig?.webhookUrl || null
      const emailRecipients = nodeConfig?.emailRecipients || null
      const lastTriggered = nodeConfig?.lastTriggered || null
      const messageTemplate = nodeConfig?.message || nodeConfig?.messageTemplate || null
      
      // Get action type specific details
      const getActionTypeDetail = (type: string) => {
        switch (type) {
          case 'slack': return 'Slack notification'
          case 'email': return 'Email alert'
          case 'webhook': return 'Custom webhook'
          case 'hubspot': return 'HubSpot event'
          case 'api': return 'API call'
          default: return 'Not configured'
        }
      }
      
      return {
        title: 'Action Configuration',
        items: [
          {
            label: 'Action Type',
            value: actionType || 'Not configured',
            detail: actionType ? getActionTypeDetail(actionType) : 'Select an action type',
            icon: <Bell className="h-4 w-4 text-red-500" />,
            status: actionType ? 'success' : 'warning'
          },
          {
            label: 'Destination',
            value: webhookUrl || emailRecipients ? 'Configured' : 'Not configured',
            detail: webhookUrl ? '***webhook configured***' : emailRecipients ? `${emailRecipients.split(',').length} recipients` : 'No destination configured',
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            status: (webhookUrl || emailRecipients) ? 'success' : 'error'
          },
          {
            label: 'Last Triggered',
            value: lastTriggered ? formatTimeAgo(lastTriggered) : 'Never triggered',
            detail: lastTriggered ? 'Action executed successfully' : 'Waiting for monitor condition',
            icon: <Clock className="h-4 w-4 text-gray-500" />,
            status: lastTriggered ? 'success' : 'info'
          }
        ],
        codePreview: messageTemplate ? {
          title: 'Message Template Preview',
          code: messageTemplate
        } : undefined
      }

    case 'chat-interface':
      const activeSessions = nodeConfig?.activeSessions || 0
      const chatAvailableMetrics = nodeConfig?.availableMetrics || []
      const avgResponseTime = nodeConfig?.avgResponseTime || null
      
      return {
        title: 'Chat Interface Status',
        items: [
          {
            label: 'Active Sessions',
            value: activeSessions > 0 ? `${activeSessions} conversations` : 'No active sessions',
            detail: activeSessions > 0 ? 'Users asking about metrics' : 'Waiting for user interactions',
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            status: activeSessions > 0 ? 'success' : 'info'
          },
          {
            label: 'Available Data',
            value: chatAvailableMetrics.length > 0 ? `${chatAvailableMetrics.length} metrics` : 'No data available',
            detail: chatAvailableMetrics.length > 0 ? 'From schema interpreter' : 'Connect data sources first',
            icon: <Database className="h-4 w-4 text-blue-500" />,
            status: chatAvailableMetrics.length > 0 ? 'success' : 'warning'
          },
          {
            label: 'Response Time',
            value: avgResponseTime ? `${avgResponseTime}ms avg` : 'Not measured',
            detail: avgResponseTime ? 'Average query execution' : 'No queries executed yet',
            icon: <Clock className="h-4 w-4 text-green-500" />,
            status: avgResponseTime ? 'success' : 'info'
          }
        ]
      }

    default:
      return {
        title: 'Node Status',
        items: [
          {
            label: 'Status',
            value: 'Ready',
            detail: 'Node is configured and ready',
            icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
            status: 'success'
          }
        ]
      }
  }
}

export default function NodePreview({ node, className = '' }: NodePreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [activeTab, setActiveTab] = useState<'status' | 'code'>('status')
  
  const previewData = getPreviewData(node.type, node.data.config, node.data)
  const hasCodePreview = 'codePreview' in previewData

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50'
      case 'warning': return 'text-yellow-600 bg-yellow-50'
      case 'error': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className={`border-t border-gray-100 ${className}`}>
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500" />
          )}
          <span className="text-sm font-medium text-gray-700">Preview</span>
          <span className="text-xs text-gray-500">
            ({previewData.items.length} items)
          </span>
        </div>
        <div className="flex items-center gap-1">
          {previewData.items.slice(0, 3).map((item, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full ${
                item.status === 'success' ? 'bg-green-400' :
                item.status === 'warning' ? 'bg-yellow-400' :
                item.status === 'error' ? 'bg-red-400' :
                'bg-gray-400'
              }`}
            />
          ))}
        </div>
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-3 pb-3">
          {/* Tabs */}
          {hasCodePreview && (
            <div className="flex border-b border-gray-200 mb-3">
              <button
                onClick={() => setActiveTab('status')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'status'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Status
              </button>
              <button
                onClick={() => setActiveTab('code')}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === 'code'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <Code className="h-4 w-4 inline mr-1" />
                Code
              </button>
            </div>
          )}

          {/* Status Tab */}
          {activeTab === 'status' && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                {previewData.title}
              </h4>
              
              <div className="space-y-2">
                {previewData.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-2 rounded-lg bg-gray-50"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {item.label}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(item.status)}`}>
                          {item.value}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Code Tab */}
          {activeTab === 'code' && hasCodePreview && 'codePreview' in previewData && previewData.codePreview && (
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-800 mb-2">
                {previewData.codePreview.title}
              </h4>
              
              <div className="relative">
                <pre className="text-xs bg-gray-900 text-gray-100 p-3 rounded-lg overflow-x-auto">
                  <code>{previewData.codePreview.code}</code>
                </pre>
                <button
                  onClick={() => navigator.clipboard.writeText(previewData.codePreview?.code || '')}
                  className="absolute top-2 right-2 p-1 text-gray-400 hover:text-gray-200 transition-colors"
                  title="Copy to clipboard"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
