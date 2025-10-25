import { MessageSquare, LayoutDashboard, Database, Settings, Link } from 'lucide-react'
import SimpleThemeToggle from './SimpleThemeToggle'

interface SidebarProps {
  currentView: 'chat' | 'dashboards' | 'connections'
  onViewChange: (view: 'chat' | 'dashboards' | 'connections') => void
}

function Sidebar({ currentView, onViewChange }: SidebarProps) {
  return (
    <div className="w-64 bg-gray-50 dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transition-colors">
      <div className="p-4 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-500" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Analytics Agent</h1>
              <p className="text-xs text-gray-600 dark:text-gray-400">Natural language data insights</p>
            </div>
          </div>
          <div className="flex-shrink-0 ml-2">
            <SimpleThemeToggle />
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <button
          onClick={() => onViewChange('chat')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
            currentView === 'chat'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          Chat
        </button>

        <button
          onClick={() => onViewChange('dashboards')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
            currentView === 'dashboards'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Dashboards
        </button>

        <button
          onClick={() => onViewChange('connections')}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors mb-1 ${
            currentView === 'connections'
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
          }`}
        >
          <Link className="w-4 h-4" />
          Connections
        </button>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-500 px-3 mb-2">ACTIVE MONITORS</div>
          <div className="space-y-1">
            <div className="px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                Daily Active Users
              </div>
            </div>
            <div className="px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></div>
                Conversion Rate
              </div>
            </div>
            <div className="px-3 py-2 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 cursor-pointer transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                Churn Alert
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-3 border-t border-gray-200 dark:border-gray-800">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200 transition-colors">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
