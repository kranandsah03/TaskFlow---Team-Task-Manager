const Task = require('../models/Task');
const Project = require('../models/Project');

// @desc   Create a task
// @route  POST /api/tasks
// @access Private (Admin)
const createTask = async (req, res) => {
  try {
    const { title, description, priority, deadline, assignedTo, projectId } = req.body;

    if (!title || !projectId) {
      return res.status(400).json({ message: 'Title and projectId are required' });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const task = await Task.create({
      title,
      description,
      priority: priority || 'Medium',
      deadline,
      assignedTo,
      projectId,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('projectId', 'name');
    await task.populate('createdBy', 'name email');

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get all tasks
// @route  GET /api/tasks
// @access Private
const getTasks = async (req, res) => {
  try {
    const { projectId } = req.query;
    let filter = {};

    if (projectId) filter.projectId = projectId;

    // Members only see their assigned tasks
    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('projectId', 'name')
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Update a task
// @route  PATCH /api/tasks/:id
// @access Private
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Members can only update status of their own tasks
    if (req.user.role === 'member') {
      if (task.assignedTo?.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this task' });
      }
      // Members can only change the status field
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: 'Members can only update task status' });
      }
      task.status = status;
    } else {
      // Admin can update all fields
      const { title, description, status, priority, deadline, assignedTo } = req.body;
      if (title) task.title = title;
      if (description !== undefined) task.description = description;
      if (status) task.status = status;
      if (priority) task.priority = priority;
      if (deadline !== undefined) task.deadline = deadline;
      if (assignedTo !== undefined) task.assignedTo = assignedTo;
    }

    const updatedTask = await task.save();
    await updatedTask.populate('assignedTo', 'name email');
    await updatedTask.populate('projectId', 'name');
    await updatedTask.populate('createdBy', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Delete a task
// @route  DELETE /api/tasks/:id
// @access Private (Admin)
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc   Get dashboard stats
// @route  GET /api/tasks/stats
// @access Private
const getDashboardStats = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === 'member') {
      filter.assignedTo = req.user._id;
    }

    const now = new Date();

    const [total, completed, pending, inProgress, overdue] = await Promise.all([
      Task.countDocuments(filter),
      Task.countDocuments({ ...filter, status: 'Completed' }),
      Task.countDocuments({ ...filter, status: 'Pending' }),
      Task.countDocuments({ ...filter, status: 'In Progress' }),
      Task.countDocuments({
        ...filter,
        status: { $ne: 'Completed' },
        deadline: { $lt: now },
      }),
    ]);

    res.json({ total, completed, pending, inProgress, overdue });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createTask, getTasks, updateTask, deleteTask, getDashboardStats };
