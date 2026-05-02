const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProjectById,
  deleteProject,
  addMember,
} = require('../controllers/projectController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.post('/', authMiddleware, roleMiddleware('admin'), createProject);
router.get('/', authMiddleware, getProjects);
router.get('/:id', authMiddleware, getProjectById);
router.delete('/:id', authMiddleware, roleMiddleware('admin'), deleteProject);
router.patch('/:id/members', authMiddleware, roleMiddleware('admin'), addMember);

module.exports = router;
