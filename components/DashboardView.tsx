'use client'

import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Users, Activity, BarChart3, DollarSign, Calendar, Filter, Pin } from 'lucide-react';
import ChartRenderer from './ChartRenderer';
import { QueryResult } from '../lib/sql-agent';

interface DashboardCard {
  id: string;
  title: string;
  description: string;
  lastUpdated: string;
  metrics: Array<{
    label: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down';
  }>;
}

function DashboardView() {
  const dashboards: DashboardCard[] = [
    {
      id: '1',
      title: 'User Growth',
      description: 'Daily and weekly user acquisition metrics',
      lastUpdated: '5 min ago',
      metrics: [
        { label: 'DAU', value: '12,458', change: '+5.2%', trend: 'up' },
        { label: 'MAU', value: '89,234', change: '+12.1%', trend: 'up' },
        { label: 'New Signups', value: '1,234', change: '-2.3%', trend: 'down' },
      ],
    },
    {
      id: '2',
      title: 'Activation Metrics',
      description: 'User activation and onboarding funnel',
      lastUpdated: '12 min ago',
      metrics: [
        { label: 'Activation Rate', value: '68%', change: '+3.1%', trend: 'up' },
        { label: 'Time to Activate', value: '2.4 days', change: '-0.3 days', trend: 'up' },
      ],
    },
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-gray-800 px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-100">Dashboards</h1>
            <p className="text-sm text-gray-400 mt-0.5">
              Monitor your key metrics and workflows
            </p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" />
            Create Dashboard
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-7xl">
          {dashboards.map((dashboard) => (
            <div
              key={dashboard.id}
              className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-gray-700 transition-colors cursor-pointer shadow-lg"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-100 mb-1">
                    {dashboard.title}
                  </h3>
                  <p className="text-sm text-gray-400">{dashboard.description}</p>
                </div>
                <div className="p-2 bg-gray-800 rounded-lg">
                  <BarChart3 className="w-4 h-4 text-gray-400" />
                </div>
              </div>

              <div className="space-y-3 mb-4">
                {dashboard.metrics.map((metric, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-950 rounded-lg border border-gray-800"
                  >
                    <div>
                      <div className="text-xs text-gray-500 mb-1">{metric.label}</div>
                      <div className="text-xl font-semibold text-gray-100">
                        {metric.value}
                      </div>
                    </div>
                    {metric.change && (
                      <div
                        className={`flex items-center gap-1 text-sm font-medium ${
                          metric.trend === 'up' ? 'text-green-500' : 'text-red-500'
                        }`}
                      >
                        {metric.trend === 'up' ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <Activity className="w-4 h-4" />
                        )}
                        {metric.change}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-800">
                <span className="text-xs text-gray-500">
                  Updated {dashboard.lastUpdated}
                </span>
                <button className="text-xs text-blue-400 hover:text-blue-300 font-medium">
                  View Details →
                </button>
              </div>
            </div>
          ))}

          <button className="bg-gray-900 rounded-2xl p-6 border-2 border-dashed border-gray-800 hover:border-gray-700 transition-colors cursor-pointer flex flex-col items-center justify-center min-h-[300px] text-gray-500 hover:text-gray-400">
            <Plus className="w-8 h-8 mb-3" />
            <span className="text-sm font-medium">Create New Dashboard</span>
            <span className="text-xs mt-1">
              Or ask the AI to build one for you
            </span>
          </button>
        </div>

        <div className="mt-8 max-w-7xl">
          <h2 className="text-sm font-medium text-gray-400 mb-4">QUICK INSIGHTS</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <Users className="w-4 h-4 text-blue-500" />
                </div>
                <span className="text-xs text-gray-400">Total Users</span>
              </div>
              <div className="text-2xl font-semibold text-gray-100">124,567</div>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <Activity className="w-4 h-4 text-green-500" />
                </div>
                <span className="text-xs text-gray-400">Active Monitors</span>
              </div>
              <div className="text-2xl font-semibold text-gray-100">8</div>
            </div>

            <div className="bg-gray-900 rounded-xl p-4 border border-gray-800">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <TrendingUp className="w-4 h-4 text-purple-500" />
                </div>
                <span className="text-xs text-gray-400">Workflows Running</span>
              </div>
              <div className="text-2xl font-semibold text-gray-100">12</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardView;
