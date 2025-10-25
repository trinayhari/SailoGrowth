import { NextRequest, NextResponse } from 'next/server'
import { SQLAgent } from '../../../lib/sql-agent'
import { SchemaService } from '../../../lib/schema-service'

export async function POST(request: NextRequest) {
  try {
    const { question, context } = await request.json()

    if (!question) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    // Initialize services
    const schemaService = new SchemaService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const sqlAgent = new SQLAgent(
      process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
      schemaService
    )

    // Generate and execute query
    const result = await sqlAgent.generateQuery(question, context || '')
    
    // Get follow-up suggestions
    const followUpSuggestions = await sqlAgent.suggestFollowUp(question, result)

    return NextResponse.json({
      result,
      followUpSuggestions
    })

  } catch (error) {
    console.error('Query API error:', error)
    return NextResponse.json(
      { error: 'Failed to process query' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Query API is running' })
}
