import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from 'langchain/prompts'
import { LLMChain } from 'langchain/chains'
import { format } from 'sql-formatter'
import { SchemaService, TableSchema } from './schema-service'

export interface QueryResult {
  sql: string
  data: any[]
  explanation: string
  chartType?: 'line' | 'bar' | 'pie' | 'table'
  chartConfig?: any
}

export class SQLAgent {
  private llm: ChatOpenAI
  private schemaService: SchemaService

  constructor(openaiApiKey: string, schemaService: SchemaService) {
    this.llm = new ChatOpenAI({
      openAIApiKey: openaiApiKey,
      modelName: 'gpt-4',
      temperature: 0
    })
    this.schemaService = schemaService
  }

  private createSQLPrompt(): PromptTemplate {
    return new PromptTemplate({
      template: `You are a SQL expert helping product managers analyze their data. 

Database Schema:
{schema}

User Question: {question}

Previous Context: {context}

Generate a SQL query that answers the user's question. Follow these guidelines:
1. Use proper PostgreSQL syntax
2. Include appropriate WHERE clauses for time ranges when relevant
3. Use meaningful column aliases
4. Optimize for readability and performance
5. If the question asks for trends, include time grouping (daily, weekly, monthly)

Also suggest the best chart type for visualizing this data:
- 'line' for trends over time
- 'bar' for comparisons between categories
- 'pie' for proportions/percentages
- 'table' for detailed data listings

Response format:
SQL: [your sql query]
CHART_TYPE: [suggested chart type]
EXPLANATION: [brief explanation of what the query does and insights it provides]`,
      inputVariables: ['schema', 'question', 'context']
    })
  }

  async generateQuery(
    question: string, 
    context: string = '',
    schemas: TableSchema[] = []
  ): Promise<QueryResult> {
    try {
      const prompt = this.createSQLPrompt()
      const chain = new LLMChain({ llm: this.llm, prompt })

      const schemaContext = schemas.length > 0 
        ? this.formatSchemaForPrompt(schemas)
        : this.schemaService.generateSchemaContext()

      const response = await chain.call({
        schema: schemaContext,
        question,
        context
      })

      const result = this.parseResponse(response.text)
      
      // Execute the SQL query
      const data = await this.schemaService.executeQuery(result.sql)
      
      return {
        ...result,
        data,
        chartConfig: this.generateChartConfig(result.chartType || 'table', data)
      }
    } catch (error) {
      console.error('Error generating query:', error)
      throw new Error(`Failed to generate query: ${error}`)
    }
  }

  private formatSchemaForPrompt(schemas: TableSchema[]): string {
    return schemas.map(table => {
      const columns = table.columns.map(col => 
        `  ${col.column_name} (${col.data_type}${col.is_nullable ? ', nullable' : ''})`
      ).join('\n')
      
      return `Table: ${table.table_name}\n${columns}`
    }).join('\n\n')
  }

  private parseResponse(response: string): Omit<QueryResult, 'data' | 'chartConfig'> {
    const sqlMatch = response.match(/SQL:\s*(.*?)(?=CHART_TYPE:|EXPLANATION:|$)/)
    const chartTypeMatch = response.match(/CHART_TYPE:\s*(line|bar|pie|table)/)
    const explanationMatch = response.match(/EXPLANATION:\s*(.*?)$/)

    const sql = sqlMatch ? sqlMatch[1].trim() : ''
    const chartType = chartTypeMatch ? chartTypeMatch[1] as any : 'table'
    const explanation = explanationMatch ? explanationMatch[1].trim() : ''

    return {
      sql: format(sql, { language: 'postgresql' }),
      explanation,
      chartType
    }
  }

  private generateChartConfig(chartType: string, data: any[]): any {
    if (!data || data.length === 0) return null

    const firstRow = data[0]
    const keys = Object.keys(firstRow)

    switch (chartType) {
      case 'line':
        return {
          xAxis: keys.find(k => k.includes('date') || k.includes('time') || k.includes('day')) || keys[0],
          yAxis: keys.find(k => k !== keys[0]) || keys[1],
          dataKey: keys[1]
        }
      case 'bar':
        return {
          xAxis: keys[0],
          yAxis: keys[1],
          dataKey: keys[1]
        }
      case 'pie':
        return {
          dataKey: keys[1],
          nameKey: keys[0]
        }
      default:
        return { columns: keys }
    }
  }

  async suggestFollowUp(previousQuery: string, result: QueryResult): Promise<string[]> {
    const prompt = new PromptTemplate({
      template: `Based on this SQL query and its results, suggest 3 relevant follow-up questions a PM might ask:

Previous Query: {query}
Results Summary: {summary}

Suggest practical follow-up questions that would provide additional insights.`,
      inputVariables: ['query', 'summary']
    })

    const chain = new LLMChain({ llm: this.llm, prompt })
    
    const summary = `Query returned ${result.data.length} rows. Sample data: ${JSON.stringify(result.data.slice(0, 2))}`
    
    const response = await chain.call({
      query: previousQuery,
      summary
    })

    return response.text.split('\n').filter((line: string) => line.trim().length > 0).slice(0, 3)
  }
}
