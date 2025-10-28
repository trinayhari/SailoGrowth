// API Route: Test action executor (Slack, Email, Webhook)

import { NextRequest, NextResponse } from 'next/server'
import { actionExecutor } from '@/lib/services/action-executor'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { actionConfig } = body

    if (!actionConfig) {
      return NextResponse.json(
        { error: 'Action configuration is required' },
        { status: 400 }
      )
    }

    const { type } = actionConfig

    if (!type) {
      return NextResponse.json(
        { error: 'Action type is required' },
        { status: 400 }
      )
    }

    // Validate type-specific requirements
    if (type === 'slack' && !actionConfig.slackWebhook) {
      return NextResponse.json(
        { error: 'Slack webhook URL is required' },
        { status: 400 }
      )
    }

    if (type === 'email' && !actionConfig.emailRecipients) {
      return NextResponse.json(
        { error: 'Email recipients are required' },
        { status: 400 }
      )
    }

    if (type === 'webhook' && !actionConfig.webhookUrl) {
      return NextResponse.json(
        { error: 'Webhook URL is required' },
        { status: 400 }
      )
    }

    // Test the action
    const result = await actionExecutor.testAction(actionConfig)

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        timestamp: result.timestamp
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error || result.message
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Action test failed:', error)
    return NextResponse.json(
      { error: error.message || 'Action test failed' },
      { status: 500 }
    )
  }
}
