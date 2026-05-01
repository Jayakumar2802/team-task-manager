import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Bell, Moon, Sun } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function Layout() {
  const { logout, user } = useAuth()
  const navigate = useNavigate()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const navItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/projects', icon: FolderKanban, label: 'Projects' },
    { path: '/tasks', icon: CheckSquare, label: 'Tasks' },
  ]

  return (
    <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col transition-colors z-20">
        <div className="p-6">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">Team Task Manager</h1>
        </div>
        <nav className="mt-4 flex-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-6 py-3 text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors ${isActive ? 'bg-blue-50 dark:bg-gray-700 border-r-4 border-blue-500' : ''
                }`
              }
              end={item.path === '/'}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-6 py-3 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full transition-colors rounded-lg"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white dark:bg-gray-800 shadow-sm flex items-center justify-end px-8 z-10 transition-colors">
          <div className="flex items-center gap-6">
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white dark:border-gray-800" />
                )}
              </button>
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 shadow-xl rounded-lg border dark:border-gray-700 p-4 z-50">
                  <h3 className="font-semibold text-gray-800 dark:text-white mb-2">Notifications</h3>
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No new notifications</div>
                </div>
              )}
            </div>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold hover:bg-blue-600 transition-colors focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700"
              >
                U
              </button>
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-xl rounded-lg border dark:border-gray-700 py-2 z-50">
                  <div className="px-4 py-3 border-b dark:border-gray-700">
                    <p className="text-sm font-bold text-gray-800 dark:text-white truncate">{user?.name || "Admin User"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email || "Account Profile"}</p>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-8 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  )
}