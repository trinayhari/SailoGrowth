'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { Plus, ZoomIn, ZoomOut, RotateCcw, Play, Pause, Save } from 'lucide-react'
import WorkflowNode from './WorkflowNode'
import { 
  WorkflowBuilderManager, 
  WorkflowBuilderState, 
  WorkflowNode as WorkflowNodeType,
  WorkflowConnection,
  NODE_TYPES,
  Position 
} from '../lib/workflow-builder-types'

interface WorkflowBuilderProps {
  onNodeSelect?: (node: WorkflowNodeType | null) => void
  onWorkflowChange?: (state: WorkflowBuilderState) => void
}

export default function WorkflowBuilder({ onNodeSelect, onWorkflowChange }: WorkflowBuilderProps) {
  const [manager] = useState(() => new WorkflowBuilderManager())
  const [state, setState] = useState<WorkflowBuilderState>(manager.getState())
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [showNodeMenu, setShowNodeMenu] = useState(false)
  const [nodeMenuPosition, setNodeMenuPosition] = useState({ x: 0, y: 0 })
  const [connectionInProgress, setConnectionInProgress] = useState<{
    sourceId: string
    mousePos: Position
  } | null>(null)
  
  const canvasRef = useRef<HTMLDivElement>(null)
  const svgRef = useRef<SVGSVGElement>(null)

  const updateState = useCallback(() => {
    const newState = manager.getState()
    setState(newState)
    onWorkflowChange?.(newState)
  }, [manager, onWorkflowChange])

  const handleNodeDrag = (nodeId: string, position: Position) => {
    // Adjust position to account for zoom and pan
    const adjustedPosition = {
      x: (position.x - state.canvasPosition.x) / state.canvasZoom,
      y: (position.y - state.canvasPosition.y) / state.canvasZoom
    }
    manager.updateNodePosition(nodeId, adjustedPosition)
    updateState()
  }

  const handleNodeSelect = (nodeId: string) => {
    manager.selectNode(nodeId)
    const node = manager.getNodeById(nodeId)
    onNodeSelect?.(node || null)
    updateState()
  }

  const handleConnectionStart = (nodeId: string, type: 'input' | 'output') => {
    setConnectionInProgress({
      sourceId: nodeId,
      mousePos: { x: 0, y: 0 }
    })
  }

  const handleConnectionEnd = (nodeId: string, type: 'input' | 'output') => {
    if (connectionInProgress) {
      handleNodeConnect(connectionInProgress.sourceId, nodeId)
    }
    setConnectionInProgress(null)
  }

  const handleNodeConnect = (sourceId: string, targetId: string) => {
    // Prevent self-connections
    if (sourceId === targetId) return
    
    // Check if connection already exists
    const existingConnection = state.connections.find(
      conn => (conn.source === sourceId && conn.target === targetId) ||
              (conn.source === targetId && conn.target === sourceId)
    )
    
    if (existingConnection) {
      console.log('Connection already exists')
      return
    }
    
    // Validate connection based on node inputs/outputs
    const sourceNode = manager.getNodeById(sourceId)
    const targetNode = manager.getNodeById(targetId)
    
    if (!sourceNode || !targetNode) return
    
    // Check if target node can accept input from source node
    const hasCompatibleIO = sourceNode.outputs.length > 0 && targetNode.inputs.length > 0
    
    if (hasCompatibleIO) {
      manager.addConnection(sourceId, targetId)
      updateState()
      console.log(`Connected ${sourceNode.data.title} → ${targetNode.data.title}`)
    } else {
      console.log('Nodes are not compatible for connection')
    }
  }

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || e.target === svgRef.current) {
      manager.selectNode(undefined)
      onNodeSelect?.(null)
      updateState()
      setShowNodeMenu(false)
    }
  }

  const handleCanvasDoubleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      // Store screen position for menu placement
      setNodeMenuPosition({ x: e.clientX, y: e.clientY })
      setShowNodeMenu(true)
    }
  }

  const handleCanvasMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.metaKey)) { // Middle click or Cmd+click
      e.preventDefault()
      setIsPanning(true)
      setPanStart({ x: e.clientX - state.canvasPosition.x, y: e.clientY - state.canvasPosition.y })
    }
  }

  const handleCanvasMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      const newPosition = {
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      }
      manager.updateCanvasPosition(newPosition)
      updateState()
    }
  }

  const handleCanvasMouseUp = () => {
    setIsPanning(false)
  }

  const handleWheel = (e: React.WheelEvent) => {
    if (e.metaKey || e.ctrlKey) {
      e.preventDefault()
      
      const rect = canvasRef.current?.getBoundingClientRect()
      if (!rect) return
      
      // Calculate mouse position relative to canvas
      const mouseX = e.clientX - rect.left
      const mouseY = e.clientY - rect.top
      
      // Calculate zoom delta
      const delta = e.deltaY > 0 ? -0.1 : 0.1
      const newZoom = Math.max(0.1, Math.min(2, state.canvasZoom + delta))
      
      // Calculate new pan position to zoom towards mouse cursor
      const zoomRatio = newZoom / state.canvasZoom
      const newPanX = mouseX - (mouseX - state.canvasPosition.x) * zoomRatio
      const newPanY = mouseY - (mouseY - state.canvasPosition.y) * zoomRatio
      
      manager.updateCanvasZoom(newZoom)
      manager.updateCanvasPosition({ x: newPanX, y: newPanY })
      updateState()
    }
  }

  const addNode = (type: keyof typeof NODE_TYPES) => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (rect) {
      // Calculate position in canvas space accounting for zoom and pan
      const canvasX = nodeMenuPosition.x - rect.left
      const canvasY = nodeMenuPosition.y - rect.top
      const position = {
        x: (canvasX - state.canvasPosition.x) / state.canvasZoom,
        y: (canvasY - state.canvasPosition.y) / state.canvasZoom
      }
      manager.addNode(type, position)
      updateState()
      setShowNodeMenu(false)
    }
  }

  const resetCanvas = () => {
    manager.updateCanvasPosition({ x: 0, y: 0 })
    manager.updateCanvasZoom(1)
    updateState()
  }

  const zoomIn = () => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const newZoom = Math.min(2, state.canvasZoom + 0.2)
    const zoomRatio = newZoom / state.canvasZoom
    
    const newPanX = centerX - (centerX - state.canvasPosition.x) * zoomRatio
    const newPanY = centerY - (centerY - state.canvasPosition.y) * zoomRatio
    
    manager.updateCanvasZoom(newZoom)
    manager.updateCanvasPosition({ x: newPanX, y: newPanY })
    updateState()
  }

  const zoomOut = () => {
    const rect = canvasRef.current?.getBoundingClientRect()
    if (!rect) return
    
    const centerX = rect.width / 2
    const centerY = rect.height / 2
    const newZoom = Math.max(0.1, state.canvasZoom - 0.2)
    const zoomRatio = newZoom / state.canvasZoom
    
    const newPanX = centerX - (centerX - state.canvasPosition.x) * zoomRatio
    const newPanY = centerY - (centerY - state.canvasPosition.y) * zoomRatio
    
    manager.updateCanvasZoom(newZoom)
    manager.updateCanvasPosition({ x: newPanX, y: newPanY })
    updateState()
  }

  const toggleWorkflow = () => {
    if (state.isRunning) {
      manager.stopWorkflow()
    } else {
      manager.startWorkflow()
    }
    updateState()
  }

  // Add global mouse event listeners for panning
  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleCanvasMouseMove)
      document.addEventListener('mouseup', handleCanvasMouseUp)
      
      return () => {
        document.removeEventListener('mousemove', handleCanvasMouseMove)
        document.removeEventListener('mouseup', handleCanvasMouseUp)
      }
    }
  }, [isPanning, panStart])

  // Calculate connection paths
  const getConnectionPath = (connection: WorkflowConnection) => {
    const sourceNode = state.nodes.find(n => n.id === connection.source)
    const targetNode = state.nodes.find(n => n.id === connection.target)
    
    if (!sourceNode || !targetNode) return ''
    
    const sourceX = sourceNode.position.x + 256 // Node width
    const sourceY = sourceNode.position.y + 60  // Node height / 2
    const targetX = targetNode.position.x
    const targetY = targetNode.position.y + 60
    
    const midX = (sourceX + targetX) / 2
    
    return `M ${sourceX} ${sourceY} C ${midX} ${sourceY} ${midX} ${targetY} ${targetX} ${targetY}`
  }

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-100 dark:bg-gray-950"
         style={{
           '--grid-color': '#c4c4c7',
           '--grid-color-dark': '#525252'
         } as React.CSSProperties}>
      {/* Toolbar */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        {/* Workflow Status */}
        <div className="flex items-center gap-2 px-2 text-xs">
          <div className={`w-2 h-2 rounded-full ${state.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="text-gray-600 dark:text-gray-400">
            {state.nodes.length} nodes
          </span>
        </div>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
        
        <button
          onClick={toggleWorkflow}
          className={`p-2 rounded transition-colors ${
            state.isRunning 
              ? 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20' 
              : 'text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20'
          }`}
          title={state.isRunning ? 'Stop workflow' : 'Start workflow'}
        >
          {state.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
        
        <button
          onClick={zoomIn}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </button>
        
        <button
          onClick={zoomOut}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </button>
        
        <button
          onClick={resetCanvas}
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Reset view"
        >
          <RotateCcw className="h-4 w-4" />
        </button>
        
        <div className="w-px h-6 bg-gray-300 dark:bg-gray-600" />
        
        <button
          className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
          title="Save workflow"
        >
          <Save className="h-4 w-4" />
        </button>
        
        <div className="text-sm text-gray-500 dark:text-gray-400 px-2">
          {Math.round(state.canvasZoom * 100)}%
        </div>
      </div>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing relative dark:[background-image:linear-gradient(to_right,var(--grid-color-dark)_1px,transparent_1px),linear-gradient(to_bottom,var(--grid-color-dark)_1px,transparent_1px)]"
        onClick={handleCanvasClick}
        onDoubleClick={handleCanvasDoubleClick}
        onMouseDown={handleCanvasMouseDown}
        onWheel={handleWheel}
        style={{
          backgroundImage: `
            linear-gradient(to right, var(--grid-color) 1px, transparent 1px),
            linear-gradient(to bottom, var(--grid-color) 1px, transparent 1px)
          `,
          backgroundSize: `${20 * state.canvasZoom}px ${20 * state.canvasZoom}px`,
          backgroundPosition: `${state.canvasPosition.x % (20 * state.canvasZoom)}px ${state.canvasPosition.y % (20 * state.canvasZoom)}px`
        }}
      >
        {/* Connections SVG */}
        <svg
          ref={svgRef}
          className="absolute inset-0 w-full h-full"
          style={{
            transform: `translate(${state.canvasPosition.x}px, ${state.canvasPosition.y}px) scale(${state.canvasZoom})`,
            pointerEvents: 'none'
          }}
        >
          {state.connections.map((connection) => {
            const sourceNode = state.nodes.find(n => n.id === connection.source)
            const targetNode = state.nodes.find(n => n.id === connection.target)
            
            return (
              <g key={connection.id}>
                {/* Invisible thick line for easier clicking */}
                <path
                  d={getConnectionPath(connection)}
                  stroke="transparent"
                  strokeWidth="12"
                  fill="none"
                  style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation()
                    if (window.confirm(`Delete connection from ${sourceNode?.data.title} to ${targetNode?.data.title}?`)) {
                      manager.removeConnection(connection.id)
                      updateState()
                    }
                  }}
                />
                {/* Visible connection line */}
                <path
                  d={getConnectionPath(connection)}
                  stroke="#6b7280"
                  strokeWidth="2"
                  fill="none"
                  style={{ pointerEvents: 'none' }}
                  className="drop-shadow-sm transition-all"
                  markerEnd="url(#arrowhead)"
                />
              </g>
            )
          })}
          
          {/* Arrow marker */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
              />
            </marker>
          </defs>
        </svg>

        {/* Nodes Container */}
        <div
          className="absolute inset-0 origin-top-left"
          style={{
            transform: `translate(${state.canvasPosition.x}px, ${state.canvasPosition.y}px) scale(${state.canvasZoom})`
          }}
        >
          {state.nodes.map((node) => (
            <WorkflowNode
              key={node.id}
              node={node}
              isSelected={state.selectedNodeId === node.id}
              onSelect={handleNodeSelect}
              onDrag={handleNodeDrag}
              onConnect={handleNodeConnect}
              onConnectionStart={handleConnectionStart}
              onConnectionEnd={handleConnectionEnd}
              scale={state.canvasZoom}
            />
          ))}
        </div>
      </div>

      {/* Node Creation Menu */}
      {showNodeMenu && (
        <div
          className="absolute z-30 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 min-w-48"
          style={{
            left: nodeMenuPosition.x,
            top: nodeMenuPosition.y
          }}
        >
          <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 px-2">
            Add Node
          </div>
          {Object.entries(NODE_TYPES).map(([type, config]) => (
            <button
              key={type}
              onClick={() => addNode(type as keyof typeof NODE_TYPES)}
              className="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <span className="text-lg">{config.icon}</span>
              <div>
                <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {config.title}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {config.outcome}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 max-w-sm z-10">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          <div className="font-medium text-gray-900 dark:text-gray-100 mb-2">Quick Actions:</div>
          <div className="space-y-1">
            <div>• <span className="font-medium">Double-click</span> canvas to add nodes</div>
            <div>• <span className="font-medium">Drag</span> nodes to reposition</div>
            <div>• <span className="font-medium">Drag</span> connection points (⚪) to connect nodes</div>
            <div>• <span className="font-medium">Click</span> connections to delete them</div>
            <div>• <span className="font-medium">⌘ + Scroll</span> to zoom in/out</div>
            <div>• <span className="font-medium">Middle-click</span> or <span className="font-medium">⌘ + Drag</span> to pan</div>
            <div>• <span className="font-medium">Click node</span> to configure in chat</div>
          </div>
        </div>
      </div>
    </div>
  )
}
