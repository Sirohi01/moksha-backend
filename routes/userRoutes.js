const express = require('express');
const { getUsers, getUser, updateUser, toggleUserStatus } = require('../controllers/userController');
const { protect, checkPermission } = require('../middleware/auth');

const router = express.Router();
router.use(protect);

// User management routes
router.get('/', checkPermission('view_users'), getUsers);
router.get('/:id', checkPermission('view_users'), getUser);
router.put('/:id', checkPermission('manage_users'), updateUser);
router.put('/:id/status', checkPermission('manage_users'), toggleUserStatus);

module.exports = router;