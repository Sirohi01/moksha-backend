const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const path = require('path');

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// In-memory gallery storage (replace with database in production)
let galleryImages = [
  {
    id: '1',
    src: '/gallery/gallery_ambulance_unit_1772862517482.png',
    alt: 'Ambulance Unit',
    title: 'Emergency Ambulance Service',
    description: 'Our dedicated ambulance unit providing 24/7 emergency services',
    category: 'services',
    uploadDate: new Date('2024-01-15'),
    size: '2.3 MB',
    dimensions: '1920x1080',
    cloudinaryId: null
  },
  {
    id: '2',
    src: '/gallery/gallery_community_support_1772861359875.png',
    alt: 'Community Support',
    title: 'Community Outreach Program',
    description: 'Volunteers engaging with local communities',
    category: 'community',
    uploadDate: new Date('2024-01-14'),
    size: '1.8 MB',
    dimensions: '1600x900',
    cloudinaryId: null
  },
  {
    id: '3',
    src: '/gallery/gallery_cremation_ceremony_1772861295131.png',
    alt: 'Cremation Ceremony',
    title: 'Dignified Cremation Service',
    description: 'Providing respectful final rites',
    category: 'services',
    uploadDate: new Date('2024-01-13'),
    size: '2.1 MB',
    dimensions: '1920x1080',
    cloudinaryId: null
  }
];

// @desc    Get all gallery images
// @route   GET /api/gallery
// @access  Private
const getGalleryImages = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, search } = req.query;
    
    let filteredImages = [...galleryImages];
    
    // Filter by category
    if (category && category !== 'all') {
      filteredImages = filteredImages.filter(img => img.category === category);
    }
    
    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredImages = filteredImages.filter(img => 
        img.title.toLowerCase().includes(searchTerm) ||
        img.description.toLowerCase().includes(searchTerm) ||
        img.alt.toLowerCase().includes(searchTerm)
      );
    }
    
    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedImages = filteredImages.slice(startIndex, endIndex);
    
    res.status(200).json({
      success: true,
      data: {
        images: paginatedImages,
        total: filteredImages.length,
        page: parseInt(page),
        pages: Math.ceil(filteredImages.length / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get gallery images failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery images'
    });
  }
};

// @desc    Upload new image
// @route   POST /api/gallery
// @access  Private
const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    const { title, description, category, alt } = req.body;

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file, 'moksha-seva/gallery');

    // Create new image record
    const newImage = {
      id: Date.now().toString(),
      src: result.url,
      alt: alt || title || 'Gallery Image',
      title: title || 'Untitled',
      description: description || '',
      category: category || 'general',
      uploadDate: new Date(),
      size: `${(result.size / (1024 * 1024)).toFixed(1)} MB`,
      dimensions: 'N/A', // dimensions not available in simplified uploadToCloudinary
      cloudinaryId: result.publicId
    };

    galleryImages.unshift(newImage);

    res.status(201).json({
      success: true,
      message: 'Image uploaded successfully',
      data: newImage
    });
  } catch (error) {
    console.error('❌ Image upload failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to upload image'
    });
  }
};

// @desc    Update image details
// @route   PUT /api/gallery/:id
// @access  Private
const updateImage = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, alt } = req.body;

    const imageIndex = galleryImages.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    // Update image details
    galleryImages[imageIndex] = {
      ...galleryImages[imageIndex],
      title: title || galleryImages[imageIndex].title,
      description: description || galleryImages[imageIndex].description,
      category: category || galleryImages[imageIndex].category,
      alt: alt || galleryImages[imageIndex].alt
    };

    res.status(200).json({
      success: true,
      message: 'Image updated successfully',
      data: galleryImages[imageIndex]
    });
  } catch (error) {
    console.error('❌ Image update failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update image'
    });
  }
};

// @desc    Delete image
// @route   DELETE /api/gallery/:id
// @access  Private
const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    const imageIndex = galleryImages.findIndex(img => img.id === id);
    
    if (imageIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Image not found'
      });
    }

    const image = galleryImages[imageIndex];

    // Delete from Cloudinary if it exists
    if (image.cloudinaryId) {
      try {
        await deleteFromCloudinary(image.cloudinaryId);
      } catch (cloudinaryError) {
        console.error('Cloudinary delete error:', cloudinaryError);
        // Continue with local deletion even if Cloudinary fails
      }
    }

    // Remove from local array
    galleryImages.splice(imageIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('❌ Image deletion failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete image'
    });
  }
};

// @desc    Get gallery statistics
// @route   GET /api/gallery/stats
// @access  Private
const getGalleryStats = async (req, res) => {
  try {
    const stats = {
      totalImages: galleryImages.length,
      categories: {
        services: galleryImages.filter(img => img.category === 'services').length,
        community: galleryImages.filter(img => img.category === 'community').length,
        events: galleryImages.filter(img => img.category === 'events').length,
        volunteers: galleryImages.filter(img => img.category === 'volunteers').length
      },
      recentUploads: galleryImages
        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
        .slice(0, 5)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Get gallery stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch gallery statistics'
    });
  }
};

module.exports = {
  getGalleryImages,
  uploadImage: [upload.single('image'), uploadImage],
  updateImage,
  deleteImage,
  getGalleryStats
};