import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { dashboardAPI } from '../services/api'
import { LayoutDashboard, CheckCircle, Clock, AlertCircle, Users, Briefcase, Calendar } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts'

const COLORS = ['#eab308', '#f97316', '#22c55e'] // To Do, In Progress, Done

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const { data } = await dashboardAPI.getStats()
      setStats(data)
    } catch (error) {
      toast.error('Failed to load dashboard stats')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  const statCards = [
    { title: 'Total Tasks', value: stats?.total_tasks || 0, icon: LayoutDashboard, color: 'bg-blue-500' },
    { title: 'To Do', value: stats?.todo_tasks || 0, icon: Clock, color: 'bg-yellow-500' },
    { title: 'In Progress', value: stats?.in_progress_tasks || 0, icon: AlertCircle, color: 'bg-orange-500' },
    { title: 'Done', value: stats?.done_tasks || 0, icon: CheckCircle, color: 'bg-green-500' },
  ]

  const pieData = [
    { name: 'To Do', value: stats?.todo_tasks || 0 },
    { name: 'In Progress', value: stats?.in_progress_tasks || 0 },
    { name: 'Done', value: stats?.done_tasks || 0 },
  ]

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Dashboard Overview</h1>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{card.title}</p>
                <p className="text-3xl font-bold mt-2 text-gray-800 dark:text-white">{card.value}</p>
              </div>
              <div className={`${card.color} p-3 rounded-full`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TASK STATUS PIE CHART */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border dark:border-gray-700 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Task Status</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TASKS BY PROJECT BAR CHART */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border dark:border-gray-700 lg:col-span-2 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Tasks by Project</h2>
          <div className="h-64">
            {stats?.tasks_by_project?.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.tasks_by_project}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">No project data available</div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* UPCOMING DEADLINES */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border dark:border-gray-700 transition-colors">
          <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> Upcoming Deadlines (Next 5 Days)
          </h2>
          {stats?.tasks_due_soon?.length > 0 ? (
            <div className="space-y-4">
              {stats.tasks_due_soon.map((task) => (
                <div key={task.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-md">
                  <span className="font-medium text-gray-800 dark:text-gray-200">{task.title}</span>
                  <span className="text-sm font-bold text-red-500">
                    {task.due_date ? String(task.due_date).split('T')[0] : '—'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 dark:text-gray-400">No immediate tasks pending</p>
          )}
        </div>

        {/* OVERDUE & USER SUMMARY */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border dark:border-gray-700 transition-colors flex items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div>
              <p className="text-4xl font-bold text-red-500">{stats?.overdue_tasks || 0}</p>
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-widest mt-1">Overdue Tasks</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 border dark:border-gray-700 transition-colors">
            <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-500" /> Top Assignees
            </h2>
            {stats?.tasks_by_user?.length > 0 ? (
              <div className="space-y-3">
                {stats.tasks_by_user.map((item, index) => (
                  <div key={index} className="flex items-center justify-between border-b dark:border-gray-700 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-700 dark:text-gray-300">{item.name}</span>
                    <span className="font-bold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-xs">
                      {item.count} tasks
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No user data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}