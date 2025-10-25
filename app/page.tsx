'use client'

import { useState } from 'react'
import DemoChatView from '../components/DemoChatView'
import DashboardView from '../components/DashboardView'
import ConnectionsView from '../components/ConnectionsView'
import Sidebar from '../components/Sidebar'

type View = 'chat' | 'dashboards' | 'connections'

export default function Home() {
  const [currentView, setCurrentView] = useState<View>('chat')

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100 flex transition-colors">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />

      <div className="flex-1">
        {currentView === 'chat' && <DemoChatView />}
        {currentView === 'dashboards' && <DashboardView />}
        {currentView === 'connections' && <ConnectionsView />}
      </div>
    </div>
  )
}
