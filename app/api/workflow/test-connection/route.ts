// API Route: Test data source connection

import { NextRequest, NextResponse } from 'next/server'
import { dataConnector } from '@/lib/services/data-connector'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { connectionConfig } = body

    if (!connectionConfig) {
      return NextResponse.json(
        { error: 'Connection configuration is required' },
        { status: 400 }
      )
    }

    const { type, endpoint, apiKey, database } = connectionConfig

    if (!type || !endpoint || !apiKey) {
      return NextResponse.json(
        { error: 'Missing required connection fields (type, endpoint, apiKey)' },
        { status: 400 }
      )
    }

    // Test the connection
    const result = await dataConnector.testConnection({
      type,
      endpoint,
      apiKey,
      database
    })

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: result.message,
        connectionTime: result.connectionTime
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.message
        },
        { status: 400 }
      )
    }
  } catch (error: any) {
    console.error('Connection test failed:', error)
    return NextResponse.json(
      { error: error.message || 'Connection test failed' },
      { status: 500 }
    )
  }
}
