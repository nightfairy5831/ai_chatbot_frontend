import DashboardTab from './DashboardTab'
import UsersTab from './UsersTab'
import AgentsTab from './AgentsTab'
import LogsTab from './LogsTab'
import IntegrationsTab from './IntegrationsTab'

export type AdminTab = 'dashboard' | 'users' | 'agents' | 'logs' | 'integrations'

const TITLES: Record<string, string> = {
  overview: 'Admin Dashboard',
  users: 'Users',
  agents: 'Agents',
  logs: 'Activity Logs',
  integrations: 'Integrations',
}

function Admin({ onLogout, activeTab = 'dashboard', testAgentId, onTestAgent }: {
  onLogout: () => void
  activeTab?: AdminTab
  testAgentId?: number | null
  onTestAgent?: (agentId: number) => void
}) {
  const tab = activeTab === 'dashboard' ? 'overview' : activeTab

  return (
    <div>
      <div className="flex justify-between items-center mb-6 max-md:flex-col max-md:items-start max-md:gap-3">
        <h2 className="m-0 text-xl font-bold text-gray-900">{TITLES[tab]}</h2>
      </div>

      {tab === 'overview' && <DashboardTab onLogout={onLogout} testAgentId={testAgentId} />}
      {tab === 'users' && <UsersTab onLogout={onLogout} />}
      {tab === 'agents' && <AgentsTab onLogout={onLogout} onTestAgent={onTestAgent} />}
      {tab === 'logs' && <LogsTab onLogout={onLogout} />}
      {tab === 'integrations' && <IntegrationsTab onLogout={onLogout} />}
    </div>
  )
}

export default Admin
