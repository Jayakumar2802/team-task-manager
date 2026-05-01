import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { tasksAPI, projectsAPI, usersAPI } from '../services/api'
import { Plus, X, Filter, MessageSquare, Paperclip, GripVertical, CheckSquare } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import TaskDetailsModal from '../components/TaskDetailsModal'

export default function Tasks() {
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [inspectTask, setInspectTask] = useState(null)
  const [filters, setFilters] = useState({ project_id: '', status: '' })
  const [newTask, setNewTask] = useState({
    title: '', description: '', due_date: '', priority: 'medium', status: 'todo', project_id: '', assigned_to: '',
  })

  useEffect(() => {
    const ws = new WebSocket('ws://127.0.0.1:8000/ws')
    ws.onmessage = (event) => {
      fetchTasks()
    }
    return () => ws.close()
  }, [filters])

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [filters])

  const fetchData = async () => {
    try {
      const [projectsRes, usersRes] = await Promise.all([projectsAPI.getAll(), usersAPI.getAll()])
      setProjects(projectsRes.data)
      setUsers(usersRes.data)
    } catch (error) {
      console.error('Failed to load initial data')
    }
  }

  const fetchTasks = async () => {
    try {
      const params = {}
      if (filters.project_id) params.project_id = filters.project_id
      if (filters.status) params.status = filters.status
      const { data } = await tasksAPI.getAll(params)
      setTasks(data)
    } catch (error) {
      toast.error('Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    if (!newTask.title || !newTask.project_id) {
      toast.error('Title and project are required')
      return
    }
    try {
      const taskData = {
        ...newTask,
        assigned_to: newTask.assigned_to ? parseInt(newTask.assigned_to) : null,
        project_id: parseInt(newTask.project_id),
      }
      await tasksAPI.create(taskData)
      toast.success('Task created successfully!')
      setShowModal(false)
      setNewTask({ title: '', description: '', due_date: '', priority: 'medium', status: 'todo', project_id: '', assigned_to: '' })
      fetchTasks()
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to create task')
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return
    try {
      await tasksAPI.delete(taskId)
      toast.success('Task deleted!')
      fetchTasks()
    } catch (error) {
      toast.error('Failed to delete task')
    }
  }

  const getPriorityColor = (priority) => {
    const colors = { low: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300', medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300', high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' }
    return colors[priority] || colors.medium
  }

  const onDragEnd = async (result) => {
    if (!result.destination) return
    const { source, destination, draggableId } = result

    if (source.droppableId !== destination.droppableId) {
      const newStatus = destination.droppableId
      const taskId = parseInt(draggableId)

      const updatedTasks = tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      setTasks(updatedTasks)

      try {
        await tasksAPI.update(taskId, { status: newStatus })
      } catch (err) {
        toast.error("Failed to move task")
        fetchTasks()
      }
    }
  }

  const columns = {
    todo: tasks.filter(t => t.status === 'todo'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    done: tasks.filter(t => t.status === 'done')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Tasks Board</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Task
        </button>
      </div>

      <div className="flex gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-3 flex items-center gap-2 flex-1 transition-colors border dark:border-gray-700">
          <Filter className="w-5 h-5 text-gray-400" />
          <select
            value={filters.project_id}
            onChange={(e) => setFilters({ ...filters, project_id: e.target.value })}
            className="w-full bg-transparent border-none text-gray-700 dark:text-gray-200 focus:ring-0 text-sm"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">No tasks found. Create your first task!</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 min-h-[60vh]">
            {['todo', 'in_progress', 'done'].map((statusId) => (
              <div key={statusId} className="bg-gray-100 dark:bg-gray-800 p-4 rounded-xl shadow-sm flex flex-col transition-colors border dark:border-gray-700">
                <h2 className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-widest text-sm mb-4">
                  {statusId.replace('_', ' ')} ({columns[statusId].length})
                </h2>

                <Droppable droppableId={statusId}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 space-y-3 min-h-[150px]"
                    >
                      {columns[statusId].map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`bg-white dark:bg-gray-700/50 rounded-lg p-4 shadow border dark:border-gray-600 group transition-colors relative ${snapshot.isDragging ? 'shadow-2xl ring-2 ring-blue-500 scale-105 z-50' : 'hover:shadow-md'
                                }`}
                            >
                              <div className="flex items-start gap-2">
                                <div {...provided.dragHandleProps} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-grab mt-1">
                                  <GripVertical className="w-4 h-4" />
                                </div>
                                <div className="flex-1 cursor-pointer" onClick={() => setInspectTask(task)}>
                                  <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-gray-800 dark:text-white leading-tight pr-6">{task.title}</h3>
                                    <button onClick={() => handleDeleteTask(task.id)} className="absolute top-4 right-4 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                      <X className="w-4 h-4" />
                                    </button>
                                  </div>
                                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{task.description}</p>

                                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getPriorityColor(task.priority)}`}>
                                      {task.priority}
                                    </span>
                                    {task.due_date && (
                                      <span className="text-xs font-semibold text-gray-400">
                                        {new Date(task.due_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                      </span>
                                    )}
                                  </div>

                                  <div className="mt-4 pt-3 border-t dark:border-gray-600 flex justify-between items-center text-gray-400">
                                    <div className="flex gap-3">
                                      <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                      </div>
                                      <div className="flex items-center gap-1 hover:text-blue-500 cursor-pointer">
                                        <Paperclip className="w-3.5 h-3.5" />
                                      </div>
                                    </div>
                                    {task.assigned_to && (
                                      <div className="w-6 h-6 rounded-full bg-indigo-500 text-white text-[10px] flex items-center justify-center font-bold" title="Assigned User">
                                        {users.find(u => u.id === task.assigned_to)?.name?.charAt(0).toUpperCase() || 'U'}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl border dark:border-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Create New Task</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter task description"
                  rows="3"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Project *</label>
                <select
                  value={newTask.project_id}
                  onChange={(e) => setNewTask({ ...newTask, project_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assign To</label>
                <select
                  value={newTask.assigned_to}
                  onChange={(e) => setNewTask({ ...newTask, assigned_to: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={newTask.due_date}
                    onChange={(e) => setNewTask({ ...newTask, due_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="submit" className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 font-medium transition-colors">
                  Create Task
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {inspectTask && (
        <TaskDetailsModal task={inspectTask} onClose={() => setInspectTask(null)} />
      )}
    </div>
  )
}