'use client'

import React, { useState } from 'react'
import { X, Settings, Play, Pause, CheckCircle, Save } from 'lucide-react'
import { Node } from '@xyflow/react'

interface NodeDetailsPanelProps {
  node: Node | null
  onClose: () => void
  onUpdate?: (nodeId: string, updates: any) => void
}

export default function NodeDetailsPanel({ node, onClose, onUpdate }: NodeDetailsPanelProps) {
  if (!node) return null

  const nodeData = node.data as any
  
  // Configuration state
  const [config, setConfig] = useState({
    // Data Connector - REST API
    connectionType: nodeData.config?.connectionType || 'supabase',
    endpoint: nodeData.config?.endpoint || '',
    apiKey: nodeData.config?.apiKey || '',
    database: nodeData.config?.database || '',
    
    // Data Connector - Direct SQL
    host: nodeData.config?.host || '',
    port: nodeData.config?.port || 5432,
    username: nodeData.config?.username || '',
    password: nodeData.config?.password || '',
    
    // Data Connector - BigQuery
    projectId: nodeData.config?.projectId || '',
    datasetId: nodeData.config?.datasetId || '',
    credentials: nodeData.config?.credentials || '',
    
    // Schema Interpreter
    model: nodeData.config?.model || 'gpt-4',
    temperature: nodeData.config?.temperature || 0.7,
    schemaDetected: nodeData.config?.schemaDetected || '',
    
    // Monitor Builder
    cronExpression: nodeData.config?.cronExpression || '0 */6 * * *',
    queryType: nodeData.config?.queryType || 'count',
    condition: nodeData.config?.condition || '',
    
    // Action Executor
    actionType: nodeData.config?.actionType || 'slack',
    slackWebhook: nodeData.config?.slackWebhook || '',
    emailRecipients: nodeData.config?.emailRecipients || '',
    message: nodeData.config?.message || '',
  })

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(node.id, { config })
    }
  }

  return (
    <div className="bg-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-blue-50 border-b border-blue-100">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{nodeData.icon}</span>
          <h2 className="text-base font-bold text-gray-900">{nodeData.label}</h2>
        </div>
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
          <span className="text-xs text-gray-600">{nodeData.state}</span>
        </div>
      </div>

      {/* Content */}
      <div className="overflow-y-auto p-4 space-y-4">
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

        {/* Type-Specific Configuration */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Configuration
          </label>
          
          {/* Data Connector Configuration */}
          {nodeData.type === 'data-connector' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Connection Type</label>
                <select
                  value={config.connectionType}
                  onChange={(e) => setConfig({ ...config, connectionType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="supabase">Supabase (REST API)</option>
                  <option value="posthog">PostHog (REST API)</option>
                  <option value="bigquery">BigQuery (GCP)</option>
                  <option value="postgresql">PostgreSQL (Direct)</option>
                  <option value="mysql">MySQL (Direct)</option>
                </select>
              </div>

              {/* Supabase & PostHog - REST API fields */}
              {(config.connectionType === 'supabase' || config.connectionType === 'posthog') && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Endpoint URL</label>
                    <input
                      type="text"
                      value={config.endpoint}
                      onChange={(e) => setConfig({ ...config, endpoint: e.target.value })}
                      placeholder={config.connectionType === 'supabase' ? 'https://xyz.supabase.co' : 'https://app.posthog.com'}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">
                      {config.connectionType === 'supabase' ? 'API Key (anon/service_role)' : 'Personal API Key'}
                    </label>
                    <input
                      type="password"
                      value={config.apiKey}
                      onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  {config.connectionType === 'supabase' && (
                    <div>
                      <label className="block text-xs text-gray-600 mb-1.5">Database Name (optional)</label>
                      <input
                        type="text"
                        value={config.database}
                        onChange={(e) => setConfig({ ...config, database: e.target.value })}
                        placeholder="postgres"
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                </>
              )}

              {/* PostgreSQL & MySQL - Direct SQL fields */}
              {(config.connectionType === 'postgresql' || config.connectionType === 'mysql') && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Host</label>
                    <input
                      type="text"
                      value={config.host}
                      onChange={(e) => setConfig({ ...config, host: e.target.value })}
                      placeholder="db.example.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Port</label>
                    <input
                      type="number"
                      value={config.port}
                      onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) })}
                      placeholder={config.connectionType === 'postgresql' ? '5432' : '3306'}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Username</label>
                    <input
                      type="text"
                      value={config.username}
                      onChange={(e) => setConfig({ ...config, username: e.target.value })}
                      placeholder="db_user"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Password</label>
                    <input
                      type="password"
                      value={config.password}
                      onChange={(e) => setConfig({ ...config, password: e.target.value })}
                      placeholder="••••••••••••••••"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Database Name</label>
                    <input
                      type="text"
                      value={config.database}
                      onChange={(e) => setConfig({ ...config, database: e.target.value })}
                      placeholder="my_database"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </>
              )}

              {/* BigQuery - GCP fields */}
              {config.connectionType === 'bigquery' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Project ID</label>
                    <input
                      type="text"
                      value={config.projectId}
                      onChange={(e) => setConfig({ ...config, projectId: e.target.value })}
                      placeholder="my-gcp-project"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Dataset ID</label>
                    <input
                      type="text"
                      value={config.datasetId}
                      onChange={(e) => setConfig({ ...config, datasetId: e.target.value })}
                      placeholder="my_dataset"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Service Account JSON</label>
                    <textarea
                      value={config.credentials}
                      onChange={(e) => setConfig({ ...config, credentials: e.target.value })}
                      placeholder='{"type":"service_account",...}'
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                      rows={4}
                    />
                  </div>
                </>
              )}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> {
                    config.connectionType === 'supabase' ? 'Get your API keys from Supabase dashboard > Settings > API' :
                    config.connectionType === 'posthog' ? 'Create a personal API key in PostHog Settings > My Account' :
                    config.connectionType === 'bigquery' ? 'Upload your GCP service account JSON credentials' :
                    'Ensure your database allows connections from this server'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Schema Interpreter Configuration */}
          {nodeData.type === 'schema-interpreter' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">LLM Model</label>
                <select
                  value={config.model}
                  onChange={(e) => setConfig({ ...config, model: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="gpt-4">GPT-4 (Most Accurate)</option>
                  <option value="gpt-3.5-turbo">GPT-3.5 Turbo (Fast)</option>
                  <option value="claude-3-opus">Claude 3 Opus</option>
                  <option value="claude-3-sonnet">Claude 3 Sonnet</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Temperature ({config.temperature})</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={config.temperature}
                  onChange={(e) => setConfig({ ...config, temperature: parseFloat(e.target.value) })}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Precise</span>
                  <span>Creative</span>
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Detected Schema (Read-only)</label>
                <textarea
                  value={config.schemaDetected || 'No schema detected yet. Connect a data source to begin analysis.'}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50 text-gray-600"
                  rows={4}
                />
              </div>
            </div>
          )}

          {/* Monitor Builder Configuration */}
          {nodeData.type === 'monitor-builder' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Cron Expression</label>
                <select
                  value={config.cronExpression}
                  onChange={(e) => setConfig({ ...config, cronExpression: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="*/5 * * * *">Every 5 minutes</option>
                  <option value="*/15 * * * *">Every 15 minutes</option>
                  <option value="0 * * * *">Every hour</option>
                  <option value="0 */6 * * *">Every 6 hours</option>
                  <option value="0 0 * * *">Daily at midnight</option>
                  <option value="0 9 * * 1">Weekly on Monday at 9am</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Query Type</label>
                <select
                  value={config.queryType}
                  onChange={(e) => setConfig({ ...config, queryType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="count">Count Records</option>
                  <option value="sum">Sum Values</option>
                  <option value="average">Calculate Average</option>
                  <option value="threshold">Threshold Check</option>
                  <option value="change">Detect Change</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Condition / Threshold</label>
                <input
                  type="text"
                  value={config.condition}
                  onChange={(e) => setConfig({ ...config, condition: e.target.value })}
                  placeholder="e.g., > 100 or < 50%"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-xs text-blue-800">
                  <strong>Next run:</strong> {new Date(Date.now() + 6 * 60 * 60 * 1000).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Action Executor Configuration */}
          {nodeData.type === 'action-executor' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1.5">Action Type</label>
                <select
                  value={config.actionType}
                  onChange={(e) => setConfig({ ...config, actionType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="slack">Slack Notification</option>
                  <option value="email">Email Alert</option>
                  <option value="webhook">Custom Webhook</option>
                  <option value="hubspot">HubSpot Event</option>
                  <option value="api">API Call</option>
                </select>
              </div>
              
              {config.actionType === 'slack' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Slack Webhook URL</label>
                    <input
                      type="text"
                      value={config.slackWebhook}
                      onChange={(e) => setConfig({ ...config, slackWebhook: e.target.value })}
                      placeholder="https://hooks.slack.com/services/..."
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Message Template</label>
                    <textarea
                      value={config.message}
                      onChange={(e) => setConfig({ ...config, message: e.target.value })}
                      placeholder="🚨 Alert: {{condition}} detected at {{timestamp}}"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </>
              )}
              
              {config.actionType === 'email' && (
                <>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Email Recipients (comma-separated)</label>
                    <input
                      type="text"
                      value={config.emailRecipients}
                      onChange={(e) => setConfig({ ...config, emailRecipients: e.target.value })}
                      placeholder="team@example.com, alerts@example.com"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1.5">Email Template</label>
                    <textarea
                      value={config.message}
                      onChange={(e) => setConfig({ ...config, message: e.target.value })}
                      placeholder="Alert triggered: {{details}}"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      rows={3}
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div>
          <label className="block text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Actions
          </label>
          <div className="space-y-2">
            <button 
              onClick={handleSave}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
            >
              <Save className="h-4 w-4" />
              Save Configuration
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium">
              <Play className="h-4 w-4" />
              Test Connection
            </button>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg transition-colors text-sm font-medium">
              <Settings className="h-4 w-4" />
              Advanced Settings
            </button>
          </div>
        </div>

        {/* Metadata */}
        <div className="pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Node ID:</span>
              <span className="font-mono text-gray-700">{node.id}</span>
            </div>
            <div className="flex justify-between">
              <span>Position:</span>
              <span className="font-mono text-gray-700">
                ({Math.round(node.position.x)}, {Math.round(node.position.y)})
              </span>
            </div>
            <div className="flex justify-between">
              <span>Type:</span>
              <span className="text-gray-700">{nodeData.type}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
