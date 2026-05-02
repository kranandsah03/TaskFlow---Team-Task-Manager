import { useEffect, useState } from 'react';
import { getDashboardStats, getTasks } from '../api/api';
import { useAuth } from '../context/AuthContext';
import TaskCard from '../components/TaskCard';

const StatCard = ({ label, value, icon, color, bg }) => (
  <div className={`bg-gray-900 border border-gray-800 rounded-xl p-6 flex items-center gap-4 hover:border-gray-700 transition-all duration-200 hover:-translate-y-0.5`}>
    <div className={`w-12 h-12 ${bg} rounded-xl flex items-center justify-center text-xl shrink-0`}>
      {icon}
    </div>
    <div>
      <p className="text-gray-500 text-sm font-medium">{label}</p>
      <p className={`text-3xl font-bold ${color} mt-0.5`}>{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0 });
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchData = async () => {
    try {
      const [statsRes, tasksRes] = await Promise.all([getDashboardStats(), getTasks()]);
      setStats(statsRes.data);
      setTasks(tasksRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleTaskUpdate = (updatedTask) => {
    setTasks((prev) => prev.map((t) => (t._id === updatedTask._id ? updatedTask : t)));
    // Refresh stats
    getDashboardStats().then((res) => setStats(res.data)).catch(console.error);
  };

  const handleTaskDelete = (id) => {
    setTasks((prev) => prev.filter((t) => t._id !== id));
    getDashboardStats().then((res) => setStats(res.data)).catch(console.error);
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'all') return true;
    if (filter === 'overdue') return new Date(t.deadline) < new Date() && t.status !== 'Completed';
    return t.status === filter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">

        {/* Page header */}
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'},{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">
              {user?.name?.split(' ')[0]}
            </span>{' '}
            👋
          </h1>
          <p className="text-gray-500 mt-1">Here's what's happening with your tasks today.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8 sm:mb-10">
          <StatCard label="Total Tasks" value={stats.total} icon="📋" color="text-white" bg="bg-indigo-500/10" />
          <StatCard label="Completed" value={stats.completed} icon="✅" color="text-emerald-400" bg="bg-emerald-500/10" />
          <StatCard label="Pending" value={stats.pending} icon="⏳" color="text-amber-400" bg="bg-amber-500/10" />
          <StatCard label="Overdue" value={stats.overdue} icon="🚨" color="text-red-400" bg="bg-red-500/10" />
        </div>

        {/* Tasks Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-white">
            {user?.role === 'admin' ? 'All Tasks' : 'My Tasks'}
          </h2>

          {/* Filter tabs */}
          <div className="flex flex-wrap items-center gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 w-full sm:w-auto">
            {['all', 'Pending', 'In Progress', 'Completed', 'overdue'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 capitalize flex-1 sm:flex-none text-center ${
                  filter === f
                    ? 'bg-indigo-600 text-white shadow'
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="text-center py-24 bg-gray-900/50 border border-gray-800 border-dashed rounded-2xl">
            <div className="text-5xl mb-4">📭</div>
            <p className="text-gray-400 font-medium text-lg">No tasks found</p>
            <p className="text-gray-600 text-sm mt-1">
              {filter === 'all' ? 'No tasks have been assigned yet.' : `No tasks with status "${filter}".`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredTasks.map((task) => (
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

export default Dashboard;
