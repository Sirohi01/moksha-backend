const express = require('express');
const { createVolunteer, getVolunteers, getVolunteer, updateVolunteerStatus } = require('../controllers/volunteerController');
const { volunteerValidation } = require('../middleware/validation');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/', volunteerValidation, createVolunteer);

// Admin routes (protected)
router.get('/', protect, getVolunteers);
router.get('/:id', protect, getVolunteer);
router.put('/:id/status', protect, updateVolunteerStatus);

module.exports = router;