import { useState } from 'react';
import { updateTask, deleteTask } from '../api/api';
import { useAuth } from '../context/AuthContext';

const statusConfig = {
  'Pending': {
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-400/20',
    dot: 'bg-amber-400',
    icon: '⏳',
  },
  'In Progress': {
    color: 'text-blue-400',
    bg: 'bg-blue-400/10 border-blue-400/20',
    dot: 'bg-blue-400',
    icon: '🔄',
  },
  'Completed': {
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-400/20',
    dot: 'bg-emerald-400',
    icon: '✅',
  },
};

const priorityConfig = {
  'Low': { color: 'text-gray-400', bg: 'bg-gray-800' },
  'Medium': { color: 'text-blue-400', bg: 'bg-blue-500/10' },
  'High': { color: 'text-orange-400', bg: 'bg-orange-500/10' },
  'Urgent': { color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20 border' },
};

const TaskCard = ({ task, onUpdate, onDelete }) => {
  const { user } = useAuth();
  const [updating, setUpdating] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOverdue =
    task.deadline &&
    new Date(task.deadline) < new Date() &&
    task.status !== 'Completed';

  const cfg = statusConfig[task.status] || statusConfig['Pending'];
  const pCfg = priorityConfig[task.priority] || priorityConfig['Medium'];

  const handleStatusChange = async (e) => {
    setUpdating(true);
    try {
      const res = await updateTask(task._id, { status: e.target.value });
      onUpdate && onUpdate(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this task?')) return;
    setDeleting(true);
    try {
      await deleteTask(task._id);
      onDelete && onDelete(task._id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className={`group relative bg-gray-900 border rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:shadow-indigo-500/5 hover:-translate-y-0.5 flex flex-col ${
      isOverdue ? 'border-red-500/30 hover:border-red-500/50' : 'border-gray-800 hover:border-gray-700'
    }`}>
      {/* Overdue badge */}
      {isOverdue && (
        <span className="absolute -top-2 right-3 text-xs bg-red-500 text-white px-2 py-0.5 rounded-full font-semibold">
          Overdue
        </span>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-white font-semibold text-base leading-snug line-clamp-2">{task.title}</h3>
        <span className={`shrink-0 text-xs px-2.5 py-1 rounded-full border font-medium ${cfg.bg} ${cfg.color}`}>
          {cfg.icon} {task.status}
        </span>
      </div>

      <div className="mb-3">
        <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-md ${pCfg.bg} ${pCfg.color}`}>
          {task.priority || 'Medium'} Priority
        </span>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-500 text-sm mb-4 line-clamp-2 flex-1">{task.description}</p>
      )}

      {/* Meta info */}
      <div className="space-y-1.5 mb-4">
        {task.assignedTo && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-5 h-5 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0">
              {task.assignedTo.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-gray-400">{task.assignedTo.name}</span>
          </div>
        )}
        {task.deadline && (
          <div className={`flex items-center gap-1.5 text-sm ${isOverdue ? 'text-red-400' : 'text-gray-500'}`}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {new Date(task.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        )}
        {task.projectId?.name && (
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {task.projectId.name}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-2 pt-3 border-t border-gray-800">
        <select
          value={task.status}
          onChange={handleStatusChange}
          disabled={updating}
          className="bg-gray-800 text-gray-300 text-xs rounded-lg px-2 py-1.5 border border-gray-700 focus:outline-none focus:border-indigo-500 cursor-pointer disabled:opacity-50 transition-colors"
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {user?.role === 'admin' && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all duration-200 p-1.5 hover:bg-red-400/10 rounded-lg disabled:opacity-30"
            title="Delete task"
          >
            {deleting ? (
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  );
};

export default TaskCard;
