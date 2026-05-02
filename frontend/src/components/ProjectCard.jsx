import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { deleteProject } from '../api/api';
import { useState } from 'react';

const ProjectCard = ({ project, onDelete }) => {
  const { user } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async (e) => {
    e.preventDefault();
    if (!window.confirm(`Delete "${project.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    try {
      await deleteProject(project._id);
      onDelete && onDelete(project._id);
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  const avatarColors = [
    'from-indigo-400 to-purple-500',
    'from-emerald-400 to-teal-500',
    'from-amber-400 to-orange-500',
    'from-pink-400 to-rose-500',
    'from-blue-400 to-cyan-500',
  ];

  return (
    <Link
      to={`/projects/${project._id}`}
      className="group relative bg-gray-900 border border-gray-800 hover:border-indigo-500/40 rounded-xl p-6 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 flex flex-col gap-4 block"
    >
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-t-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
            {project.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h3 className="text-white font-semibold text-base leading-tight group-hover:text-indigo-300 transition-colors">
              {project.name}
            </h3>
            <p className="text-gray-600 text-xs mt-0.5">
              by {project.createdBy?.name || 'Unknown'}
            </p>
          </div>
        </div>

        {user?.role === 'admin' && (
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200 shrink-0 disabled:opacity-30"
            title="Delete project"
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

      {/* Description */}
      <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 flex-1">
        {project.description || 'No description provided.'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-800">
        {/* Members avatars */}
        <div className="flex items-center gap-1">
          <div className="flex -space-x-2">
            {project.members?.slice(0, 4).map((member, i) => (
              <div
                key={member._id}
                title={member.name}
                className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarColors[i % avatarColors.length]} border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-white`}
              >
                {member.name?.charAt(0).toUpperCase()}
              </div>
            ))}
            {project.members?.length > 4 && (
              <div className="w-7 h-7 rounded-full bg-gray-700 border-2 border-gray-900 flex items-center justify-center text-xs font-bold text-gray-400">
                +{project.members.length - 4}
              </div>
            )}
          </div>
          <span className="text-gray-600 text-xs ml-2">
            {project.members?.length || 0} member{project.members?.length !== 1 ? 's' : ''}
          </span>
        </div>

        <span className="text-indigo-400 text-xs font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
          View
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </Link>
  );
};

export default ProjectCard;
