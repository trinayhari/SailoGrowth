// Mock data for demonstration purposes
export const mockSchemas = [
  {
    table_name: 'users',
    columns: [
      { column_name: 'id', data_type: 'uuid', is_nullable: false },
      { column_name: 'email', data_type: 'varchar', is_nullable: false },
      { column_name: 'created_at', data_type: 'timestamp', is_nullable: false },
      { column_name: 'last_active_at', data_type: 'timestamp', is_nullable: true },
      { column_name: 'plan_type', data_type: 'varchar', is_nullable: true },
      { column_name: 'region', data_type: 'varchar', is_nullable: true }
    ]
  },
  {
    table_name: 'events',
    columns: [
      { column_name: 'id', data_type: 'uuid', is_nullable: false },
      { column_name: 'user_id', data_type: 'uuid', is_nullable: false },
      { column_name: 'event_name', data_type: 'varchar', is_nullable: false },
      { column_name: 'properties', data_type: 'jsonb', is_nullable: true },
      { column_name: 'created_at', data_type: 'timestamp', is_nullable: false }
    ]
  },
  {
    table_name: 'subscriptions',
    columns: [
      { column_name: 'id', data_type: 'uuid', is_nullable: false },
      { column_name: 'user_id', data_type: 'uuid', is_nullable: false },
      { column_name: 'plan_id', data_type: 'varchar', is_nullable: false },
      { column_name: 'status', data_type: 'varchar', is_nullable: false },
      { column_name: 'created_at', data_type: 'timestamp', is_nullable: false },
      { column_name: 'updated_at', data_type: 'timestamp', is_nullable: false }
    ]
  }
]

export const mockQueryResults = {
  'daily active users': {
    sql: `SELECT 
  DATE(created_at) as date,
  COUNT(DISTINCT user_id) as daily_active_users
FROM events 
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date;`,
    data: [
      { date: '2024-10-01', daily_active_users: 1250 },
      { date: '2024-10-02', daily_active_users: 1180 },
      { date: '2024-10-03', daily_active_users: 1320 },
      { date: '2024-10-04', daily_active_users: 1290 },
      { date: '2024-10-05', daily_active_users: 1150 },
      { date: '2024-10-06', daily_active_users: 980 },
      { date: '2024-10-07', daily_active_users: 1050 },
      { date: '2024-10-08', daily_active_users: 1380 },
      { date: '2024-10-09', daily_active_users: 1420 },
      { date: '2024-10-10', daily_active_users: 1350 }
    ],
    explanation: 'This query shows daily active users over the last 30 days. We can see some fluctuation with weekends typically showing lower activity.',
    chartType: 'line' as const,
    chartConfig: { xAxis: 'date', yAxis: 'daily_active_users', dataKey: 'daily_active_users' }
  },
  'activation rate': {
    sql: `SELECT 
  region,
  COUNT(CASE WHEN events.event_name = 'activation_complete' THEN 1 END) * 100.0 / COUNT(DISTINCT users.id) as activation_rate
FROM users 
LEFT JOIN events ON users.id = events.user_id
WHERE users.created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY region
ORDER BY activation_rate DESC;`,
    data: [
      { region: 'North America', activation_rate: 68.5 },
      { region: 'Europe', activation_rate: 62.3 },
      { region: 'Asia Pacific', activation_rate: 58.7 },
      { region: 'Latin America', activation_rate: 55.2 },
      { region: 'Other', activation_rate: 51.8 }
    ],
    explanation: 'Activation rates by region show North America leading at 68.5%, with opportunities for improvement in other regions.',
    chartType: 'bar' as const,
    chartConfig: { xAxis: 'region', yAxis: 'activation_rate', dataKey: 'activation_rate' }
  },
  'top features': {
    sql: `SELECT 
  properties->>'feature_name' as feature_name,
  COUNT(*) as usage_count
FROM events 
WHERE event_name = 'feature_used' 
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY properties->>'feature_name'
ORDER BY usage_count DESC
LIMIT 10;`,
    data: [
      { feature_name: 'Dashboard', usage_count: 15420 },
      { feature_name: 'Reports', usage_count: 12350 },
      { feature_name: 'Analytics', usage_count: 9870 },
      { feature_name: 'Settings', usage_count: 8920 },
      { feature_name: 'Export', usage_count: 7650 },
      { feature_name: 'Notifications', usage_count: 6540 },
      { feature_name: 'Search', usage_count: 5890 },
      { feature_name: 'Filters', usage_count: 4320 },
      { feature_name: 'Integrations', usage_count: 3210 },
      { feature_name: 'API Access', usage_count: 2180 }
    ],
    explanation: 'Top 10 features by usage in the last 7 days. Dashboard and Reports are the most popular features.',
    chartType: 'bar' as const,
    chartConfig: { xAxis: 'feature_name', yAxis: 'usage_count', dataKey: 'usage_count' }
  }
}

export const mockFollowUps = [
  "What's the trend compared to last month?",
  "Can you break this down by user segment?",
  "Show me the same data for premium users only"
]
