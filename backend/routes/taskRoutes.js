const express = require('express');
const router = express.Router();
const {
  createTask,
  getTasks,
  updateTask,
  deleteTask,
  getDashboardStats,
} = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/stats', authMiddleware, getDashboardStats);
router.post('/', authMiddleware, roleMiddleware('admin'), createTask);
router.get('/', authMiddleware, getTasks);
router.patch('/:id', authMiddleware, updateTask);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteTask);

module.exports = router;
