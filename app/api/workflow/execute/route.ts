// API Route: Execute complete workflow

import { NextRequest, NextResponse } from 'next/server'
import { workflowExecutor } from '@/lib/services/workflow-executor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { workflowId, nodes, edges } = body

    if (!workflowId || !nodes || !edges) {
      return NextResponse.json(
        { error: 'Workflow ID, nodes, and edges are required' },
        { status: 400 }
      )
    }

    // Validate nodes have configurations
    const unconfiguredNodes = nodes.filter((node: any) => {
      return !node.data.config || Object.keys(node.data.config).length === 0
    })

    if (unconfiguredNodes.length > 0) {
      return NextResponse.json(
        {
          error: 'Some nodes are not configured',
          unconfiguredNodes: unconfiguredNodes.map((n: any) => ({
            id: n.id,
            label: n.data.label
          }))
        },
        { status: 400 }
      )
    }

    // Execute the workflow
    const execution = await workflowExecutor.executeWorkflow(
      workflowId,
      nodes,
      edges
    )

    return NextResponse.json({
      success: execution.status === 'completed',
      execution: {
        id: execution.id,
        status: execution.status,
        startedAt: execution.startedAt,
        completedAt: execution.completedAt,
        error: execution.error,
        logs: execution.logs
      }
    })
  } catch (error: any) {
    console.error('Workflow execution failed:', error)
    return NextResponse.json(
      { error: error.message || 'Workflow execution failed' },
      { status: 500 }
    )
  }
}
