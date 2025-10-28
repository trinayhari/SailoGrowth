// API Route: Interpret database schema using LLM

import { NextRequest, NextResponse } from 'next/server'
import { openRouter } from '@/lib/services/openrouter'
import { dataConnector } from '@/lib/services/data-connector'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { connectionConfig, model, temperature } = body

    if (!connectionConfig) {
      return NextResponse.json(
        { error: 'Connection configuration is required' },
        { status: 400 }
      )
    }

    // Fetch schema from data source
    const schema = await dataConnector.fetchSchema(connectionConfig)
    
    // Convert schema to JSON string for LLM
    const schemaJson = JSON.stringify(schema, null, 2)

    // Use LLM to interpret the schema
    const interpretation = await openRouter.interpretSchema(
      schemaJson,
      model || 'anthropic/claude-3-sonnet',
      temperature || 0.7
    )

    return NextResponse.json({
      success: true,
      schema,
      interpretation,
      model: model || 'anthropic/claude-3-sonnet'
    })
  } catch (error: any) {
    console.error('Schema interpretation failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to interpret schema' },
      { status: 500 }
    )
  }
}
