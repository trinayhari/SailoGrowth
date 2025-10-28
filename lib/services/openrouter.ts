// OpenRouter API Service

export interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface OpenRouterRequest {
  model: string
  messages: OpenRouterMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
}

export interface OpenRouterResponse {
  id: string
  model: string
  choices: {
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }[]
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export class OpenRouterService {
  private apiKey: string
  private baseUrl = 'https://openrouter.ai/api/v1'

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENROUTER_API_KEY || ''
    if (!this.apiKey) {
      throw new Error('OpenRouter API key is required')
    }
  }

  async chat(request: OpenRouterRequest): Promise<OpenRouterResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': process.env.OPENROUTER_APP_URL || 'http://localhost:3001',
          'X-Title': process.env.OPENROUTER_APP_NAME || 'SailoGrowth',
        },
        body: JSON.stringify(request),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`)
      }

      const data = await response.json()
      return data as OpenRouterResponse
    } catch (error) {
      console.error('OpenRouter API call failed:', error)
      throw error
    }
  }

  async interpretSchema(schemaJson: string, model: string = 'anthropic/claude-3-sonnet', temperature: number = 0.7): Promise<string> {
    const systemPrompt = `You are a database schema analyst. Analyze the provided database schema and identify:
1. Key entities (e.g., users, events, sessions, products)
2. Important relationships between tables
3. Event tracking patterns
4. User behavior indicators
5. Business metrics that can be derived

Provide a clear, structured analysis that will help set up automated monitoring and alerts.`

    const userPrompt = `Analyze this database schema and identify key entities, relationships, and monitoring opportunities:\n\n${schemaJson}`

    const response = await this.chat({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature,
      max_tokens: 2000,
    })

    return response.choices[0].message.content
  }

  async generateMonitorQuery(
    entityDescription: string,
    condition: string,
    model: string = 'anthropic/claude-3-sonnet'
  ): Promise<{ query: string; explanation: string }> {
    const systemPrompt = `You are an SQL expert. Generate SQL queries for monitoring specific conditions in a database.
Return your response as JSON with two fields: "query" (the SQL query) and "explanation" (brief description).`

    const userPrompt = `Generate a SQL query to monitor: ${condition}

Context: ${entityDescription}

Return JSON with "query" and "explanation" fields.`

    const response = await this.chat({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.3,
      max_tokens: 1000,
    })

    try {
      const result = JSON.parse(response.choices[0].message.content)
      return result
    } catch {
      // Fallback if response isn't valid JSON
      return {
        query: response.choices[0].message.content,
        explanation: 'Generated monitoring query'
      }
    }
  }

  async generateAlertMessage(
    template: string,
    data: Record<string, any>,
    model: string = 'anthropic/claude-3-sonnet'
  ): Promise<string> {
    const systemPrompt = `You are a helpful assistant that generates alert messages based on templates and data.
Replace template variables like {{variable}} with actual values from the provided data.
Keep the message clear, concise, and actionable.`

    const userPrompt = `Template: ${template}

Data: ${JSON.stringify(data, null, 2)}

Generate the final alert message with all variables replaced.`

    const response = await this.chat({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.5,
      max_tokens: 500,
    })

    return response.choices[0].message.content
  }
}

// Export singleton instance
export const openRouter = new OpenRouterService()
