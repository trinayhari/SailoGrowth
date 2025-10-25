import { NextRequest, NextResponse } from 'next/server'
import { SchemaService } from '../../../lib/schema-service'

export async function GET() {
  try {
    const schemaService = new SchemaService(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const schemas = await schemaService.getTableSchemas()
    const metrics = schemaService.getCommonMetrics()

    return NextResponse.json({
      schemas,
      metrics,
      schemaContext: schemaService.generateSchemaContext()
    })

  } catch (error) {
    console.error('Schema API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch schema information' },
      { status: 500 }
    )
  }
}
