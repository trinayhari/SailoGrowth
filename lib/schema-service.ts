import { createClient } from '@supabase/supabase-js'

export interface TableSchema {
  table_name: string
  columns: ColumnInfo[]
  description?: string
}

export interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: boolean
  column_default?: string
  description?: string
}

export interface MetricDefinition {
  name: string
  description: string
  sql_template: string
  category: string
}

export class SchemaService {
  private supabase: any

  constructor(supabaseUrl: string, supabaseKey: string) {
    this.supabase = createClient(supabaseUrl, supabaseKey)
  }

  async getTableSchemas(): Promise<TableSchema[]> {
    try {
      // Get all tables in the public schema
      const { data: tables, error: tablesError } = await this.supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .eq('table_type', 'BASE TABLE')

      if (tablesError) throw tablesError

      const schemas: TableSchema[] = []

      for (const table of tables) {
        const { data: columns, error: columnsError } = await this.supabase
          .from('information_schema.columns')
          .select('column_name, data_type, is_nullable, column_default')
          .eq('table_schema', 'public')
          .eq('table_name', table.table_name)
          .order('ordinal_position')

        if (columnsError) throw columnsError

        schemas.push({
          table_name: table.table_name,
          columns: columns.map((col: any) => ({
            column_name: col.column_name,
            data_type: col.data_type,
            is_nullable: col.is_nullable === 'YES',
            column_default: col.column_default
          }))
        })
      }

      return schemas
    } catch (error) {
      console.error('Error fetching schema:', error)
      return []
    }
  }

  async executeQuery(sql: string): Promise<any[]> {
    try {
      const { data, error } = await this.supabase.rpc('execute_sql', { query: sql })
      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error executing query:', error)
      throw error
    }
  }

  getCommonMetrics(): MetricDefinition[] {
    return [
      {
        name: 'activation_rate',
        description: 'Percentage of users who completed key activation events',
        sql_template: 'SELECT COUNT(DISTINCT activated_users) * 100.0 / COUNT(DISTINCT total_users) as activation_rate FROM users',
        category: 'engagement'
      },
      {
        name: 'daily_active_users',
        description: 'Number of unique users active in the last 24 hours',
        sql_template: 'SELECT COUNT(DISTINCT user_id) as dau FROM events WHERE created_at >= NOW() - INTERVAL \'1 day\'',
        category: 'engagement'
      },
      {
        name: 'retention_rate',
        description: 'Percentage of users who return after initial signup',
        sql_template: 'SELECT cohort_week, COUNT(*) as retained_users FROM user_cohorts WHERE weeks_since_signup = 1 GROUP BY cohort_week',
        category: 'retention'
      }
    ]
  }

  generateSchemaContext(): string {
    // This will be used to provide context to the LLM
    return `
Available tables and their schemas:
- users: id, email, created_at, last_active_at, plan_type
- events: id, user_id, event_name, properties, created_at
- subscriptions: id, user_id, plan_id, status, created_at, updated_at
- products: id, name, category, price, created_at

Common metrics:
- activation_rate: activated_users / total_users
- daily_active_users: unique users in last 24h
- retention_rate: users who return after signup
    `
  }
}
