export interface Position {
  x: number
  y: number
}

export interface WorkflowNode {
  id: string
  type: 'data-connector' | 'schema-interpreter' | 'monitor-builder' | 'action-executor' | 'chat-interface'
  position: Position
  data: {
    title: string
    icon: string
    description: string
    outcome: string
    status: 'idle' | 'running' | 'completed' | 'error'
    config?: Record<string, any>
  }
  inputs: string[]
  outputs: string[]
}

export interface WorkflowConnection {
  id: string
  source: string
  target: string
  sourceHandle?: string
  targetHandle?: string
}

export interface WorkflowBuilderState {
  nodes: WorkflowNode[]
  connections: WorkflowConnection[]
  selectedNodeId?: string
  isRunning: boolean
  canvasPosition: Position
  canvasZoom: number
}

export const NODE_TYPES = {
  'data-connector': {
    title: 'Data Connector',
    icon: '🔌',
    description: 'OAuth or key-based connection to Supabase/PostHog/BigQuery',
    outcome: 'Secure schema introspection',
    color: 'bg-blue-500',
    inputs: [] as string[],
    outputs: ['schema'] as string[]
  },
  'schema-interpreter': {
    title: 'Schema Interpreter',
    icon: '🧠',
    description: 'LLM agent identifies key entities (users, events, sessions) and metrics',
    outcome: 'Converts structure → semantics',
    color: 'bg-purple-500',
    inputs: ['schema'] as string[],
    outputs: ['entities', 'metrics'] as string[]
  },
  'monitor-builder': {
    title: 'Monitor Builder',
    icon: '⚙️',
    description: 'From natural language ("Alert me if churn >5%") → generates query + cron job',
    outcome: 'Autonomous monitoring',
    color: 'bg-orange-500',
    inputs: ['entities', 'metrics'] as string[],
    outputs: ['monitors'] as string[]
  },
  'action-executor': {
    title: 'Action Executor',
    icon: '🔔',
    description: 'Executes triggers (Slack, email, HubSpot, billing API)',
    outcome: 'Turns detection → action',
    color: 'bg-red-500',
    inputs: ['monitors'] as string[],
    outputs: ['actions'] as string[]
  },
  'chat-interface': {
    title: 'Chat Interface',
    icon: '💬',
    description: 'Unified conversation in web UI or Slack',
    outcome: 'Human ↔ agent collaboration',
    color: 'bg-green-500',
    inputs: ['entities', 'metrics', 'monitors'] as string[],
    outputs: ['queries', 'insights'] as string[]
  }
}

export const DEFAULT_NODES: WorkflowNode[] = [
  {
    id: 'data-connector-1',
    type: 'data-connector',
    position: { x: 100, y: 100 },
    data: {
      ...NODE_TYPES['data-connector'],
      status: 'idle'
    },
    inputs: [...NODE_TYPES['data-connector'].inputs],
    outputs: [...NODE_TYPES['data-connector'].outputs]
  },
  {
    id: 'schema-interpreter-1',
    type: 'schema-interpreter',
    position: { x: 400, y: 100 },
    data: {
      ...NODE_TYPES['schema-interpreter'],
      status: 'idle'
    },
    inputs: [...NODE_TYPES['schema-interpreter'].inputs],
    outputs: [...NODE_TYPES['schema-interpreter'].outputs]
  },
  {
    id: 'monitor-builder-1',
    type: 'monitor-builder',
    position: { x: 700, y: 100 },
    data: {
      ...NODE_TYPES['monitor-builder'],
      status: 'idle'
    },
    inputs: [...NODE_TYPES['monitor-builder'].inputs],
    outputs: [...NODE_TYPES['monitor-builder'].outputs]
  },
  {
    id: 'action-executor-1',
    type: 'action-executor',
    position: { x: 1000, y: 100 },
    data: {
      ...NODE_TYPES['action-executor'],
      status: 'idle'
    },
    inputs: [...NODE_TYPES['action-executor'].inputs],
    outputs: [...NODE_TYPES['action-executor'].outputs]
  },
  {
    id: 'chat-interface-1',
    type: 'chat-interface',
    position: { x: 400, y: 400 },
    data: {
      ...NODE_TYPES['chat-interface'],
      status: 'completed'
    },
    inputs: [...NODE_TYPES['chat-interface'].inputs],
    outputs: [...NODE_TYPES['chat-interface'].outputs]
  }
]

export const DEFAULT_CONNECTIONS: WorkflowConnection[] = [
  {
    id: 'conn-1',
    source: 'data-connector-1',
    target: 'schema-interpreter-1'
  },
  {
    id: 'conn-2',
    source: 'schema-interpreter-1',
    target: 'monitor-builder-1'
  },
  {
    id: 'conn-3',
    source: 'monitor-builder-1',
    target: 'action-executor-1'
  },
  {
    id: 'conn-4',
    source: 'schema-interpreter-1',
    target: 'chat-interface-1'
  }
]

export class WorkflowBuilderManager {
  private state: WorkflowBuilderState

  constructor() {
    this.state = {
      nodes: [...DEFAULT_NODES],
      connections: [...DEFAULT_CONNECTIONS],
      isRunning: false,
      canvasPosition: { x: 0, y: 0 },
      canvasZoom: 1
    }
  }

  getState(): WorkflowBuilderState {
    return { ...this.state }
  }

  updateNodePosition(nodeId: string, position: Position): void {
    this.state.nodes = this.state.nodes.map(node =>
      node.id === nodeId ? { ...node, position } : node
    )
  }

  updateNodeStatus(nodeId: string, status: WorkflowNode['data']['status']): void {
    this.state.nodes = this.state.nodes.map(node =>
      node.id === nodeId 
        ? { ...node, data: { ...node.data, status } }
        : node
    )
  }

  addNode(type: keyof typeof NODE_TYPES, position: Position): WorkflowNode {
    const nodeType = NODE_TYPES[type]
    const newNode: WorkflowNode = {
      id: `${type}-${Date.now()}`,
      type,
      position,
      data: {
        ...nodeType,
        status: 'idle'
      },
      inputs: [...nodeType.inputs],
      outputs: [...nodeType.outputs]
    }
    
    this.state.nodes.push(newNode)
    return newNode
  }

  removeNode(nodeId: string): void {
    this.state.nodes = this.state.nodes.filter(node => node.id !== nodeId)
    this.state.connections = this.state.connections.filter(
      conn => conn.source !== nodeId && conn.target !== nodeId
    )
  }

  addConnection(source: string, target: string): WorkflowConnection {
    const newConnection: WorkflowConnection = {
      id: `conn-${Date.now()}`,
      source,
      target
    }
    
    this.state.connections.push(newConnection)
    return newConnection
  }

  removeConnection(connectionId: string): void {
    this.state.connections = this.state.connections.filter(
      conn => conn.id !== connectionId
    )
  }

  selectNode(nodeId?: string): void {
    this.state.selectedNodeId = nodeId
  }

  updateCanvasPosition(position: Position): void {
    this.state.canvasPosition = position
  }

  updateCanvasZoom(zoom: number): void {
    this.state.canvasZoom = Math.max(0.1, Math.min(2, zoom))
  }

  startWorkflow(): void {
    this.state.isRunning = true
  }

  stopWorkflow(): void {
    this.state.isRunning = false
  }

  getNodeById(nodeId: string): WorkflowNode | undefined {
    return this.state.nodes.find(node => node.id === nodeId)
  }

  getConnectionsForNode(nodeId: string): WorkflowConnection[] {
    return this.state.connections.filter(
      conn => conn.source === nodeId || conn.target === nodeId
    )
  }
}
