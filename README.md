# Sailo Growth - Analytics Agent

A natural language analytics agent that connects to product data sources and answers PM questions directly without engineer involvement.

## 🚀 Features

### Core Functionality
- **Natural Language Queries**: Ask questions in plain English about your data
- **SQL Generation**: Automatically converts questions to optimized SQL queries
- **Smart Visualizations**: Auto-generates appropriate charts (line, bar, pie, table)
- **Contextual Memory**: Remembers conversation context for follow-up questions
- **Follow-up Suggestions**: AI-powered suggestions for deeper analysis

### Data Sources
- ✅ **Supabase/PostgreSQL** - Primary database connection
- 🔄 **PostHog** - Product analytics (coming soon)
- 🔄 **BigQuery** - Data warehouse (coming soon)

### Visualizations
- **Line Charts** - Time series and trends
- **Bar Charts** - Category comparisons
- **Pie Charts** - Proportions and percentages
- **Tables** - Detailed data listings

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Charts**: Recharts
- **AI/LLM**: OpenAI GPT-4, LangChain
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel-ready

## 📋 Setup

### 1. Environment Variables

Copy `.env.example` to `.env.local` and fill in your credentials:

```bash
cp .env.example .env.local
```

Required variables:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 💬 Example Queries

Try asking these questions:

- "Show me daily active users for the last 30 days"
- "What is our activation rate by region?"
- "Show me the top 10 features by usage"
- "Alert me if conversion rate drops below 5%"
- "What's our most common drop-off point in onboarding?"
- "Show me user growth trends by month"

## 🏗️ How It Works

### 1. Schema Understanding
- Auto-ingests database schema and table structures
- Builds semantic layer with metric definitions
- Understands relationships between tables

### 2. Query Processing
- Parses natural language questions
- Generates optimized SQL queries
- Executes queries safely on your database

### 3. Smart Visualization
- Analyzes query results to suggest best chart type
- Renders interactive charts with Recharts
- Provides data tables for detailed analysis

### 4. Contextual Memory
- Remembers previous queries in conversation
- Enables follow-up questions like "same segment as before"
- Suggests relevant next questions

## 🔧 Architecture

```
app/
├── api/
│   ├── query/route.ts      # Query processing API
│   └── schema/route.ts     # Schema introspection API
├── layout.tsx              # Root layout
└── page.tsx               # Main application

components/
├── ChatView.tsx           # Main chat interface
├── ChartRenderer.tsx      # Chart visualization
├── QueryResult.tsx        # Query result display
├── DashboardView.tsx      # Pinned widgets dashboard
└── Sidebar.tsx           # Navigation sidebar

lib/
├── schema-service.ts      # Database schema introspection
└── sql-agent.ts          # LLM-powered SQL generation
```

## 🚀 Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Connect to Vercel
3. Add environment variables
4. Deploy

### Manual Deployment

```bash
npm run build
npm start
```

## 🔒 Security

- All SQL queries are generated and validated by AI
- Database access uses read-only credentials
- No direct SQL injection possible through chat interface
- Environment variables for sensitive credentials

## 📈 Roadmap

- [ ] **Slack Integration** - Query data directly in Slack
- [ ] **Notion Integration** - Embed dashboards in Notion
- [ ] **Alert System** - Set up automated metric monitoring
- [ ] **PostHog Connector** - Direct product analytics integration
- [ ] **BigQuery Connector** - Data warehouse support
- [ ] **Custom Metrics** - Define and save custom business metrics
- [ ] **Team Collaboration** - Share queries and dashboards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

Built with ❤️ for Product Managers who want data insights without the wait.
