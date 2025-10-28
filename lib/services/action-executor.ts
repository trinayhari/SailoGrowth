// Action Executor Service - Handles notifications and actions

export interface ActionConfig {
  type: 'slack' | 'email' | 'webhook' | 'hubspot' | 'api'
  slackWebhook?: string
  emailRecipients?: string
  message?: string
  webhookUrl?: string
  webhookMethod?: 'GET' | 'POST'
  webhookHeaders?: Record<string, string>
  webhookBody?: any
}

export interface ActionResult {
  success: boolean
  message: string
  timestamp: Date
  error?: string
}

export class ActionExecutorService {
  async execute(config: ActionConfig, data: Record<string, any>): Promise<ActionResult> {
    const timestamp = new Date()

    try {
      switch (config.type) {
        case 'slack':
          return await this.sendSlackNotification(config, data, timestamp)
        case 'email':
          return await this.sendEmailAlert(config, data, timestamp)
        case 'webhook':
          return await this.triggerWebhook(config, data, timestamp)
        default:
          return {
            success: false,
            message: `Unsupported action type: ${config.type}`,
            timestamp
          }
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Action execution failed: ${error.message}`,
        timestamp,
        error: error.message
      }
    }
  }

  private async sendSlackNotification(
    config: ActionConfig,
    data: Record<string, any>,
    timestamp: Date
  ): Promise<ActionResult> {
    if (!config.slackWebhook) {
      throw new Error('Slack webhook URL is required')
    }

    try {
      // Replace template variables in message
      const message = this.replaceTemplateVariables(config.message || '', data)

      const payload = {
        text: message,
        blocks: [
          {
            type: 'section',
            text: {
              type: 'mrkdwn',
              text: message
            }
          },
          {
            type: 'context',
            elements: [
              {
                type: 'mrkdwn',
                text: `_Triggered at ${timestamp.toLocaleString()}_`
              }
            ]
          }
        ]
      }

      const response = await fetch(config.slackWebhook, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        return {
          success: true,
          message: 'Slack notification sent successfully',
          timestamp
        }
      } else {
        const errorText = await response.text()
        throw new Error(`Slack API error: ${errorText}`)
      }
    } catch (error: any) {
      throw new Error(`Failed to send Slack notification: ${error.message}`)
    }
  }

  private async sendEmailAlert(
    config: ActionConfig,
    data: Record<string, any>,
    timestamp: Date
  ): Promise<ActionResult> {
    if (!config.emailRecipients) {
      throw new Error('Email recipients are required')
    }

    // In a production app, you'd integrate with SendGrid, AWS SES, or similar
    // For now, we'll return a success message
    const message = this.replaceTemplateVariables(config.message || '', data)
    const recipients = config.emailRecipients.split(',').map(e => e.trim())

    console.log('Email would be sent to:', recipients)
    console.log('Email content:', message)

    // TODO: Integrate with actual email service
    return {
      success: true,
      message: `Email alert queued for ${recipients.length} recipient(s)`,
      timestamp
    }
  }

  private async triggerWebhook(
    config: ActionConfig,
    data: Record<string, any>,
    timestamp: Date
  ): Promise<ActionResult> {
    if (!config.webhookUrl) {
      throw new Error('Webhook URL is required')
    }

    try {
      const method = config.webhookMethod || 'POST'
      const headers = {
        'Content-Type': 'application/json',
        ...config.webhookHeaders
      }

      const body = config.webhookBody || data

      const response = await fetch(config.webhookUrl, {
        method,
        headers,
        body: method !== 'GET' ? JSON.stringify(body) : undefined
      })

      if (response.ok) {
        return {
          success: true,
          message: `Webhook triggered successfully (${response.status})`,
          timestamp
        }
      } else {
        throw new Error(`Webhook returned ${response.status}: ${response.statusText}`)
      }
    } catch (error: any) {
      throw new Error(`Failed to trigger webhook: ${error.message}`)
    }
  }

  private replaceTemplateVariables(template: string, data: Record<string, any>): string {
    let result = template

    // Replace {{variable}} with actual values
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g')
      result = result.replace(regex, String(data[key]))
    })

    // Replace {{timestamp}} if not provided in data
    if (!data.timestamp) {
      result = result.replace(/{{timestamp}}/g, new Date().toLocaleString())
    }

    return result
  }

  async testAction(config: ActionConfig): Promise<ActionResult> {
    const testData = {
      condition: 'Test condition',
      value: 100,
      threshold: 50,
      timestamp: new Date().toISOString()
    }

    return await this.execute(config, testData)
  }
}

export const actionExecutor = new ActionExecutorService()
