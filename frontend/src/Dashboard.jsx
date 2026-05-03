import React, { useState, useEffect } from 'react'
import { createProject, listProjects, addMember, getMembers, createTask, getTasks, getProjectTasks, updateTask, deleteTask, getDashboardStats } from './api'
import { Plus, X, CheckCircle, Clock, AlertCircle } from 'lucide-react'

export default function Dashboard({ user }) {
  const [tab, setTab] = useState('dashboard')
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [dashboardStats, setDashboardStats] = useState(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [selectedProject, setSelectedProject] = useState(null)
  const [showProjectModal, setShowProjectModal] = useState(false)
  const [showTaskModal, setShowTaskModal] = useState(false)
  const [showMembersModal, setShowMembersModal] = useState(false)
  const [members, setMembers] = useState([])
  const [projectMembers, setProjectMembers] = useState([])

  useEffect(() => {
    if (tab === 'dashboard') loadDashboard()
    if (tab === 'projects') loadProjects()
    if (tab === 'tasks') loadTasks()
  }, [tab])

  const loadDashboard = async () => {
    try {
      const stats = await getDashboardStats()
      setDashboardStats(stats)
    } catch (err) {
      setError(err.message)
    }
  }

  const loadProjects = async () => {
    try {
      setLoading(true)
      const data = await listProjects()
      setProjects(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadTasks = async () => {
    try {
      setLoading(true)
      const data = await getTasks()
      setTasks(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.target)

    try {
      await createProject(formData.get('name'), formData.get('description'))
      setSuccess('Project created!')
      setShowProjectModal(false)
      e.target.reset()
      loadProjects()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.target)
    const dueDateValue = formData.get('dueDate')
      ? new Date(`${formData.get('dueDate')}T00:00:00Z`).toISOString()
      : null

    try {
      await createTask(
        selectedProject.id,
        formData.get('title'),
        formData.get('description'),
        formData.get('assignee') || null,
        dueDateValue
      )
      setSuccess('Task created!')
      setShowTaskModal(false)
      e.target.reset()
      loadTasks()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleAddMember = async (e) => {
    e.preventDefault()
    setError('')
    const formData = new FormData(e.target)

    try {
      await addMember(
        selectedProject.id,
        formData.get('userId'),
        formData.get('role')
      )
      setSuccess('Member added!')
      e.target.reset()
      loadMembers(selectedProject.id)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  const loadMembers = async (projectId) => {
    try {
      const data = await getMembers(projectId)
      setProjectMembers(data)
    } catch (err) {
      setError(err.message)
    }
  }

  const showProjectMembers = async (project) => {
    setSelectedProject(project)
    await loadMembers(project.id)
    setShowMembersModal(true)
  }

  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, newStatus, null, null)
      loadTasks()
      setSuccess('Task updated!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.message)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (confirm('Delete this task?')) {
      try {
        await deleteTask(taskId)
        loadTasks()
        setSuccess('Task deleted!')
        setTimeout(() => setSuccess(''), 3000)
      } catch (err) {
        setError(err.message)
      }
    }
  }

  return (
    <div className="container">
      {error && <div className="error">{error}</div>}
      {success && <div className="success">{success}</div>}

      <div className="tabs">
        <button className={`tab ${tab === 'dashboard' ? 'active' : ''}`} onClick={() => setTab('dashboard')}>
          Dashboard
        </button>
        <button className={`tab ${tab === 'projects' ? 'active' : ''}`} onClick={() => setTab('projects')}>
          Projects
        </button>
        <button className={`tab ${tab === 'tasks' ? 'active' : ''}`} onClick={() => setTab('tasks')}>
          Tasks
        </button>
      </div>

      {tab === 'dashboard' && (
        <div>
          <h2>Dashboard</h2>
          {dashboardStats ? (
            <div className="dashboard-grid">
              <div className="stat-card">
                <h3>Total Tasks</h3>
                <div className="value">{dashboardStats.totalTasks}</div>
              </div>
              <div className="stat-card">
                <h3>Assigned to You</h3>
                <div className="value">{dashboardStats.assignedTasks}</div>
              </div>
              <div className="stat-card">
                <h3>Open Tasks</h3>
                <div className="value">{dashboardStats.openTasks}</div>
              </div>
              <div className="stat-card">
                <h3>Overdue</h3>
                <div className="value" style={{ color: '#ff6b6b' }}>{dashboardStats.overdueTasks}</div>
              </div>
              <div className="stat-card">
                <h3>Completed</h3>
                <div className="value" style={{ color: '#51cf66' }}>{dashboardStats.completedTasks}</div>
              </div>
            </div>
          ) : (
            <div className="loading">
              <div className="spinner"></div>
            </div>
          )}
        </div>
      )}

      {tab === 'projects' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>Projects</h2>
            <button className="btn-primary" onClick={() => setShowProjectModal(true)}>
              <Plus size={18} style={{ marginRight: '8px' }} />
              New Project
            </button>
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <div className="project-list">
              {projects.map(project => (
                <div key={project.id} className="project-item">
                  <h3>{project.name}</h3>
                  <p>{project.description}</p>
                  <p>Members: {project.memberCount} | Tasks: {project.taskCount}</p>
                  <button style={{ marginTop: '10px' }} onClick={() => showProjectMembers(project)}>
                    View Members
                  </button>
                </div>
              ))}
              {projects.length === 0 && <p>No projects yet. Create one!</p>}
            </div>
          )}

          {showProjectModal && (
            <div className="modal open">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>New Project</h2>
                  <button className="close-btn" onClick={() => setShowProjectModal(false)}>×</button>
                </div>
                <form onSubmit={handleCreateProject}>
                  <div className="form-group">
                    <label>Project Name</label>
                    <input type="text" name="name" required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="4"></textarea>
                  </div>
                  <div className="btn-group">
                    <button type="submit" className="btn-primary">Create</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowProjectModal(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {showMembersModal && (
            <div className="modal open">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>Project Members: {selectedProject?.name}</h2>
                  <button className="close-btn" onClick={() => setShowMembersModal(false)}>×</button>
                </div>

                <h3>Members</h3>
                <ul className="members-list">
                  {projectMembers.map(member => (
                    <li key={member.id} className="member-item">
                      <div>
                        <div className="member-name">{member.name}</div>
                        <div style={{ fontSize: '12px', color: '#666' }}>{member.email}</div>
                      </div>
                      <div className="member-role">{member.role}</div>
                    </li>
                  ))}
                </ul>

                {user.id === selectedProject?.ownerId && (
                  <>
                    <h3 style={{ marginTop: '20px' }}>Add Member</h3>
                    <form onSubmit={handleAddMember}>
                      <div className="form-group">
                        <label>User ID</label>
                        <input type="number" name="userId" required />
                      </div>
                      <div className="form-group">
                        <label>Role</label>
                        <select name="role" defaultValue="MEMBER">
                          <option>MEMBER</option>
                          <option>ADMIN</option>
                        </select>
                      </div>
                      <button type="submit" className="btn-primary">Add Member</button>
                    </form>
                  </>
                )}

                <button className="btn-secondary" onClick={() => setShowMembersModal(false)} style={{ marginTop: '20px' }}>Close</button>
              </div>
            </div>
          )}
        </div>
      )}

      {tab === 'tasks' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2>My Tasks</h2>
            {selectedProject && (
              <button className="btn-primary" onClick={() => setShowTaskModal(true)}>
                <Plus size={18} style={{ marginRight: '8px' }} />
                New Task
              </button>
            )}
          </div>

          {loading ? (
            <div className="loading"><div className="spinner"></div></div>
          ) : (
            <div className="task-list">
              {tasks.map(task => (
                <div key={task.id} className="task-item">
                  <h3>{task.title}</h3>
                  <p>{task.description}</p>
                  <p>Assigned to: {task.assigneeName || 'Unassigned'}</p>
                  {task.dueDate && <p>Due: {new Date(task.dueDate).toLocaleDateString()}</p>}
                  
                  <div className={`task-status status-${task.status.toLowerCase().replace('_', '-')}`}>
                    {task.status}
                  </div>

                  <div className="btn-group" style={{ marginTop: '10px' }}>
                    <select onChange={(e) => handleUpdateTaskStatus(task.id, e.target.value)} value={task.status}>
                      <option>TODO</option>
                      <option>IN_PROGRESS</option>
                      <option>DONE</option>
                    </select>
                    <button className="btn-secondary" onClick={() => handleDeleteTask(task.id)}>Delete</button>
                  </div>
                </div>
              ))}
              {tasks.length === 0 && <p>No tasks assigned to you.</p>}
            </div>
          )}

          {showTaskModal && selectedProject && (
            <div className="modal open">
              <div className="modal-content">
                <div className="modal-header">
                  <h2>New Task in {selectedProject.name}</h2>
                  <button className="close-btn" onClick={() => setShowTaskModal(false)}>×</button>
                </div>
                <form onSubmit={handleCreateTask}>
                  <div className="form-group">
                    <label>Title</label>
                    <input type="text" name="title" required />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea name="description" rows="4"></textarea>
                  </div>
                  <div className="form-group">
                    <label>Assign to (User ID)</label>
                    <input type="number" name="assignee" />
                  </div>
                  <div className="form-group">
                    <label>Due Date</label>
                    <input type="date" name="dueDate" />
                  </div>
                  <div className="btn-group">
                    <button type="submit" className="btn-primary">Create Task</button>
                    <button type="button" className="btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
