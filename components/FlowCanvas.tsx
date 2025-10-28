'use client'

import React, { useCallback, useState, useEffect } from 'react'
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Node,
  Edge,
  Connection,
  BackgroundVariant,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Plus, Save, Check, Download, Play } from 'lucide-react'
import NodeCard from './NodeCard'

const nodeTypes = {
  card: NodeCard,
}

const STORAGE_KEY = 'sailo-workflow-state'

interface FlowCanvasProps {
  onNodeSelect?: (node: Node | null) => void
}

// Initial nodes with horizontal layout - showing the 4 main system modules
const getInitialNodes = (): Node[] => [
  {
    id: 'data-connector-1',
    type: 'card',
    position: { x: 100, y: 150 },
    data: {
      label: 'Data Connector',
      icon: '🔌',
      description: 'OAuth or key-based connection to Supabase, PostHog, or BigQuery for secure data access.',
      state: 'Idle',
      type: 'data-connector',
      color: 'blue',
    },
  },
  {
    id: 'schema-interpreter-1',
    type: 'card',
    position: { x: 450, y: 150 },
    data: {
      label: 'Schema Interpreter',
      icon: '🧠',
      description: 'LLM agent that identifies key entities like users, events, and sessions from raw schemas.',
      state: 'Idle',
      type: 'schema-interpreter',
      color: 'purple',
    },
  },
  {
    id: 'monitor-builder-1',
    type: 'card',
    position: { x: 800, y: 150 },
    data: {
      label: 'Monitor Builder',
      icon: '⚙️',
      description: 'Translates natural language into SQL queries and scheduled monitoring jobs.',
      state: 'Running',
      type: 'monitor-builder',
      color: 'green',
    },
  },
  {
    id: 'action-executor-1',
    type: 'card',
    position: { x: 1150, y: 150 },
    data: {
      label: 'Action Executor',
      icon: '🔔',
      description: 'Triggers notifications via Slack, email, or API calls when conditions are met.',
      state: 'Idle',
      type: 'action-executor',
      color: 'red',
    },
  },
]

const getInitialEdges = (): Edge[] => [
  {
    id: 'e1-2',
    source: 'data-connector-1',
    target: 'schema-interpreter-1',
    type: 'smoothstep',
    style: { stroke: '#d1d5db', strokeWidth: 2 },
  },
  {
    id: 'e2-3',
    source: 'schema-interpreter-1',
    target: 'monitor-builder-1',
    type: 'smoothstep',
    style: { stroke: '#d1d5db', strokeWidth: 2 },
  },
  {
    id: 'e3-4',
    source: 'monitor-builder-1',
    target: 'action-executor-1',
    type: 'smoothstep',
    style: { stroke: '#d1d5db', strokeWidth: 2 },
  },
]

// Node type configurations
const NODE_TYPE_CONFIGS = {
  'data-connector': {
    label: 'Data Connector',
    icon: '🔌',
    description: 'OAuth or key-based connection to Supabase, PostHog, or BigQuery for secure data access.',
    color: 'blue',
    allowMultiple: true,
  },
  'schema-interpreter': {
    label: 'Schema Interpreter',
    icon: '🧠',
    description: 'LLM agent that identifies key entities like users, events, and sessions from raw schemas.',
    color: 'purple',
    allowMultiple: false,
  },
  'monitor-builder': {
    label: 'Monitor Builder',
    icon: '⚙️',
    description: 'Translates natural language into SQL queries and scheduled monitoring jobs.',
    color: 'green',
    allowMultiple: false,
  },
  'action-executor': {
    label: 'Action Executor',
    icon: '🔔',
    description: 'Triggers notifications via Slack, email, or API calls when conditions are met.',
    color: 'red',
    allowMultiple: true,
  },
} as const

export default function FlowCanvas({ onNodeSelect }: FlowCanvasProps) {
  // Start with default nodes to avoid hydration mismatch
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes())
  const [edges, setEdges, onEdgesChange] = useEdgesState(getInitialEdges())
  const [nodeIdCounter, setNodeIdCounter] = useState(6)
  const [showNodeMenu, setShowNodeMenu] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  // Load from localStorage after component mounts (client-side only)
  useEffect(() => {
    if (typeof window !== 'undefined' && !isLoaded) {
      try {
        const stored = localStorage.getItem(STORAGE_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed.nodes) setNodes(parsed.nodes)
          if (parsed.edges) setEdges(parsed.edges)
        }
      } catch (e) {
        console.warn('Failed to load workflow state from localStorage')
      }
      setIsLoaded(true)
    }
  }, [isLoaded, setNodes, setEdges])

  // Save to localStorage whenever nodes or edges change (after initial load)
  useEffect(() => {
    if (typeof window !== 'undefined' && isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, edges }))
      } catch (e) {
        console.warn('Failed to save workflow state to localStorage')
      }
    }
  }, [nodes, edges, isLoaded])

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({ 
        ...params, 
        type: 'smoothstep',
        style: { stroke: '#d1d5db', strokeWidth: 2 }
      }, eds))
    },
    [setEdges]
  )

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: Node) => {
      onNodeSelect?.(node)
    },
    [onNodeSelect]
  )

  const onPaneClick = useCallback(() => {
    onNodeSelect?.(null)
    setShowNodeMenu(false)
  }, [onNodeSelect])

  const addNewNode = useCallback((nodeType: keyof typeof NODE_TYPE_CONFIGS) => {
    const config = NODE_TYPE_CONFIGS[nodeType]
    
    // Check if this node type already exists and doesn't allow multiples
    if (!config.allowMultiple) {
      const existingNode = nodes.find(n => (n.data as any).type === nodeType)
      if (existingNode) {
        alert(`Only one ${config.label} is allowed. A ${config.label} already exists in the workflow.`)
        return
      }
    }
    
    const newNode: Node = {
      id: `${nodeType}-${nodeIdCounter}`,
      type: 'card',
      position: {
        x: Math.random() * 600 + 300,
        y: Math.random() * 300 + 150,
      },
      data: {
        label: config.label,
        icon: config.icon,
        description: config.description,
        state: 'Idle',
        type: nodeType,
        color: config.color,
      },
    }
    setNodes((nds) => [...nds, newNode])
    setNodeIdCounter((c) => c + 1)
    setShowNodeMenu(false)
  }, [nodeIdCounter, setNodes, nodes])

  const onNodesDelete = useCallback(
    (deleted: Node[]) => {
      console.log('Deleted nodes:', deleted.map(n => n.data.label))
    },
    []
  )

  const onEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      console.log('Deleted edges:', deleted.map(e => e.id))
    },
    []
  )

  const handleSaveWorkflow = useCallback(() => {
    setSaveStatus('saving')
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      try {
        const workflowData = {
          nodes,
          edges,
          savedAt: new Date().toISOString(),
        }
        localStorage.setItem(STORAGE_KEY, JSON.stringify(workflowData))
        
        // Show saved status
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch (e) {
        console.error('Failed to save workflow:', e)
        setSaveStatus('idle')
      }
    }
  }, [nodes, edges])

  const handleExportWorkflow = useCallback(() => {
    const workflowData = {
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }
    
    const dataStr = JSON.stringify(workflowData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `workflow-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [nodes, edges])

  const handleExecuteWorkflow = useCallback(async () => {
    try {
      // Transform nodes to use the correct type for backend
      const transformedNodes = nodes.map(node => ({
        ...node,
        type: node.data.type, // Use the workflow type from data.type instead of 'card'
        data: {
          ...node.data,
          config: node.data.config || {}
        }
      }))

      const response = await fetch('/api/workflow/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workflowId: `workflow-${Date.now()}`,
          nodes: transformedNodes,
          edges
        })
      })
      
      const result = await response.json()
      if (result.success) {
        alert(`✅ Workflow executed successfully!\n\nExecution ID: ${result.execution.id}\nStatus: ${result.execution.status}\nDuration: ${Math.round((new Date(result.execution.completedAt).getTime() - new Date(result.execution.startedAt).getTime()) / 1000)}s\n\nCheck your Slack for notifications!`)
      } else {
        alert(`❌ Workflow execution failed:\n${result.error || 'Unknown error'}`)
      }
    } catch (error) {
      alert(`❌ Execution failed: ${error}`)
    }
  }, [nodes, edges])

  return (
    <div className="w-full h-full bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-gray-50"
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Meta"
        selectionKeyCode="Shift"
        defaultEdgeOptions={{
          type: 'smoothstep',
          style: { stroke: '#d1d5db', strokeWidth: 2 },
        }}
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={20} 
          size={0.5}
          color="#d1d5db"
          className="bg-gray-50"
        />
        <Controls 
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
          showInteractive={false}
        />
        <MiniMap 
          nodeColor={(node) => {
            const nodeData = node.data as any
            const colorMap: Record<string, string> = {
              blue: '#3b82f6',
              purple: '#9333ea',
              green: '#10b981',
              red: '#ef4444',
              indigo: '#6366f1',
              gray: '#6b7280',
            }
            return colorMap[nodeData?.color] || '#6b7280'
          }}
          className="bg-white border border-gray-200 rounded-lg shadow-sm"
          maskColor="rgb(249, 250, 251, 0.8)"
        />
        
        {/* Add Node Button & Menu */}
        <Panel position="top-right" className="m-4">
          <div className="relative">
            <button
              onClick={() => setShowNodeMenu(!showNodeMenu)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors"
              title="Add new node"
            >
              <Plus className="h-4 w-4" />
              Add Module
            </button>

            {/* Node Type Menu */}
            {showNodeMenu && (
              <div className="absolute top-full right-0 mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
                <div className="p-3 bg-gray-50 border-b border-gray-200">
                  <h3 className="text-xs font-semibold text-gray-700 uppercase tracking-wide mb-1">
                    Select Module Type
                  </h3>
                  <p className="text-xs text-gray-500">
                    All modules have connection points to link workflows
                  </p>
                </div>
                <div className="py-1">
                  {Object.entries(NODE_TYPE_CONFIGS).map(([type, config]) => {
                    const hasExisting = !config.allowMultiple && 
                      nodes.some(n => (n.data as any).type === type)
                    
                    return (
                      <button
                        key={type}
                        onClick={() => addNewNode(type as keyof typeof NODE_TYPE_CONFIGS)}
                        disabled={hasExisting}
                        className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors flex items-start gap-3 ${
                          hasExisting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-2xl">{config.icon}</span>
                          <div className="flex flex-col gap-0.5">
                            {type !== 'data-connector' && (
                              <span className="w-2 h-2 rounded-full bg-blue-400 border border-white" title="Input"></span>
                            )}
                            {type !== 'action-executor' && (
                              <span className="w-2 h-2 rounded-full bg-green-400 border border-white" title="Output"></span>
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">
                              {config.label}
                            </span>
                            {!config.allowMultiple && (
                              <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                                {hasExisting ? 'Already added' : 'Single only'}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 line-clamp-2">
                            {config.description}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
                <div className="p-2 bg-gray-50 border-t border-gray-200">
                  <button
                    onClick={() => setShowNodeMenu(false)}
                    className="w-full text-xs text-gray-600 hover:text-gray-900 py-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </Panel>

        {/* Workflow Stats & Actions Panel */}
        <Panel position="top-left" className="m-4">
          <div className="flex items-center gap-2">
            {/* Stats */}
            <div className="bg-white border border-gray-200 rounded-lg px-4 py-2.5 shadow-sm">
              <div className="flex items-center gap-3 text-sm">
                <span className="text-gray-700 font-medium">
                  {nodes.length} modules
                </span>
                <span className="text-gray-300">|</span>
                <span className="text-gray-600">
                  {edges.length} connections
                </span>
              </div>
            </div>

            {/* Save Button */}
            <button
              onClick={handleSaveWorkflow}
              disabled={saveStatus === 'saving'}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg shadow-sm transition-all text-sm font-medium ${
                saveStatus === 'saved'
                  ? 'bg-green-600 text-white'
                  : saveStatus === 'saving'
                  ? 'bg-gray-300 text-gray-600 cursor-wait'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title="Save workflow to browser storage"
            >
              {saveStatus === 'saved' ? (
                <>
                  <Check className="h-4 w-4" />
                  Saved
                </>
              ) : saveStatus === 'saving' ? (
                <>
                  <Save className="h-4 w-4 animate-pulse" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Workflow
                </>
              )}
            </button>

            {/* Execute Button */}
            <button
              onClick={handleExecuteWorkflow}
              className="flex items-center gap-2 px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow-sm transition-colors text-sm font-medium"
              title="Execute the complete workflow"
            >
              <Play className="h-4 w-4" />
              Execute Workflow
            </button>

            {/* Export Button */}
            <button
              onClick={handleExportWorkflow}
              className="flex items-center gap-2 px-3 py-2.5 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 rounded-lg shadow-sm transition-colors text-sm font-medium"
              title="Export workflow as JSON file"
            >
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </Panel>

        {/* Instructions Panel */}
        <Panel position="bottom-left" className="m-4">
          <div className="bg-white border border-gray-200 rounded-lg px-4 py-3 shadow-sm max-w-sm">
            <div className="text-xs text-gray-500 space-y-1.5">
              <div><span className="font-medium text-gray-700">Drag</span> nodes to reposition</div>
              <div><span className="font-medium text-gray-700">Click</span> node to view details</div>
              <div><span className="font-medium text-gray-700">Click</span> edit icon to rename</div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-700">Drag</span> from
                <span className="inline-block w-2 h-2 rounded-full bg-green-400 border border-white"></span>
                (output) to
                <span className="inline-block w-2 h-2 rounded-full bg-blue-400 border border-white"></span>
                (input) to connect
              </div>
              <div><span className="font-medium text-gray-700">Delete/Backspace</span> to remove selected</div>
              <div className="pt-1 mt-1 border-t border-gray-200 space-y-1">
                <div className="text-gray-600">💡 All new nodes can be connected to build your workflow</div>
                <div className="text-gray-600">💾 Click "Save Workflow" to persist your changes</div>
              </div>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
