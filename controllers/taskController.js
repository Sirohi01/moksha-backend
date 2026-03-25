const Task = require('../models/Task');
const Volunteer = require('../models/Volunteer');
const { sendEmail } = require('../services/emailService');

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private/Admin
const createTask = async (req, res) => {
  try {
    const taskData = {
      ...req.body,
      assignedBy: req.admin._id
    };

    const task = await Task.create(taskData);

    // If volunteers are assigned, send notifications
    if (req.body.volunteerIds && req.body.volunteerIds.length > 0) {
      await assignTaskToVolunteers(task._id, req.body.volunteerIds, req.admin._id);
    }

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: task
    });

  } catch (error) {
    console.error('❌ Task creation failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create task'
    });
  }
};

// @desc    Assign task to volunteers
// @route   POST /api/tasks/:id/assign
// @access  Private/Admin
const assignTaskToVolunteers = async (taskId, volunteerIds, adminId) => {
  try {
    const task = await Task.findById(taskId);
    if (!task) {
      throw new Error('Task not found');
    }

    // Get volunteer details
    const volunteers = await Volunteer.find({ _id: { $in: volunteerIds } });

    // Add assignments to task
    const newAssignments = volunteers.map(volunteer => ({
      volunteer: volunteer._id,
      status: 'pending',
      assignedAt: new Date()
    }));

    task.assignedTo.push(...newAssignments);
    await task.save();

    // Send email notifications to volunteers
    for (const volunteer of volunteers) {
      console.log(`📧 Sending task assignment email to ${volunteer.name} (${volunteer.email})`);
      try {
        await sendTaskAssignmentEmail(task, volunteer);
        console.log(`✅ Email sent successfully to ${volunteer.name}`);
      } catch (emailError) {
        console.error(`❌ Failed to send email to ${volunteer.name}:`, emailError);
        // Continue with other volunteers even if one fails
      }
    }

    return { success: true, assignedCount: volunteers.length };

  } catch (error) {
    console.error('❌ Task assignment failed:', error);
    throw error;
  }
};

// @desc    Send task assignment email
const sendTaskAssignmentEmail = async (task, volunteer) => {
  try {
    console.log(`📧 Preparing email for volunteer: ${volunteer.name}`);

    // Create direct response URLs that handle the action via API
    const acceptUrl = `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${task._id}/accept-direct?volunteerId=${volunteer._id}&token=${generateTaskToken(task._id, volunteer._id, 'accept')}`;
    const rejectUrl = `${process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL}/api/tasks/${task._id}/reject-direct?volunteerId=${volunteer._id}&token=${generateTaskToken(task._id, volunteer._id, 'reject')}`;

    console.log(`📧 Accept URL: ${acceptUrl}`);
    console.log(`📧 Reject URL: ${rejectUrl}`);

    const emailData = {
      volunteerName: volunteer.name,
      taskTitle: task.title,
      taskDescription: task.description,
      taskId: task.taskId,
      category: task.category.replace('_', ' ').toUpperCase(),
      priority: task.priority.toUpperCase(),
      dueDate: new Date(task.dueDate).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      estimatedDuration: task.estimatedDuration,
      location: task.location ? `${task.location.address}, ${task.location.city}, ${task.location.state} - ${task.location.pincode}` : 'Location will be provided',
      contactPerson: task.contactPerson ? `${task.contactPerson.name} (${task.contactPerson.phone}${task.contactPerson.email ? ', ' + task.contactPerson.email : ''})` : 'Contact details will be provided',
      requirements: task.requirements && task.requirements.length > 0 ? task.requirements.join(', ') : 'No special requirements',
      acceptUrl,
      rejectUrl
    };

    console.log(`📧 Email data prepared for ${volunteer.name}`);

    const result = await sendEmail(volunteer.email, 'taskAssignment', emailData);
    console.log(`📧 Email send result:`, result);

  } catch (error) {
    console.error('❌ Failed to send task assignment email:', error);
  }
};

// @desc    Generate secure task action token
const generateTaskToken = (taskId, volunteerId, action) => {
  const crypto = require('crypto');
  const secret = process.env.JWT_SECRET || 'moksha-seva-secret-key-2024';
  const data = `${taskId}-${volunteerId}-${action}-${secret}`;
  return crypto.createHash('sha256').update(data).digest('hex').substring(0, 32);
};

// @desc    Verify task action token
const verifyTaskToken = (token, taskId, volunteerId, action) => {
  if (!token) return false;
  const expectedToken = generateTaskToken(taskId, volunteerId, action);
  return token === expectedToken;
};

// @desc    Get all tasks (Admin)
// @route   GET /api/tasks
// @access  Private/Admin
const getTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const filter = {};
    if (req.query.status) filter.overallStatus = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.category) filter.category = req.query.category;
    if (req.query.assignedBy) filter.assignedBy = req.query.assignedBy;

    const tasks = await Task.find(filter)
      .populate('assignedTo.volunteer', 'name email phone volunteerTypes')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Task.countDocuments(filter);

    // Calculate statistics
    const stats = await Task.aggregate([
      {
        $group: {
          _id: '$overallStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {};
    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: tasks,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: statusStats
    });

  } catch (error) {
    console.error('❌ Get tasks failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch tasks'
    });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private/Admin
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo.volunteer', 'name email phone volunteerTypes')
      .populate('assignedBy', 'name email');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      data: task
    });

  } catch (error) {
    console.error('❌ Get task failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch task'
    });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private/Admin
const updateTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('assignedTo.volunteer', 'name email phone');

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task updated successfully',
      data: task
    });

  } catch (error) {
    console.error('❌ Task update failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task'
    });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private/Admin
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    await task.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Task deleted successfully'
    });

  } catch (error) {
    console.error('❌ Task deletion failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete task'
    });
  }
};

// @desc    Accept task directly from email (no frontend redirect)
// @route   GET /api/tasks/:id/accept-direct
// @access  Public (with token)
const acceptTaskDirect = async (req, res) => {
  try {
    const { token, volunteerId } = req.query;

    // Verify token
    if (!verifyTaskToken(token, req.params.id, volunteerId, 'accept')) {
      return res.status(403).send(`
        <html>
          <head><title>Invalid Link</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">❌ Invalid or Expired Link</h2>
            <p>The link you used is invalid or has expired. Please log in to your dashboard to accept the task.</p>
          </body>
        </html>
      `);
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send(`
        <html>
          <head><title>Task Not Found</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">❌ Task Not Found</h2>
            <p>The task you're trying to accept could not be found.</p>
          </body>
        </html>
      `);
    }

    // Find the assignment
    const assignment = task.assignedTo.find(
      a => a.volunteer.toString() === volunteerId && a.status === 'pending'
    );

    if (!assignment) {
      return res.status(400).send(`
        <html>
          <head><title>Task Already Processed</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #f59e0b;">⚠️ Task Already Processed</h2>
            <p>This task has already been accepted or rejected, or you're not assigned to this task.</p>
          </body>
        </html>
      `);
    }

    // Update assignment status
    assignment.status = 'accepted';
    assignment.acceptedAt = new Date();

    await task.save();

    // Get volunteer details
    const volunteer = await Volunteer.findById(volunteerId);

    // Send confirmation email
    await sendEmail(volunteer.email, 'taskAccepted', {
      volunteerName: volunteer.name,
      taskTitle: task.title,
      taskId: task.taskId,
      acceptedAt: new Date().toLocaleString('en-IN')
    });

    // Notify admin
    const admin = await require('../models/Admin').findById(task.assignedBy);
    if (admin) {
      await sendEmail(admin.email, 'taskAcceptedAdmin', {
        adminName: admin.name,
        volunteerName: volunteer.name,
        taskTitle: task.title,
        taskId: task.taskId
      });
    }

    res.status(200).send(`
      <html>
        <head><title>Task Accepted</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #f0fdf4, #dcfce7);">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <h1 style="color: #059669; margin-bottom: 20px;">✅ Task Accepted Successfully!</h1>
            <p style="color: #374151; font-size: 18px; margin-bottom: 15px;">Thank you, <strong>${volunteer.name}</strong>!</p>
            <p style="color: #6b7280; margin-bottom: 20px;">You have successfully accepted the task:</p>
            <div style="background: #f0fdf4; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #059669; margin: 0;">${task.title}</h3>
              <p style="color: #374151; margin: 5px 0;">Task ID: ${task.taskId}</p>
            </div>
            <p style="color: #6b7280;">A confirmation email has been sent to you with further details.</p>
            <p style="color: #059669; font-weight: bold; margin-top: 30px;">🙏 Thank you for serving humanity!</p>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Task acceptance failed:', error);
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Error</h2>
          <p>Failed to accept task. Please try again or contact support.</p>
        </body>
      </html>
    `);
  }
};

// @desc    Reject task directly from email (no frontend redirect)
// @route   GET /api/tasks/:id/reject-direct
// @access  Public (with token)
const rejectTaskDirect = async (req, res) => {
  try {
    const { token, volunteerId, reason } = req.query;

    // Verify token
    if (!verifyTaskToken(token, req.params.id, volunteerId, 'reject')) {
      return res.status(403).send(`
        <html>
          <head><title>Invalid Link</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">❌ Invalid or Expired Link</h2>
            <p>The link you used is invalid or has expired. Please log in to your dashboard to reject the task.</p>
          </body>
        </html>
      `);
    }

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).send(`
        <html>
          <head><title>Task Not Found</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #dc2626;">❌ Task Not Found</h2>
            <p>The task you're trying to reject could not be found.</p>
          </body>
        </html>
      `);
    }

    // Find the assignment
    const assignment = task.assignedTo.find(
      a => a.volunteer.toString() === volunteerId && a.status === 'pending'
    );

    if (!assignment) {
      return res.status(400).send(`
        <html>
          <head><title>Task Already Processed</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h2 style="color: #f59e0b;">⚠️ Task Already Processed</h2>
            <p>This task has already been accepted or rejected, or you're not assigned to this task.</p>
          </body>
        </html>
      `);
    }

    // Update assignment status
    assignment.status = 'rejected';
    assignment.rejectedAt = new Date();
    assignment.rejectionReason = reason || 'No reason provided';

    await task.save();

    // Get volunteer details
    const volunteer = await Volunteer.findById(volunteerId);

    // Send confirmation email
    await sendEmail(volunteer.email, 'taskRejected', {
      volunteerName: volunteer.name,
      taskTitle: task.title,
      taskId: task.taskId,
      rejectionReason: assignment.rejectionReason
    });

    // Notify admin
    const admin = await require('../models/Admin').findById(task.assignedBy);
    if (admin) {
      await sendEmail(admin.email, 'taskRejectedAdmin', {
        adminName: admin.name,
        volunteerName: volunteer.name,
        taskTitle: task.title,
        taskId: task.taskId,
        rejectionReason: assignment.rejectionReason
      });
    }

    res.status(200).send(`
      <html>
        <head><title>Task Rejected</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px; background: linear-gradient(135deg, #fef2f2, #fee2e2);">
          <div style="max-width: 500px; margin: 0 auto; background: white; padding: 40px; border-radius: 15px; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
            <h1 style="color: #dc2626; margin-bottom: 20px;">❌ Task Rejected</h1>
            <p style="color: #374151; font-size: 18px; margin-bottom: 15px;">Thank you for your response, <strong>${volunteer.name}</strong>.</p>
            <p style="color: #6b7280; margin-bottom: 20px;">You have rejected the task:</p>
            <div style="background: #fef2f2; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3 style="color: #dc2626; margin: 0;">${task.title}</h3>
              <p style="color: #374151; margin: 5px 0;">Task ID: ${task.taskId}</p>
            </div>
            <p style="color: #6b7280;">We understand that you may not be available for this task. Thank you for letting us know.</p>
            <p style="color: #6b7280; margin-top: 30px;">We appreciate your continued support of Moksha Sewa.</p>
          </div>
        </body>
      </html>
    `);

  } catch (error) {
    console.error('❌ Task rejection failed:', error);
    res.status(500).send(`
      <html>
        <head><title>Error</title></head>
        <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #dc2626;">❌ Error</h2>
          <p>Failed to reject task. Please try again or contact support.</p>
        </body>
      </html>
    `);
  }
};

// @desc    Accept task (Volunteer)
// @route   POST /api/tasks/:id/accept
// @access  Public (with token)
const acceptTask = async (req, res) => {
  try {
    const { token, volunteerId } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the assignment
    const assignment = task.assignedTo.find(
      a => a.volunteer.toString() === volunteerId && a.status === 'pending'
    );

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: 'Assignment not found or already processed'
      });
    }

    // Update assignment status
    assignment.status = 'accepted';
    assignment.acceptedAt = new Date();
    assignment.notes = req.body.notes || '';

    await task.save();

    // Get volunteer details
    const volunteer = await Volunteer.findById(volunteerId);

    // Send confirmation email
    await sendEmail(volunteer.email, 'taskAccepted', {
      volunteerName: volunteer.name,
      taskTitle: task.title,
      taskId: task.taskId,
      acceptedAt: new Date().toLocaleString('en-IN')
    });

    // Notify admin
    const admin = await require('../models/Admin').findById(task.assignedBy);
    if (admin) {
      await sendEmail(admin.email, 'taskAcceptedAdmin', {
        adminName: admin.name,
        volunteerName: volunteer.name,
        taskTitle: task.title,
        taskId: task.taskId
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task accepted successfully'
    });

  } catch (error) {
    console.error('❌ Task acceptance failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to accept task'
    });
  }
};

// @desc    Reject task (Volunteer)
// @route   POST /api/tasks/:id/reject
// @access  Public (with token)
const rejectTask = async (req, res) => {
  try {
    const { token, volunteerId, reason } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the assignment
    const assignment = task.assignedTo.find(
      a => a.volunteer.toString() === volunteerId && a.status === 'pending'
    );

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: 'Assignment not found or already processed'
      });
    }

    // Update assignment status
    assignment.status = 'rejected';
    assignment.rejectedAt = new Date();
    assignment.rejectionReason = reason || 'No reason provided';

    await task.save();

    // Get volunteer details
    const volunteer = await Volunteer.findById(volunteerId);

    // Send confirmation email
    await sendEmail(volunteer.email, 'taskRejected', {
      volunteerName: volunteer.name,
      taskTitle: task.title,
      taskId: task.taskId,
      rejectionReason: assignment.rejectionReason
    });

    // Notify admin
    const admin = await require('../models/Admin').findById(task.assignedBy);
    if (admin) {
      await sendEmail(admin.email, 'taskRejectedAdmin', {
        adminName: admin.name,
        volunteerName: volunteer.name,
        taskTitle: task.title,
        taskId: task.taskId,
        rejectionReason: assignment.rejectionReason
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task rejected successfully'
    });

  } catch (error) {
    console.error('❌ Task rejection failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject task'
    });
  }
};

// @desc    Get volunteer tasks
// @route   GET /api/tasks/volunteer/:volunteerId
// @access  Private/Volunteer
const getVolunteerTasks = async (req, res) => {
  try {
    const volunteerId = req.params.volunteerId;
    const status = req.query.status;

    const filter = {
      'assignedTo.volunteer': volunteerId
    };

    if (status) {
      filter['assignedTo.status'] = status;
    }

    const tasks = await Task.find(filter)
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });

    // Filter tasks to show only relevant assignments
    const volunteerTasks = tasks.map(task => {
      const assignment = task.assignedTo.find(a => a.volunteer.toString() === volunteerId);
      return {
        ...task.toObject(),
        assignmentStatus: assignment.status,
        assignedAt: assignment.assignedAt,
        acceptedAt: assignment.acceptedAt,
        rejectedAt: assignment.rejectedAt,
        notes: assignment.notes
      };
    });

    res.status(200).json({
      success: true,
      data: volunteerTasks
    });

  } catch (error) {
    console.error('❌ Get volunteer tasks failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch volunteer tasks'
    });
  }
};

// @desc    Approve volunteer assignment (Admin)
// @route   POST /api/tasks/:id/approve-assignment
// @access  Private/Admin
const approveVolunteerAssignment = async (req, res) => {
  try {
    const { volunteerId, approved, rejectionReason } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the assignment
    const assignment = task.assignedTo.find(
      a => a.volunteer.toString() === volunteerId
    );

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Update admin approval status
    if (approved) {
      assignment.adminApprovalStatus = 'approved';
      assignment.adminApprovedBy = req.admin._id;
      assignment.adminApprovedAt = new Date();
    } else {
      assignment.adminApprovalStatus = 'rejected';
      assignment.adminApprovedBy = req.admin._id;
      assignment.adminApprovedAt = new Date();
      if (rejectionReason) {
        assignment.adminRejectionReason = rejectionReason;
      }
    }

    await task.save();

    // Get volunteer details for notification
    const volunteer = await Volunteer.findById(volunteerId);

    if (approved) {
      // Send approval notification
      await sendEmail(volunteer.email, 'assignmentApproved', {
        volunteerName: volunteer.name,
        taskTitle: task.title,
        taskId: task.taskId,
        approvedAt: new Date().toLocaleString('en-IN')
      });
    } else {
      // Send rejection notification
      await sendEmail(volunteer.email, 'assignmentRejected', {
        volunteerName: volunteer.name,
        taskTitle: task.title,
        taskId: task.taskId,
        rejectionReason: rejectionReason || 'No reason provided',
        rejectedAt: new Date().toLocaleString('en-IN')
      });
    }

    res.status(200).json({
      success: true,
      message: `Assignment ${approved ? 'approved' : 'rejected'} successfully`
    });

  } catch (error) {
    console.error('❌ Assignment approval failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process assignment approval'
    });
  }
};

// @desc    Update task status (Admin)
// @route   PUT /api/tasks/:id/status
// @access  Private/Admin
const updateTaskStatus = async (req, res) => {
  try {
    const { status, notes } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    const oldStatus = task.overallStatus;
    task.overallStatus = status;

    if (notes) {
      task.completionNotes = notes;
    }

    await task.save();

    // If task is marked as completed, generate certificates for all completed assignments
    if (status === 'completed' && oldStatus !== 'completed') {
      console.log(`🏆 Task marked as completed, generating certificates...`);
      console.log(`🏆 Found ${task.assignedTo.length} assignments`);

      for (const assignment of task.assignedTo) {
        console.log(`🏆 Checking assignment for volunteer ${assignment.volunteer}: status=${assignment.status}, certificateGenerated=${assignment.certificateGenerated}`);

        if (assignment.status === 'completed' && !assignment.certificateGenerated) {
          console.log(`🏆 Generating certificate for completed assignment`);
          try {
            await generateCompletionCertificate(task, assignment);
          } catch (certError) {
            console.error(`❌ Failed to generate certificate for assignment:`, certError);
          }
        } else {
          console.log(`🏆 Skipping certificate generation: status=${assignment.status}, already generated=${assignment.certificateGenerated}`);
        }
      }
    }

    res.status(200).json({
      success: true,
      message: 'Task status updated successfully',
      data: task
    });

  } catch (error) {
    console.error('❌ Task status update failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update task status'
    });
  }
};

// @desc    Update volunteer status (Admin)
// @route   PUT /api/tasks/:id/volunteer-status
// @access  Private/Admin
const updateVolunteerStatus = async (req, res) => {
  try {
    const { volunteerId, status } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the assignment
    const assignment = task.assignedTo.find(
      a => a.volunteer.toString() === volunteerId
    );

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: 'Assignment not found'
      });
    }

    // Update volunteer status
    assignment.status = status;

    // Update timestamps based on status
    if (status === 'accepted') {
      assignment.acceptedAt = new Date();
    } else if (status === 'rejected') {
      assignment.rejectedAt = new Date();
    } else if (status === 'completed') {
      assignment.completedAt = new Date();
      // Generate certificate if not already generated
      if (!assignment.certificateGenerated) {
        await generateCompletionCertificate(task, assignment);
      }
    }

    await task.save();

    res.status(200).json({
      success: true,
      message: `Volunteer status updated to ${status} successfully`
    });

  } catch (error) {
    console.error('❌ Volunteer status update failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update volunteer status'
    });
  }
};
const generateCompletionCertificate = async (task, assignment) => {
  try {
    console.log(`🏆 Generating certificate for volunteer assignment...`);

    const volunteer = await Volunteer.findById(assignment.volunteer);
    if (!volunteer) {
      console.error(`❌ Volunteer not found for assignment`);
      return;
    }

    console.log(`🏆 Generating certificate for ${volunteer.name}`);

    // Generate certificate PDF
    const certificateHtml = generateCertificateHTML({
      volunteerName: volunteer.name,
      taskTitle: task.title,
      taskId: task.taskId,
      category: task.category.replace('_', ' ').toUpperCase(),
      completedDate: assignment.completedAt || new Date(),
      duration: task.estimatedDuration,
      location: task.location ? `${task.location.city}, ${task.location.state}` : 'Various Locations'
    });

    console.log(`🏆 Certificate HTML generated`);

    // Use PDF service to generate certificate
    const { generatePDF } = require('../services/pdfService');
    const pdfBuffer = await generatePDF(certificateHtml, {
      format: 'A4',
      orientation: 'landscape',
      border: {
        top: '0.5in',
        right: '0.5in',
        bottom: '0.5in',
        left: '0.5in'
      }
    });

    console.log(`🏆 Certificate PDF generated`);

    // Save certificate filename
    const certificateFilename = `certificate-${task.taskId}-${volunteer._id}.pdf`;

    // Update assignment with certificate info
    assignment.certificateGenerated = true;
    assignment.certificateUrl = `/certificates/${certificateFilename}`;
    assignment.certificateGeneratedAt = new Date();

    await task.save();

    console.log(`🏆 Certificate info saved to database`);

    // Send certificate via email with correct attachment format
    const emailResult = await sendEmail(
      volunteer.email,
      'completionCertificate',
      {
        volunteerName: volunteer.name,
        taskTitle: task.title,
        taskId: task.taskId,
        completedDate: (assignment.completedAt || new Date()).toLocaleDateString('en-IN')
      },
      {
        filename: certificateFilename,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    );

    console.log(`🏆 Certificate email result:`, emailResult);

    if (emailResult.success) {
      console.log(`✅ Certificate generated and sent to ${volunteer.name} for task ${task.taskId}`);
    } else {
      console.error(`❌ Failed to send certificate email:`, emailResult.error);
    }

  } catch (error) {
    console.error('❌ Certificate generation failed:', error);
    console.error('❌ Error details:', error.message);
  }
};

// @desc    Generate certificate HTML template
const generateCertificateHTML = (data) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Volunteer Certificate - ${data.taskId}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Inter:wght@300;400;500;600&display=swap');
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Inter', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        
        .certificate {
          background: white;
          width: 100%;
          max-width: 800px;
          padding: 60px;
          border-radius: 20px;
          box-shadow: 0 20px 60px rgba(0,0,0,0.1);
          position: relative;
          overflow: hidden;
        }
        
        .certificate::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #f4c430, #20b2aa, #f4c430);
        }
        
        .certificate::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 8px;
          background: linear-gradient(90deg, #f4c430, #20b2aa, #f4c430);
        }
        
        .header {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .logo {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #f4c430, #20b2aa);
          border-radius: 50%;
          margin: 0 auto 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 36px;
          color: white;
          font-weight: bold;
        }
        
        .org-name {
          font-family: 'Playfair Display', serif;
          font-size: 32px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 8px;
        }
        
        .org-tagline {
          font-size: 14px;
          color: #718096;
          font-style: italic;
          margin-bottom: 30px;
        }
        
        .certificate-title {
          font-family: 'Playfair Display', serif;
          font-size: 36px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 30px;
          text-transform: uppercase;
          letter-spacing: 2px;
        }
        
        .content {
          text-align: center;
          margin-bottom: 40px;
        }
        
        .presented-to {
          font-size: 18px;
          color: #4a5568;
          margin-bottom: 15px;
        }
        
        .volunteer-name {
          font-family: 'Playfair Display', serif;
          font-size: 42px;
          font-weight: 700;
          color: #2d3748;
          margin-bottom: 25px;
          text-decoration: underline;
          text-decoration-color: #f4c430;
          text-underline-offset: 8px;
          text-decoration-thickness: 3px;
        }
        
        .recognition-text {
          font-size: 16px;
          color: #4a5568;
          line-height: 1.6;
          margin-bottom: 30px;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        
        .task-details {
          background: linear-gradient(135deg, #f7fafc, #edf2f7);
          padding: 25px;
          border-radius: 15px;
          margin: 30px 0;
          border-left: 5px solid #f4c430;
        }
        
        .task-details h3 {
          color: #2d3748;
          font-size: 18px;
          margin-bottom: 15px;
          font-weight: 600;
        }
        
        .detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
          text-align: left;
        }
        
        .detail-item {
          display: flex;
          flex-direction: column;
        }
        
        .detail-label {
          font-size: 12px;
          color: #718096;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 4px;
        }
        
        .detail-value {
          font-size: 14px;
          color: #2d3748;
          font-weight: 600;
        }
        
        .signatures {
          display: flex;
          justify-content: space-between;
          margin-top: 50px;
          padding-top: 30px;
          border-top: 2px solid #e2e8f0;
        }
        
        .signature {
          text-align: center;
          flex: 1;
        }
        
        .signature-line {
          width: 200px;
          height: 2px;
          background: #cbd5e0;
          margin: 0 auto 10px;
        }
        
        .signature-title {
          font-size: 14px;
          color: #4a5568;
          font-weight: 600;
        }
        
        .signature-name {
          font-size: 12px;
          color: #718096;
          margin-top: 4px;
        }
        
        .certificate-id {
          position: absolute;
          bottom: 20px;
          right: 30px;
          font-size: 10px;
          color: #a0aec0;
          font-family: monospace;
        }
        
        .decorative-border {
          position: absolute;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          border: 2px solid #e2e8f0;
          border-radius: 15px;
          pointer-events: none;
        }
        
        .corner-decoration {
          position: absolute;
          width: 40px;
          height: 40px;
          background: linear-gradient(45deg, #f4c430, #20b2aa);
          opacity: 0.1;
        }
        
        .corner-decoration.top-left {
          top: 30px;
          left: 30px;
          border-radius: 0 0 20px 0;
        }
        
        .corner-decoration.top-right {
          top: 30px;
          right: 30px;
          border-radius: 0 0 0 20px;
        }
        
        .corner-decoration.bottom-left {
          bottom: 30px;
          left: 30px;
          border-radius: 0 20px 0 0;
        }
        
        .corner-decoration.bottom-right {
          bottom: 30px;
          right: 30px;
          border-radius: 20px 0 0 0;
        }
      </style>
    </head>
    <body>
      <div class="certificate">
        <div class="decorative-border"></div>
        <div class="corner-decoration top-left"></div>
        <div class="corner-decoration top-right"></div>
        <div class="corner-decoration bottom-left"></div>
        <div class="corner-decoration bottom-right"></div>
        
        <div class="header">
          <div class="logo">🙏</div>
          <h1 class="org-name">Moksha Sewa Foundation</h1>
          <p class="org-tagline">Liberation Through Service</p>
          <h2 class="certificate-title">Certificate of Appreciation</h2>
        </div>
        
        <div class="content">
          <p class="presented-to">This certificate is proudly presented to</p>
          <h3 class="volunteer-name">${data.volunteerName}</h3>
          
          <p class="recognition-text">
            In recognition of your dedicated service and compassionate contribution to humanity. 
            Your selfless efforts in helping families during their most difficult times exemplify 
            the true spirit of service and compassion that Moksha Sewa Foundation stands for.
          </p>
          
          <div class="task-details">
            <h3>Service Details</h3>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">Task</span>
                <span class="detail-value">${data.taskTitle}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Category</span>
                <span class="detail-value">${data.category}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Completion Date</span>
                <span class="detail-value">${new Date(data.completedDate).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Service Duration</span>
                <span class="detail-value">${data.duration} Hour(s)</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Location</span>
                <span class="detail-value">${data.location}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">Task ID</span>
                <span class="detail-value">${data.taskId}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="signatures">
          <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-title">Volunteer Coordinator</div>
            <div class="signature-name">Moksha Sewa Foundation</div>
          </div>
          <div class="signature">
            <div class="signature-line"></div>
            <div class="signature-title">Director</div>
            <div class="signature-name">Moksha Sewa Foundation</div>
          </div>
        </div>
        
        <div class="certificate-id">
          Certificate ID: CERT-${data.taskId}-${new Date().getFullYear()}
        </div>
      </div>
    </body>
    </html>
  `;
};
// @route   POST /api/tasks/:id/complete
// @access  Private/Volunteer
const completeTask = async (req, res) => {
  try {
    const { volunteerId, completionNotes, rating, feedback } = req.body;

    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({
        success: false,
        message: 'Task not found'
      });
    }

    // Find the assignment
    const assignment = task.assignedTo.find(
      a => a.volunteer.toString() === volunteerId && a.status === 'accepted'
    );

    if (!assignment) {
      return res.status(400).json({
        success: false,
        message: 'Assignment not found or not accepted'
      });
    }

    // Update assignment status
    assignment.status = 'completed';
    assignment.completedAt = new Date();
    assignment.notes = completionNotes || '';

    // Add feedback
    if (rating || feedback) {
      task.feedback = {
        rating: rating,
        comments: feedback,
        submittedBy: volunteerId,
        submittedAt: new Date()
      };
    }

    await task.save();

    // Generate completion certificate
    await generateCompletionCertificate(task, assignment);

    // Get volunteer details
    const volunteer = await Volunteer.findById(volunteerId);

    // Send confirmation email
    await sendEmail(volunteer.email, 'taskCompleted', {
      volunteerName: volunteer.name,
      taskTitle: task.title,
      taskId: task.taskId,
      completedAt: new Date().toLocaleString('en-IN')
    });

    // Notify admin
    const admin = await require('../models/Admin').findById(task.assignedBy);
    if (admin) {
      await sendEmail(admin.email, 'taskCompletedAdmin', {
        adminName: admin.name,
        volunteerName: volunteer.name,
        taskTitle: task.title,
        taskId: task.taskId,
        completionNotes: completionNotes,
        rating: rating
      });
    }

    res.status(200).json({
      success: true,
      message: 'Task marked as completed successfully'
    });

  } catch (error) {
    console.error('❌ Task completion failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete task'
    });
  }
};

module.exports = {
  createTask,
  assignTaskToVolunteers,
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
  updateVolunteerStatus,
  generateCompletionCertificate
};