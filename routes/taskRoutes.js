const express = require('express');
const {
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  acceptTask,
  rejectTask,
  acceptTaskDirect,
  rejectTaskDirect,
  getVolunteerTasks,
  completeTask,
  approveVolunteerAssignment,
  updateTaskStatus,
  updateVolunteerStatus
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Admin routes (protected)
router.get('/', protect, getTasks);
router.post('/', protect, createTask);
router.get('/:id', protect, getTask);
router.put('/:id', protect, updateTask);
router.delete('/:id', protect, deleteTask);
router.post('/:id/assign', protect, async (req, res) => {
  try {
    const { assignTaskToVolunteers } = require('../controllers/taskController');
    const result = await assignTaskToVolunteers(req.params.id, req.body.volunteerIds, req.admin._id);
    res.status(200).json({
      success: true,
      message: `Successfully assigned task to ${result.assignedCount} volunteers`,
      data: result
    });
  } catch (error) {
    console.error('❌ Task assignment failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to assign task to volunteers'
    });
  }
});

// Admin approval and status routes
router.post('/:id/approve-assignment', protect, approveVolunteerAssignment);
router.put('/:id/status', protect, updateTaskStatus);
router.put('/:id/volunteer-status', protect, updateVolunteerStatus);

// Volunteer routes
router.get('/volunteer/:volunteerId', getVolunteerTasks);
router.post('/:id/complete', completeTask);
router.post('/:id/accept', acceptTask);
router.post('/:id/reject', rejectTask);
router.get('/:id/accept-direct', acceptTaskDirect);
router.get('/:id/reject-direct', rejectTaskDirect);

module.exports = router;