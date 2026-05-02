import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProjectById,
  getTasks,
  createTask,
  addMemberToProject,
  getUsers,
} from '../api/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const ProjectPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Task form
  const [showTaskForm, setShowTaskForm] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', priority: 'Medium', deadline: '', assignedTo: '' });
  const [taskLoading, setTaskLoading] = useState(false);
  const [taskError, setTaskError] = useState('');

  // Member form
  const [showMemberForm, setShowMemberForm] = useState(false);
  const [selectedUser, setSelectedUser] = useState('');
  const [memberLoading, setMemberLoading] = useState(false);
  const [memberError, setMemberError] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [projRes, tasksRes] = await Promise.all([
          getProjectById(id),
          getTasks(id),
        ]);
        setProject(projRes.data);
        setTasks(tasksRes.data);
        if (user?.role === 'admin') {
          const usersRes = await getUsers();
          setUsers(usersRes.data);
        }
      } catch (err) {
        setError('Failed to load project. It may not exist or you lack access.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [id, user]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!taskForm.title) { setTaskError('Task title is required'); return; }
    setTaskLoading(true);
    setTaskError('');
    try {
      const res = await createTask({ ...taskForm, projectId: id });
      setTasks((prev) => [res.data, ...prev]);
      setTaskForm({ title: '', description: '', deadline: '', assignedTo: '' });
      setShowTaskForm(false);
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Failed to create task');
    } finally {
      setTaskLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedUser) { setMemberError('Please select a user'); return; }
    setMemberLoading(true);
    setMemberError('');
    try {
      const res = await addMemberToProject(id, { userId: selectedUser });
      setProject(res.data);
      setSelectedUser('');
      setShowMemberForm(false);
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Failed to add member');
    } finally {
      setMemberLoading(false);
    }
  };

  const handleTaskUpdate = (updatedTask) => {
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
  };

  const handleTaskDelete = (taskId) => {
    setTasks((prev) => prev.filter((t) => t._id !== taskId));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <p className="text-gray-300 text-lg font-medium">{error}</p>
          <button onClick={() => navigate('/projects')} className="mt-4 text-indigo-400 hover:text-indigo-300 text-sm">
            ← Back to Projects
          </button>
        </div>
      </div>
    );
  }

  const nonMembers = users.filter(
    (u) => !project.members.some((m) => m._id === u._id)
  );

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Breadcrumb */}
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1 text-gray-500 hover:text-gray-300 text-sm mb-6 transition-colors group"
        >
          <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          All Projects
        </button>

        {/* Project Header */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-lg">
                {project.name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">{project.name}</h1>
                <p className="text-gray-500 text-sm mt-0.5">Created by {project.createdBy?.name}</p>
              </div>
            </div>
            {user?.role === 'admin' && (
              <div className="flex gap-2">
                <button
                  onClick={() => { setShowMemberForm(!showMemberForm); setShowTaskForm(false); }}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-gray-300 text-sm rounded-lg transition-all"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Add Member
                </button>
                <button
                  onClick={() => { setShowTaskForm(!showTaskForm); setShowMemberForm(false); }}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-all shadow-lg shadow-indigo-500/20"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Task
                </button>
              </div>
            )}
          </div>

          {project.description && (
            <p className="text-gray-400 mt-4 text-sm leading-relaxed">{project.description}</p>
          )}

          {/* Members */}
          <div className="mt-4 pt-4 border-t border-gray-800 flex items-center gap-2">
            <span className="text-gray-600 text-xs">Members:</span>
            <div className="flex items-center gap-1 flex-wrap">
              {project.members?.map((member, i) => {
                const colors = ['from-indigo-400 to-purple-500', 'from-emerald-400 to-teal-500', 'from-amber-400 to-orange-500', 'from-pink-400 to-rose-500', 'from-blue-400 to-cyan-500'];
                return (
                  <div
                    key={member._id}
                    title={`${member.name} (${member.role})`}
                    className={`w-7 h-7 rounded-full bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-xs font-bold text-white border-2 border-gray-900`}
                  >
                    {member.name?.charAt(0).toUpperCase()}
                  </div>
                );
              })}
              {project.members?.length === 0 && <span className="text-gray-600 text-xs">No members yet</span>}
            </div>
          </div>
        </div>

        {/* Add Member Form */}
        {showMemberForm && user?.role === 'admin' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6 animate-in">
            <h3 className="text-white font-semibold mb-4">Add Member to Project</h3>
            {memberError && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mb-3">{memberError}</p>
            )}
            <form onSubmit={handleAddMember} className="flex gap-3">
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="flex-1 bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-500"
              >
                <option value="">Select a user...</option>
                {nonMembers.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.email}) — {u.role}</option>
                ))}
              </select>
              <button
                type="submit"
                disabled={memberLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-all disabled:opacity-50 font-medium"
              >
                {memberLoading ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowMemberForm(false)}
                className="px-4 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-lg transition-all"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Create Task Form */}
        {showTaskForm && user?.role === 'admin' && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 mb-6">
            <h3 className="text-white font-semibold mb-4">Create New Task</h3>
            {taskError && (
              <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg mb-3">{taskError}</p>
            )}
            <form onSubmit={handleCreateTask} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Title *</label>
                  <input
                    type="text"
                    value={taskForm.title}
                    onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                    placeholder="Task title"
                    className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Deadline</label>
                  <input
                    type="date"
                    value={taskForm.deadline}
                    onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Description</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="Task description (optional)"
                  rows={2}
                  className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-600 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all resize-none"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Priority</label>
                  <select
                    value={taskForm.priority}
                    onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-1.5">Assign To</label>
                  <select
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-500 transition-all"
                  >
                    <option value="">Unassigned</option>
                    {project.members?.map((m) => (
                      <option key={m._id} value={m._id}>{m.name} ({m.email})</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={taskLoading}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm rounded-lg transition-all disabled:opacity-50 font-medium shadow-lg shadow-indigo-500/20"
                >
                  {taskLoading ? 'Creating...' : 'Create Task'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowTaskForm(false)}
                  className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-400 text-sm rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-semibold text-white">
            Tasks
            <span className="ml-2 text-sm font-normal text-gray-500">({tasks.length})</span>
          </h2>
        </div>

        {tasks.length === 0 ? (
          <div className="text-center py-24 bg-gray-900/50 border border-gray-800 border-dashed rounded-2xl">
            <div className="text-5xl mb-4">📋</div>
            <p className="text-gray-400 font-medium text-lg">No tasks yet</p>
            {user?.role === 'admin' && (
              <p className="text-gray-600 text-sm mt-1">Click "New Task" to create the first task for this project.</p>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onUpdate={handleTaskUpdate}
                onDelete={handleTaskDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
