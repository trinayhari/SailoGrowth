// Workflow Execution Engine

import { WorkflowNode, WorkflowEdge, WorkflowExecution, ExecutionLog } from '../types/workflow'
import { dataConnector } from './data-connector'
import { openRouter } from './openrouter'
import { actionExecutor } from './action-executor'

export class WorkflowExecutor {
  private execution: WorkflowExecution | null = null

  async executeWorkflow(
    workflowId: string,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[]
  ): Promise<WorkflowExecution> {
    this.execution = {
      id: `exec-${Date.now()}`,
      workflowId,
      status: 'running',
      startedAt: new Date(),
      logs: []
    }

    try {
      this.log('info', 'workflow', 'Workflow execution started')

      // Build execution order based on edges
      const executionOrder = this.buildExecutionOrder(nodes, edges)
      this.log('info', 'workflow', `Execution order: ${executionOrder.map(n => n.data.label).join(' → ')}`)

      // Execute nodes in order
      const context: Record<string, any> = {}

      for (const node of executionOrder) {
        await this.executeNode(node, context)
      }

      this.execution.status = 'completed'
      this.execution.completedAt = new Date()
      this.log('info', 'workflow', 'Workflow execution completed successfully')

      return this.execution
    } catch (error: any) {
      this.execution.status = 'failed'
      this.execution.completedAt = new Date()
      this.execution.error = error.message
      this.log('error', 'workflow', `Workflow execution failed: ${error.message}`)

      return this.execution
    }
  }

  private buildExecutionOrder(nodes: WorkflowNode[], edges: WorkflowEdge[]): WorkflowNode[] {
    // Simple topological sort
    const nodeMap = new Map<string, WorkflowNode>()
    const inDegree = new Map<string, number>()
    const adjList = new Map<string, string[]>()

    // Initialize
    nodes.forEach(node => {
      nodeMap.set(node.id, node)
      inDegree.set(node.id, 0)
      adjList.set(node.id, [])
    })

    // Build graph
    edges.forEach(edge => {
      adjList.get(edge.source)?.push(edge.target)
      inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1)
    })

    // Kahn's algorithm
    const queue: string[] = []
    inDegree.forEach((degree, nodeId) => {
      if (degree === 0) queue.push(nodeId)
    })

    const result: WorkflowNode[] = []
    while (queue.length > 0) {
      const nodeId = queue.shift()!
      const node = nodeMap.get(nodeId)!
      result.push(node)

      adjList.get(nodeId)?.forEach(neighbor => {
        const newDegree = (inDegree.get(neighbor) || 0) - 1
        inDegree.set(neighbor, newDegree)
        if (newDegree === 0) queue.push(neighbor)
      })
    }

    return result
  }

  private async executeNode(node: WorkflowNode, context: Record<string, any>): Promise<void> {
    this.log('info', node.id, `Executing node: ${node.data.label}`)

    try {
      switch (node.type) {
        case 'data-connector':
          await this.executeDataConnector(node, context)
          break
        case 'schema-interpreter':
          await this.executeSchemaInterpreter(node, context)
          break
        case 'monitor-builder':
          await this.executeMonitorBuilder(node, context)
          break
        case 'action-executor':
          await this.executeActionExecutor(node, context)
          break
        default:
          throw new Error(`Unknown node type: ${node.type}`)
      }

      this.log('info', node.id, `Node completed successfully`)
    } catch (error: any) {
      this.log('error', node.id, `Node execution failed: ${error.message}`)
      throw error
    }
  }

  private async executeDataConnector(node: WorkflowNode, context: Record<string, any>): Promise<void> {
    const config = node.data.config
    if (!config || !config.connectionType || !config.endpoint || !config.apiKey) {
      throw new Error('Data connector configuration is incomplete')
    }

    // Test connection
    const testResult = await dataConnector.testConnection({
      type: config.connectionType,
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      database: config.database
    })

    if (!testResult.success) {
      throw new Error(`Connection failed: ${testResult.message}`)
    }

    // Fetch schema
    const schema = await dataConnector.fetchSchema({
      type: config.connectionType,
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      database: config.database
    })

    // Store in context for next nodes
    context.connectionConfig = {
      type: config.connectionType,
      endpoint: config.endpoint,
      apiKey: config.apiKey,
      database: config.database
    }
    context.schema = schema

    this.log('info', node.id, `Connected to ${config.connectionType}, found ${schema.tables.length} tables`)
  }

  private async executeSchemaInterpreter(node: WorkflowNode, context: Record<string, any>): Promise<void> {
    if (!context.schema) {
      throw new Error('No schema available. Connect a data source first.')
    }

    const config = node.data.config
    const model = config?.model || 'anthropic/claude-3-sonnet'
    const temperature = config?.temperature || 0.7

    const schemaJson = JSON.stringify(context.schema, null, 2)
    const interpretation = await openRouter.interpretSchema(schemaJson, model, temperature)

    context.schemaInterpretation = interpretation

    this.log('info', node.id, `Schema interpreted using ${model}`)
  }

  private async executeMonitorBuilder(node: WorkflowNode, context: Record<string, any>): Promise<void> {
    if (!context.schemaInterpretation) {
      throw new Error('No schema interpretation available')
    }

    const config = node.data.config
    if (!config?.condition) {
      throw new Error('Monitor condition not configured')
    }

    // Generate monitoring query
    const queryResult = await openRouter.generateMonitorQuery(
      context.schemaInterpretation,
      config.condition,
      config.model || 'anthropic/claude-3-sonnet'
    )

    // Execute the query
    if (context.connectionConfig) {
      const results = await dataConnector.executeQuery(
        context.connectionConfig,
        queryResult.query
      )

      context.monitorResults = results
      context.monitorQuery = queryResult.query

      this.log('info', node.id, `Monitor executed: ${queryResult.explanation}`)
      this.log('info', node.id, `Results: ${JSON.stringify(results).substring(0, 200)}...`)
    }
  }

  private async executeActionExecutor(node: WorkflowNode, context: Record<string, any>): Promise<void> {
    const config = node.data.config
    if (!config?.actionType) {
      throw new Error('Action type not configured')
    }

    // Prepare action data from context
    const actionData = {
      condition: context.monitorQuery || 'Unknown condition',
      results: context.monitorResults || [],
      timestamp: new Date().toISOString(),
      workflow: this.execution?.workflowId
    }

    // Execute action
    const result = await actionExecutor.execute(
      {
        type: config.actionType,
        slackWebhook: config.slackWebhook,
        emailRecipients: config.emailRecipients,
        message: config.message,
        webhookUrl: config.webhookUrl
      },
      actionData
    )

    if (!result.success) {
      throw new Error(`Action failed: ${result.error || result.message}`)
    }

    context.actionResult = result

    this.log('info', node.id, `Action executed: ${result.message}`)
  }

  private log(level: 'info' | 'warn' | 'error', nodeId: string, message: string, data?: any): void {
    if (!this.execution) return

    const log: ExecutionLog = {
      nodeId,
      timestamp: new Date(),
      level,
      message,
      data
    }

    this.execution.logs.push(log)
    console.log(`[${level.toUpperCase()}] ${nodeId}: ${message}`, data || '')
  }
}

export const workflowExecutor = new WorkflowExecutor()
