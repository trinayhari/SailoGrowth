// Workflow Type Definitions

export interface WorkflowNode {
  id: string
  type: 'data-connector' | 'schema-interpreter' | 'monitor-builder' | 'action-executor'
  position: { x: number; y: number }
  data: {
    label: string
    icon: string
    description: string
    state: 'Idle' | 'Running' | 'Completed' | 'Error'
    type: string
    color: string
    config?: NodeConfig
  }
}

export interface WorkflowEdge {
  id: string
  source: string
  target: string
  type?: string
  style?: Record<string, any>
}

export interface NodeConfig {
  // Data Connector
  connectionType?: 'supabase' | 'posthog' | 'bigquery' | 'postgresql' | 'mysql'
  
  // REST API connections (Supabase, PostHog)
  endpoint?: string
  apiKey?: string
  database?: string
  
  // Direct SQL connections (PostgreSQL, MySQL)
  host?: string
  port?: number
  username?: string
  password?: string
  
  // BigQuery
  projectId?: string
  datasetId?: string
  credentials?: string // JSON string or file path
  
  // Schema Interpreter
  model?: string
  temperature?: number
  schemaDetected?: string
  
  // Monitor Builder
  cronExpression?: string
  queryType?: 'count' | 'sum' | 'average' | 'threshold' | 'change'
  condition?: string
  
  // Action Executor
  actionType?: 'slack' | 'email' | 'webhook' | 'hubspot' | 'api'
  slackWebhook?: string
  emailRecipients?: string
  message?: string
}

export interface WorkflowExecution {
  id: string
  workflowId: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  startedAt: Date
  completedAt?: Date
  error?: string
  logs: ExecutionLog[]
}

export interface ExecutionLog {
  nodeId: string
  timestamp: Date
  level: 'info' | 'warn' | 'error'
  message: string
  data?: any
}

export interface DataSchema {
  tables: SchemaTable[]
  relationships: SchemaRelationship[]
  entities: DetectedEntity[]
}

export interface SchemaTable {
  name: string
  columns: SchemaColumn[]
  rowCount?: number
}

export interface SchemaColumn {
  name: string
  type: string
  nullable: boolean
  primaryKey?: boolean
  foreignKey?: {
    table: string
    column: string
  }
}

export interface SchemaRelationship {
  from: { table: string; column: string }
  to: { table: string; column: string }
  type: 'one-to-one' | 'one-to-many' | 'many-to-many'
}

export interface DetectedEntity {
  name: string
  table: string
  description: string
  keyFields: string[]
  eventFields?: string[]
}
