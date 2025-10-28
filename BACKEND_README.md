# SailoGrowth Workflow Backend

Complete backend implementation for the workflow automation system.

## 🏗️ Architecture

```
User Interface (React Flow)
         ↓
  API Routes (Next.js)
         ↓
  Service Layer
    ├─ OpenRouter Service (LLM)
    ├─ Data Connector (Supabase/PostHog/etc)
    ├─ Action Executor (Slack/Email/Webhook)
    └─ Workflow Executor (Orchestration)
```

## 📁 Project Structure

```
lib/
├── types/
│   └── workflow.ts              # TypeScript type definitions
└── services/
    ├── openrouter.ts            # LLM integration (OpenRouter)
    ├── data-connector.ts        # Database connections
    ├── action-executor.ts       # Notifications & actions
    └── workflow-executor.ts     # Workflow orchestration

app/api/workflow/
├── interpret-schema/
│   └── route.ts                 # POST: Analyze schema with LLM
├── test-connection/
│   └── route.ts                 # POST: Test data source connection
├── test-action/
│   └── route.ts                 # POST: Test notification/action
├── generate-query/
│   └── route.ts                 # POST: Generate monitoring query
└── execute/
    └── route.ts                 # POST: Execute complete workflow
```

## 🔑 Environment Setup

Create `.env.local` in project root:

```bash
# OpenRouter API (REQUIRED)
OPENROUTER_API_KEY=sk-or-v1-your-actual-key-here

# Optional: App metadata
OPENROUTER_APP_NAME=SailoGrowth
OPENROUTER_APP_URL=http://localhost:3001
```

## 🚀 API Endpoints

### 1. Test Connection
**POST** `/api/workflow/test-connection`

Tests connectivity to a data source.

```json
{
  "connectionConfig": {
    "type": "supabase",
    "endpoint": "https://xyz.supabase.co",
    "apiKey": "your-api-key",
    "database": "postgres"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Successfully connected to Supabase",
  "connectionTime": 234
}
```

---

### 2. Interpret Schema
**POST** `/api/workflow/interpret-schema`

Fetches schema from data source and uses LLM to interpret it.

```json
{
  "connectionConfig": {
    "type": "supabase",
    "endpoint": "https://xyz.supabase.co",
    "apiKey": "your-api-key"
  },
  "model": "anthropic/claude-3-sonnet",
  "temperature": 0.7
}
```

**Response:**
```json
{
  "success": true,
  "schema": {
    "tables": [...],
    "relationships": [...],
    "entities": [...]
  },
  "interpretation": "The database contains user events, sessions...",
  "model": "anthropic/claude-3-sonnet"
}
```

---

### 3. Generate Monitoring Query
**POST** `/api/workflow/generate-query`

Generates SQL query for monitoring using LLM.

```json
{
  "entityDescription": "User events table with signup and login events",
  "condition": "New user signups exceed 100 per day",
  "model": "anthropic/claude-3-sonnet"
}
```

**Response:**
```json
{
  "success": true,
  "query": "SELECT COUNT(*) FROM events WHERE event_type = 'signup' AND created_at >= NOW() - INTERVAL '1 day'",
  "explanation": "Counts signup events in the last 24 hours",
  "model": "anthropic/claude-3-sonnet"
}
```

---

### 4. Test Action
**POST** `/api/workflow/test-action`

Tests notification/action delivery.

```json
{
  "actionConfig": {
    "type": "slack",
    "slackWebhook": "https://hooks.slack.com/services/...",
    "message": "🚨 Alert: {{condition}} detected at {{timestamp}}"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Slack notification sent successfully",
  "timestamp": "2025-10-27T23:00:00.000Z"
}
```

---

### 5. Execute Workflow
**POST** `/api/workflow/execute`

Executes a complete workflow from start to finish.

```json
{
  "workflowId": "workflow-123",
  "nodes": [
    {
      "id": "data-connector-1",
      "type": "data-connector",
      "data": {
        "label": "Data Connector",
        "config": {
          "connectionType": "supabase",
          "endpoint": "https://xyz.supabase.co",
          "apiKey": "key",
          "database": "postgres"
        }
      }
    },
    {
      "id": "schema-interpreter-1",
      "type": "schema-interpreter",
      "data": {
        "label": "Schema Interpreter",
        "config": {
          "model": "anthropic/claude-3-sonnet",
          "temperature": 0.7
        }
      }
    }
  ],
  "edges": [
    {
      "id": "e1-2",
      "source": "data-connector-1",
      "target": "schema-interpreter-1"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "execution": {
    "id": "exec-1698789123456",
    "status": "completed",
    "startedAt": "2025-10-27T23:00:00.000Z",
    "completedAt": "2025-10-27T23:00:15.000Z",
    "logs": [
      {
        "nodeId": "workflow",
        "timestamp": "2025-10-27T23:00:00.000Z",
        "level": "info",
        "message": "Workflow execution started"
      },
      {
        "nodeId": "data-connector-1",
        "timestamp": "2025-10-27T23:00:02.000Z",
        "level": "info",
        "message": "Connected to supabase, found 5 tables"
      }
    ]
  }
}
```

## 🧩 Service Layer

### OpenRouter Service
Handles all LLM interactions using OpenRouter API.

**Features:**
- Schema interpretation
- Query generation
- Alert message templating

**Models Supported:**
- `anthropic/claude-3-opus`
- `anthropic/claude-3-sonnet`
- `openai/gpt-4`
- `openai/gpt-3.5-turbo`

### Data Connector Service
Manages connections to various data sources.

**Supported:**
- ✅ Supabase (REST API)
- ✅ PostHog (REST API)
- 🚧 PostgreSQL (requires pg library)
- 🚧 MySQL (requires mysql2 library)
- 🚧 BigQuery (requires @google-cloud/bigquery)

### Action Executor Service
Executes notifications and webhooks.

**Supported:**
- ✅ Slack (webhook)
- 🚧 Email (needs SendGrid/SES integration)
- ✅ Custom Webhooks
- 🚧 HubSpot
- 🚧 Custom API calls

### Workflow Executor Service
Orchestrates the entire workflow execution.

**Features:**
- Topological sorting (correct execution order)
- Context passing between nodes
- Error handling and logging
- Execution state tracking

## 🔧 Usage Examples

### Frontend Integration

```typescript
// Test connection
const testConnection = async (config: any) => {
  const response = await fetch('/api/workflow/test-connection', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ connectionConfig: config })
  })
  const result = await response.json()
  return result
}

// Interpret schema
const interpretSchema = async (config: any) => {
  const response = await fetch('/api/workflow/interpret-schema', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      connectionConfig: config,
      model: 'anthropic/claude-3-sonnet',
      temperature: 0.7
    })
  })
  const result = await response.json()
  return result
}

// Execute workflow
const executeWorkflow = async (nodes: any[], edges: any[]) => {
  const response = await fetch('/api/workflow/execute', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workflowId: 'workflow-' + Date.now(),
      nodes,
      edges
    })
  })
  const result = await response.json()
  return result
}
```

## 🔒 Security

- API keys are stored server-side only
- No `NEXT_PUBLIC_` prefix for sensitive keys
- User-provided API keys are validated
- Rate limiting recommended for production
- Add authentication middleware for API routes

## 📊 Next Steps

1. **Add to NodeDetailsPanel:**
   - Wire up "Test Connection" button → API call
   - Wire up "Save Configuration" button → update node config
   - Show real-time feedback from API

2. **Add Cron Job Scheduling:**
   - Use Vercel Cron or similar
   - Schedule monitor executions
   - Store results in database

3. **Add Database:**
   - Store workflow configurations
   - Store execution history
   - Store monitor results

4. **Add Authentication:**
   - Protect API routes
   - Multi-tenant support
   - API key management

5. **Add Email Integration:**
   - SendGrid or AWS SES
   - Email templates
   - Delivery tracking

## ✅ What Works Now

- ✅ OpenRouter LLM integration
- ✅ Supabase connection testing
- ✅ PostHog connection testing
- ✅ Schema interpretation with Claude
- ✅ Monitoring query generation
- ✅ Slack notifications
- ✅ Webhook triggers
- ✅ Complete workflow execution
- ✅ Execution logging

## 🚀 Ready to Use!

The backend is fully functional. You can now:
1. Connect to Supabase or PostHog
2. Interpret schemas with AI
3. Generate monitoring queries
4. Send Slack/webhook alerts
5. Execute complete workflows

Start testing with the API endpoints!
