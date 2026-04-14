import DashboardTab from './DashboardTab'
import UsersTab from './UsersTab'
import AgentsTab from './AgentsTab'
import LogsTab from './LogsTab'

function Admin({ onLogout, activeTab = 'dashboard', testAgentId, onTestAgent }: {
  onLogout: () => void
  activeTab?: 'dashboard' | 'users' | 'agents' | 'logs'
  testAgentId?: number | null
  onTestAgent?: (agentId: number) => void
}) {
  const tab = activeTab === 'dashboard' ? 'overview' : activeTab

  const title = tab === 'overview' ? 'Admin Dashboard' : tab === 'users' ? 'Users' : tab === 'agents' ? 'Agents' : 'Activity Logs'

  return (
    <div>
      <div className="flex justify-between items-center mb-6 max-md:flex-col max-md:items-start max-md:gap-3">
        <h2 className="m-0 text-2xl max-md:text-xl font-bold text-gray-900 tracking-tight">{title}</h2>
      </div>

      {tab === 'overview' && <DashboardTab onLogout={onLogout} testAgentId={testAgentId} />}
      {tab === 'users' && <UsersTab onLogout={onLogout} />}
      {tab === 'agents' && <AgentsTab onLogout={onLogout} onTestAgent={onTestAgent} />}
      {tab === 'logs' && <LogsTab onLogout={onLogout} />}
    </div>
  )
}

export default Admin
