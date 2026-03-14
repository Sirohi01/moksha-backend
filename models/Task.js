const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  // Task Details
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Task description is required']
  },
  category: {
    type: String,
    enum: ['cremation_assistance', 'family_support', 'documentation', 'transportation', 'coordination', 'emergency_response', 'administrative', 'other'],
    required: [true, 'Task category is required']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  
  // Assignment Details
  assignedTo: [{
    volunteer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer',
      required: true
    },
    assignedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'in_progress', 'completed', 'cancelled'],
      default: 'pending'
    },
    adminApprovalStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending'
    },
    adminApprovedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    adminApprovedAt: Date,
    adminRejectionReason: String,
    acceptedAt: Date,
    rejectedAt: Date,
    completedAt: Date,
    rejectionReason: String,
    notes: String,
    certificateGenerated: {
      type: Boolean,
      default: false
    },
    certificateUrl: String,
    certificateGeneratedAt: Date
  }],
  
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin',
    required: true
  },
  
  // Task Timeline
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  estimatedDuration: {
    type: Number, // in hours
    default: 1
  },
  
  // Location Details
  location: {
    address: String,
    city: String,
    state: String,
    pincode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Contact Information
  contactPerson: {
    name: String,
    phone: String,
    email: String,
    relationship: String // family member, hospital staff, etc.
  },
  
  // Task Status
  overallStatus: {
    type: String,
    enum: ['draft', 'assigned', 'in_progress', 'completed', 'cancelled', 'overdue'],
    default: 'draft'
  },
  
  // Additional Details
  requirements: [String], // special requirements or skills needed
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Tracking
  taskId: {
    type: String,
    unique: true
  },
  
  // Completion Details
  completionNotes: String,
  completionPhotos: [String],
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer'
    },
    submittedAt: Date
  },
  
  // System Fields
  isUrgent: {
    type: Boolean,
    default: false
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly']
    },
    endDate: Date
  },
  
  // Notifications
  remindersSent: [{
    type: {
      type: String,
      enum: ['assignment', 'reminder', 'overdue']
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentTo: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Volunteer'
    }]
  }]
}, {
  timestamps: true
});

// Generate task ID before saving
taskSchema.pre('save', async function(next) {
  if (!this.taskId) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments();
    this.taskId = `TSK-${year}-${String(count + 1).padStart(5, '0')}`;
  }
  
  // Update overall status based on assignments
  if (this.assignedTo && this.assignedTo.length > 0) {
    const statuses = this.assignedTo.map(assignment => assignment.status);
    
    if (statuses.every(status => status === 'completed')) {
      this.overallStatus = 'completed';
    } else if (statuses.some(status => status === 'in_progress')) {
      this.overallStatus = 'in_progress';
    } else if (statuses.some(status => status === 'accepted')) {
      this.overallStatus = 'in_progress';
    } else if (statuses.every(status => ['rejected', 'cancelled'].includes(status))) {
      this.overallStatus = 'cancelled';
    } else if (this.dueDate < new Date() && !statuses.some(status => ['completed', 'in_progress'].includes(status))) {
      this.overallStatus = 'overdue';
    } else {
      this.overallStatus = 'assigned';
    }
  }
  
  next();
});

// Indexes
taskSchema.index({ taskId: 1 });
taskSchema.index({ 'assignedTo.volunteer': 1 });
taskSchema.index({ assignedBy: 1 });
taskSchema.index({ overallStatus: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ category: 1 });
taskSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Task', taskSchema);