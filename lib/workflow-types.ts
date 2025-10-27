export interface WorkflowCapability {
  id: string
  title: string
  icon: string
  description: string
  outcome: string
  status: 'pending' | 'in-progress' | 'completed' | 'error'
  progress?: number
  details?: string[]
  isActive?: boolean
}

export interface WorkflowState {
  capabilities: WorkflowCapability[]
  currentStep: number
  isRunning: boolean
  lastUpdated: Date
}

export const DEFAULT_CAPABILITIES: WorkflowCapability[] = [
  {
    id: 'data-connector',
    title: 'Data Connector',
    icon: '🔌',
    description: 'OAuth or key-based connection to Supabase/PostHog/BigQuery',
    outcome: 'Secure schema introspection',
    status: 'pending',
    progress: 0,
    details: [
      'Configure database credentials',
      'Test connection security',
      'Validate schema access'
    ]
  },
  {
    id: 'schema-interpreter',
    title: 'Schema Interpreter',
    icon: '🧠',
    description: 'LLM agent identifies key entities (users, events, sessions) and metrics',
    outcome: 'Converts structure → semantics',
    status: 'pending',
    progress: 0,
    details: [
      'Analyze database schema',
      'Identify key entities',
      'Map relationships',
      'Define semantic layer'
    ]
  },
  {
    id: 'monitor-builder',
    title: 'Monitor Builder',
    icon: '⚙️',
    description: 'From natural language ("Alert me if churn >5%") → generates query + cron job',
    outcome: 'Autonomous monitoring',
    status: 'pending',
    progress: 0,
    details: [
      'Parse monitoring requirements',
      'Generate SQL queries',
      'Set up scheduling',
      'Configure thresholds'
    ]
  },
  {
    id: 'action-executor',
    title: 'Action Executor',
    icon: '🔔',
    description: 'Executes triggers (Slack, email, HubSpot, billing API)',
    outcome: 'Turns detection → action',
    status: 'pending',
    progress: 0,
    details: [
      'Configure notification channels',
      'Set up API integrations',
      'Test trigger mechanisms',
      'Validate action execution'
    ]
  },
  {
    id: 'chat-interface',
    title: 'Chat Interface',
    icon: '💬',
    description: 'Unified conversation in web UI or Slack',
    outcome: 'Human ↔ agent collaboration',
    status: 'completed',
    progress: 100,
    details: [
      'Natural language processing',
      'Context management',
      'Response generation',
      'Interactive visualizations'
    ],
    isActive: true
  }
]

export class WorkflowManager {
  private state: WorkflowState

  constructor(initialCapabilities?: WorkflowCapability[]) {
    this.state = {
      capabilities: initialCapabilities || [...DEFAULT_CAPABILITIES],
      currentStep: 0,
      isRunning: false,
      lastUpdated: new Date()
    }
  }

  getState(): WorkflowState {
    return { ...this.state }
  }

  updateCapability(id: string, updates: Partial<WorkflowCapability>): void {
    this.state.capabilities = this.state.capabilities.map(cap =>
      cap.id === id ? { ...cap, ...updates } : cap
    )
    this.state.lastUpdated = new Date()
  }

  setCapabilityStatus(id: string, status: WorkflowCapability['status'], progress?: number): void {
    this.updateCapability(id, { status, progress })
  }

  startWorkflow(): void {
    this.state.isRunning = true
    this.state.currentStep = 0
    this.state.lastUpdated = new Date()
  }

  stopWorkflow(): void {
    this.state.isRunning = false
    this.state.lastUpdated = new Date()
  }

  nextStep(): void {
    if (this.state.currentStep < this.state.capabilities.length - 1) {
      this.state.currentStep++
      this.state.lastUpdated = new Date()
    }
  }

  resetWorkflow(): void {
    this.state.capabilities = this.state.capabilities.map(cap => ({
      ...cap,
      status: cap.id === 'chat-interface' ? 'completed' : 'pending',
      progress: cap.id === 'chat-interface' ? 100 : 0
    }))
    this.state.currentStep = 0
    this.state.isRunning = false
    this.state.lastUpdated = new Date()
  }

  getActiveCapability(): WorkflowCapability | null {
    return this.state.capabilities.find(cap => cap.isActive) || null
  }

  getCurrentCapability(): WorkflowCapability | null {
    return this.state.capabilities[this.state.currentStep] || null
  }
}
