// API Route: Generate monitoring query using LLM

import { NextRequest, NextResponse } from 'next/server'
import { openRouter } from '@/lib/services/openrouter'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { entityDescription, condition, model } = body

    if (!entityDescription || !condition) {
      return NextResponse.json(
        { error: 'Entity description and condition are required' },
        { status: 400 }
      )
    }

    // Use LLM to generate SQL query
    const result = await openRouter.generateMonitorQuery(
      entityDescription,
      condition,
      model || 'anthropic/claude-3-sonnet'
    )

    return NextResponse.json({
      success: true,
      query: result.query,
      explanation: result.explanation,
      model: model || 'anthropic/claude-3-sonnet'
    })
  } catch (error: any) {
    console.error('Query generation failed:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate query' },
      { status: 500 }
    )
  }
}
