const mongoose = require('mongoose');
const Content = require('../models/Content');
const getPageConfig = async (req, res) => {
  try {
    const { pageName } = req.params;
    const pageConfig = await Content.findOne({
      type: 'page_config',
      slug: pageName,
      status: 'published'
    });

    if (!pageConfig) {
      return res.status(404).json({
        success: false,
        message: `Configuration for page '${pageName}' not found`
      });
    }
    let configData;
    try {
      configData = JSON.parse(pageConfig.content);
    } catch (parseError) {
      console.error('❌ Error parsing config JSON:', parseError);
      return res.status(500).json({
        success: false,
        message: 'Invalid configuration format'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        pageName,
        config: configData,
        lastModified: pageConfig.updatedAt,
        version: pageConfig.version || 1
      }
    });

  } catch (error) {
    console.error('❌ Get page config failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page configuration'
    });
  }
};
const updatePageConfig = async (req, res) => {
  try {
    const { pageName } = req.params;
    const { config, changeLog } = req.body;

    if (!config) {
      return res.status(400).json({
        success: false,
        message: 'Configuration data is required'
      });
    }
    let configString;
    try {
      configString = typeof config === 'string' ? config : JSON.stringify(config, null, 2);
      JSON.parse(configString);
    } catch (parseError) {
      return res.status(400).json({
        success: false,
        message: 'Invalid JSON configuration format'
      });
    }
    let pageConfig = await Content.findOne({
      type: 'page_config',
      slug: pageName
    });

    if (pageConfig) {
      if (pageConfig.content !== configString) {
        pageConfig.previousVersions.push({
          version: pageConfig.version || 1,
          content: pageConfig.content,
          modifiedBy: req.admin._id,
          changeLog: changeLog || 'Configuration updated'
        });
        pageConfig.version = (pageConfig.version || 1) + 1;
      }
      pageConfig.content = configString;
      pageConfig.lastEditedBy = req.admin._id;
      pageConfig.status = 'published';
      
    } else {
      pageConfig = new Content({
        title: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page Configuration`,
        slug: pageName,
        content: configString,
        type: 'page_config',
        category: 'configuration',
        status: 'published',
        author: req.admin._id,
        lastEditedBy: req.admin._id,
        metaTitle: `${pageName} Page Config`,
        metaDescription: `Configuration data for ${pageName} page`,
        version: 1
      });
    }

    await pageConfig.save();

    res.status(200).json({
      success: true,
      message: `Configuration for '${pageName}' updated successfully`,
      data: {
        pageName,
        version: pageConfig.version,
        lastModified: pageConfig.updatedAt
      }
    });

  } catch (error) {
    console.error('❌ Update page config failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update page configuration'
    });
  }
};
const getAllPageConfigs = async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const skip = (page - 1) * limit;
    const filter = { type: 'page_config' };
    if (search) {
      filter.$or = [
        { title: new RegExp(search, 'i') },
        { slug: new RegExp(search, 'i') }
      ];
    }

    const pageConfigs = await Content.find(filter)
      .select('title slug status updatedAt version author lastEditedBy')
      .populate('author', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Content.countDocuments(filter);

    res.status(200).json({
      success: true,
      data: {
        configs: pageConfigs,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error) {
    console.error('❌ Get all page configs failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page configurations'
    });
  }
};
const deletePageConfig = async (req, res) => {
  try {
    const { pageName } = req.params;

    const pageConfig = await Content.findOneAndDelete({
      type: 'page_config',
      slug: pageName
    });

    if (!pageConfig) {
      return res.status(404).json({
        success: false,
        message: `Configuration for page '${pageName}' not found`
      });
    }

    res.status(200).json({
      success: true,
      message: `Configuration for '${pageName}' deleted successfully`
    });

  } catch (error) {
    console.error('❌ Delete page config failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete page configuration'
    });
  }
};
const getPageConfigHistory = async (req, res) => {
  try {
    const { pageName } = req.params;

    const pageConfig = await Content.findOne({
      type: 'page_config',
      slug: pageName
    }).populate('previousVersions.modifiedBy', 'name email');

    if (!pageConfig) {
      return res.status(404).json({
        success: false,
        message: `Configuration for page '${pageName}' not found`
      });
    }

    const history = pageConfig.previousVersions.map(version => ({
      version: version.version,
      modifiedBy: version.modifiedBy,
      modifiedAt: version.modifiedAt,
      changeLog: version.changeLog
    })).sort((a, b) => b.version - a.version);

    res.status(200).json({
      success: true,
      data: {
        pageName,
        currentVersion: pageConfig.version,
        history
      }
    });

  } catch (error) {
    console.error('❌ Get page config history failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page configuration history'
    });
  }
};

// @desc    Restore page configuration version
// @route   POST /api/page-config/:pageName/restore/:version
// @access  Private/Admin
const restorePageConfigVersion = async (req, res) => {
  try {
    const { pageName, version } = req.params;

    const pageConfig = await Content.findOne({
      type: 'page_config',
      slug: pageName
    });

    if (!pageConfig) {
      return res.status(404).json({
        success: false,
        message: `Configuration for page '${pageName}' not found`
      });
    }

    const targetVersion = pageConfig.previousVersions.find(v => v.version == version);
    if (!targetVersion) {
      return res.status(404).json({
        success: false,
        message: `Version ${version} not found`
      });
    }

    // Backup current version
    pageConfig.previousVersions.push({
      version: pageConfig.version,
      content: pageConfig.content,
      modifiedBy: req.admin._id,
      changeLog: `Restored from version ${version}`
    });

    // Restore target version
    pageConfig.content = targetVersion.content;
    pageConfig.version = pageConfig.version + 1;
    pageConfig.lastEditedBy = req.admin._id;

    await pageConfig.save();

    res.status(200).json({
      success: true,
      message: `Configuration restored to version ${version}`,
      data: {
        pageName,
        newVersion: pageConfig.version,
        restoredFrom: version
      }
    });

  } catch (error) {
    console.error('❌ Restore page config version failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to restore page configuration version'
    });
  }
};

const getPageConfigSchema = async (req, res) => {
  try {
    const { pageName } = req.params;
    
    // For now, return a simple response indicating schema generation should be done client-side
    // In the future, this could return predefined schemas for different page types
    res.status(200).json({
      success: true,
      data: {
        pageName,
        message: 'Schema generation handled client-side',
        schemaAvailable: false
      }
    });

  } catch (error) {
    console.error('❌ Get page config schema failed:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch page configuration schema'
    });
  }
};

module.exports = {
  getPageConfig,
  updatePageConfig,
  getAllPageConfigs,
  deletePageConfig,
  getPageConfigHistory,
  restorePageConfigVersion,
  getPageConfigSchema
};