export type ConnectionType = 'supabase' | 'postgresql' | 'bigquery' | 'posthog' | 'mysql' | 'snowflake'

export interface BaseConnection {
  id: string
  name: string
  type: ConnectionType
  description?: string
  isActive: boolean
  createdAt: Date
  lastTested?: Date
  status: 'connected' | 'disconnected' | 'testing' | 'error'
}

export interface SupabaseConnection extends BaseConnection {
  type: 'supabase'
  config: {
    url: string
    anonKey: string
    serviceKey?: string
  }
}

export interface PostgreSQLConnection extends BaseConnection {
  type: 'postgresql'
  config: {
    host: string
    port: number
    database: string
    username: string
    password: string
    ssl?: boolean
  }
}

export interface BigQueryConnection extends BaseConnection {
  type: 'bigquery'
  config: {
    projectId: string
    datasetId: string
    keyFile: string // JSON key file content
    location?: string
  }
}

export interface PostHogConnection extends BaseConnection {
  type: 'posthog'
  config: {
    apiKey: string
    host: string
    projectId: string
  }
}

export interface MySQLConnection extends BaseConnection {
  type: 'mysql'
  config: {
    host: string
    port: number
    database: string
    username: string
    password: string
    ssl?: boolean
  }
}

export interface SnowflakeConnection extends BaseConnection {
  type: 'snowflake'
  config: {
    account: string
    username: string
    password: string
    database: string
    schema: string
    warehouse: string
    role?: string
  }
}

export type Connection = 
  | SupabaseConnection 
  | PostgreSQLConnection 
  | BigQueryConnection 
  | PostHogConnection 
  | MySQLConnection 
  | SnowflakeConnection

export const CONNECTION_TYPES: Record<ConnectionType, { name: string; description: string; icon: string }> = {
  supabase: {
    name: 'Supabase',
    description: 'PostgreSQL database with real-time features',
    icon: '🟢'
  },
  postgresql: {
    name: 'PostgreSQL',
    description: 'Open source relational database',
    icon: '🐘'
  },
  bigquery: {
    name: 'BigQuery',
    description: 'Google Cloud data warehouse',
    icon: '📊'
  },
  posthog: {
    name: 'PostHog',
    description: 'Product analytics platform',
    icon: '📈'
  },
  mysql: {
    name: 'MySQL',
    description: 'Popular relational database',
    icon: '🐬'
  },
  snowflake: {
    name: 'Snowflake',
    description: 'Cloud data platform',
    icon: '❄️'
  }
}

export class ConnectionManager {
  private connections: Connection[] = []

  constructor() {
    this.loadConnections()
  }

  private loadConnections() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('analytics-connections')
      if (stored) {
        try {
          this.connections = JSON.parse(stored).map((conn: any) => ({
            ...conn,
            createdAt: new Date(conn.createdAt),
            lastTested: conn.lastTested ? new Date(conn.lastTested) : undefined
          }))
        } catch (error) {
          console.error('Failed to load connections:', error)
        }
      }
    }
  }

  private saveConnections() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('analytics-connections', JSON.stringify(this.connections))
    }
  }

  getAllConnections(): Connection[] {
    return [...this.connections]
  }

  getConnection(id: string): Connection | undefined {
    return this.connections.find(conn => conn.id === id)
  }

  getActiveConnections(): Connection[] {
    return this.connections.filter(conn => conn.isActive && conn.status === 'connected')
  }

  addConnection(connection: Omit<Connection, 'id' | 'createdAt' | 'status'>): Connection {
    const newConnection: Connection = {
      ...connection,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      status: 'disconnected'
    } as Connection

    this.connections.push(newConnection)
    this.saveConnections()
    return newConnection
  }

  updateConnection(id: string, updates: Partial<Connection>): Connection | null {
    const index = this.connections.findIndex(conn => conn.id === id)
    if (index === -1) return null

    this.connections[index] = { ...this.connections[index], ...updates } as any
    this.saveConnections()
    return this.connections[index]
  }

  deleteConnection(id: string): boolean {
    const index = this.connections.findIndex(conn => conn.id === id)
    if (index === -1) return false

    this.connections.splice(index, 1)
    this.saveConnections()
    return true
  }

  async testConnection(id: string): Promise<{ success: boolean; message: string }> {
    const connection = this.getConnection(id)
    if (!connection) {
      return { success: false, message: 'Connection not found' }
    }

    this.updateConnection(id, { status: 'testing' })

    try {
      // Simulate connection testing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // In a real implementation, this would actually test the connection
      const success = Math.random() > 0.3 // 70% success rate for demo
      
      const status = success ? 'connected' : 'error'
      const message = success 
        ? 'Connection successful' 
        : 'Failed to connect. Please check your credentials.'

      this.updateConnection(id, { 
        status, 
        lastTested: new Date() 
      })

      return { success, message }
    } catch (error) {
      this.updateConnection(id, { status: 'error' })
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error' 
      }
    }
  }
}
