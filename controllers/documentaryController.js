// In-memory documentaries storage (replace with database in production)
let documentaries = [
  {
    id: '1',
    title: 'Dignity in Death: The Moksha Sewa Story',
    description: 'A comprehensive documentary about our mission to provide dignified last rites for unclaimed bodies.',
    duration: '45 minutes',
    releaseDate: new Date('2024-02-15'),
    status: 'completed',
    director: 'Rajesh Kumar',
    category: 'organizational',
    thumbnailUrl: '/thumbnails/dignity-in-death.jpg',
    videoUrl: '/videos/dignity-in-death.mp4',
    views: 15420,
    budget: 500000,
    createdAt: new Date('2023-10-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    title: 'Volunteers: Hearts of Service',
    description: 'Stories of our dedicated volunteers and their impact on communities.',
    duration: '30 minutes',
    releaseDate: new Date('2024-03-01'),
    status: 'post_production',
    director: 'Priya Sharma',
    category: 'volunteer_stories',
    thumbnailUrl: '/thumbnails/volunteers.jpg',
    videoUrl: null,
    views: 0,
    budget: 300000,
    createdAt: new Date('2023-11-01'),
    updatedAt: new Date('2024-01-10')
  },
  {
    id: '3',
    title: 'Rural Outreach: Expanding Our Mission',
    description: 'Documenting our expansion into rural areas and the challenges faced.',
    duration: '35 minutes',
    releaseDate: new Date('2024-04-15'),
    status: 'production',
    director: 'Amit Patel',
    category: 'expansion',
    thumbnailUrl: null,
    videoUrl: null,
    views: 0,
    budget: 400000,
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-01-05')
  },
  {
    id: '4',
    title: 'Government Partnership Initiative',
    description: 'Behind the scenes of our collaboration with government healthcare systems.',
    duration: '25 minutes',
    releaseDate: new Date('2024-05-01'),
    status: 'planning',
    director: 'Sunita Rao',
    category: 'partnerships',
    thumbnailUrl: null,
    videoUrl: null,
    views: 0,
    budget: 250000,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }
];

// @desc    Get all documentaries
// @route   GET /api/documentaries
// @access  Private
const getDocumentaries = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, category, search } = req.query;

    let filteredDocumentaries = [...documentaries];

    // Filter by status
    if (status && status !== 'all') {
      filteredDocumentaries = filteredDocumentaries.filter(doc => doc.status === status);
    }

    // Filter by category
    if (category && category !== 'all') {
      filteredDocumentaries = filteredDocumentaries.filter(doc => doc.category === category);
    }

    // Filter by search term
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredDocumentaries = filteredDocumentaries.filter(doc =>
        doc.title.toLowerCase().includes(searchTerm) ||
        doc.description.toLowerCase().includes(searchTerm) ||
        doc.director.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by release date (newest first)
    filteredDocumentaries.sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate));

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedDocumentaries = filteredDocumentaries.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: {
        documentaries: paginatedDocumentaries,
        total: filteredDocumentaries.length,
        page: parseInt(page),
        pages: Math.ceil(filteredDocumentaries.length / limit)
      }
    });
  } catch (error) {
    console.error('❌ Get documentaries failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documentaries'
    });
  }
};

// @desc    Get single documentary
// @route   GET /api/documentaries/:id
// @access  Private
const getDocumentary = async (req, res) => {
  try {
    const { id } = req.params;

    const documentary = documentaries.find(doc => doc.id === id);

    if (!documentary) {
      return res.status(404).json({
        success: false,
        message: 'Documentary not found'
      });
    }

    res.status(200).json({
      success: true,
      data: documentary
    });
  } catch (error) {
    console.error('❌ Get documentary failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documentary'
    });
  }
};

// @desc    Create new documentary
// @route   POST /api/documentaries
// @access  Private
const createDocumentary = async (req, res) => {
  try {
    const {
      title,
      description,
      duration,
      releaseDate,
      status = 'planning',
      director,
      category,
      budget = 0
    } = req.body;

    const newDocumentary = {
      id: Date.now().toString(),
      title,
      description,
      duration,
      releaseDate: new Date(releaseDate),
      status,
      director,
      category,
      thumbnailUrl: null,
      videoUrl: null,
      views: 0,
      budget,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    documentaries.unshift(newDocumentary);

    res.status(201).json({
      success: true,
      message: 'Documentary created successfully',
      data: newDocumentary
    });
  } catch (error) {
    console.error('❌ Create documentary failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create documentary'
    });
  }
};

// @desc    Update documentary
// @route   PUT /api/documentaries/:id
// @access  Private
const updateDocumentary = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      title,
      description,
      duration,
      releaseDate,
      status,
      director,
      category,
      thumbnailUrl,
      videoUrl,
      budget
    } = req.body;

    const docIndex = documentaries.findIndex(doc => doc.id === id);

    if (docIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Documentary not found'
      });
    }

    // Update documentary
    documentaries[docIndex] = {
      ...documentaries[docIndex],
      title: title || documentaries[docIndex].title,
      description: description || documentaries[docIndex].description,
      duration: duration || documentaries[docIndex].duration,
      releaseDate: releaseDate ? new Date(releaseDate) : documentaries[docIndex].releaseDate,
      status: status || documentaries[docIndex].status,
      director: director || documentaries[docIndex].director,
      category: category || documentaries[docIndex].category,
      thumbnailUrl: thumbnailUrl !== undefined ? thumbnailUrl : documentaries[docIndex].thumbnailUrl,
      videoUrl: videoUrl !== undefined ? videoUrl : documentaries[docIndex].videoUrl,
      budget: budget !== undefined ? budget : documentaries[docIndex].budget,
      updatedAt: new Date()
    };

    res.status(200).json({
      success: true,
      message: 'Documentary updated successfully',
      data: documentaries[docIndex]
    });
  } catch (error) {
    console.error('❌ Update documentary failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update documentary'
    });
  }
};

// @desc    Delete documentary
// @route   DELETE /api/documentaries/:id
// @access  Private
const deleteDocumentary = async (req, res) => {
  try {
    const { id } = req.params;

    const docIndex = documentaries.findIndex(doc => doc.id === id);

    if (docIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Documentary not found'
      });
    }

    // Remove from array
    documentaries.splice(docIndex, 1);

    res.status(200).json({
      success: true,
      message: 'Documentary deleted successfully'
    });
  } catch (error) {
    console.error('❌ Delete documentary failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete documentary'
    });
  }
};

// @desc    Get documentary statistics
// @route   GET /api/documentaries/stats
// @access  Private
const getDocumentaryStats = async (req, res) => {
  try {
    const stats = {
      totalProjects: documentaries.length,
      byStatus: {
        planning: documentaries.filter(doc => doc.status === 'planning').length,
        production: documentaries.filter(doc => doc.status === 'production').length,
        post_production: documentaries.filter(doc => doc.status === 'post_production').length,
        completed: documentaries.filter(doc => doc.status === 'completed').length,
        published: documentaries.filter(doc => doc.status === 'published').length
      },
      byCategory: {
        organizational: documentaries.filter(doc => doc.category === 'organizational').length,
        volunteer_stories: documentaries.filter(doc => doc.category === 'volunteer_stories').length,
        expansion: documentaries.filter(doc => doc.category === 'expansion').length,
        partnerships: documentaries.filter(doc => doc.category === 'partnerships').length,
        impact_stories: documentaries.filter(doc => doc.category === 'impact_stories').length
      },
      totalViews: documentaries.reduce((sum, doc) => sum + doc.views, 0),
      totalBudget: documentaries.reduce((sum, doc) => sum + doc.budget, 0),
      recentProjects: documentaries
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
    };

    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('❌ Get documentary stats failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch documentary statistics'
    });
  }
};

module.exports = {
  getDocumentaries,
  getDocumentary,
  createDocumentary,
  updateDocumentary,
  deleteDocumentary,
  getDocumentaryStats
};