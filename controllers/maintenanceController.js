const { exec } = require('child_process');
const path = require('path');
const ActivityLog = require('../models/ActivityLog');
const ALLOWED_SCRIPTS = {
    // CONTENT & DATA SYNC
    'reset_configs': {
        path: 'scripts/reset_configs.js',
        type: 'data',
        label: 'Reset Gallery Configs (IMP)',
        description: 'Purges legacy JSON bloat from Gallery/Press/Docu pages and resets to modern schema.'
    },
    'reset_blogs': {
        path: 'scripts/reset_blog_config.js',
        type: 'data',
        label: 'Reset Blog Config (IMP)',
        description: 'Synchronizes blog editorial structure with the latest frontend design tokens.'
    },
    'seed_page_configs': {
        path: 'seedPageConfigs.js',
        type: 'data',
        label: 'Seed All Page Configs',
        description: 'Initializes default content and visuals for all system page registries.'
    },
    'seed_seo': {
        path: 'seedSEO.js',
        type: 'data',
        label: 'Seed SEO Registry',
        description: 'Populates meta tags and indexing protocols across the public site.'
    },
    'seed_sops': {
        path: 'seedSOP.js',
        type: 'data',
        label: 'Sync SOP Protocols (IMP)',
        description: 'Synchronizes mission-critical operational manuals (MCD, Ambulance, Transit) with the production registry.'
    },
    'sync_sop_navbar': {
        path: 'addSOPToNavbar.js',
        type: 'data',
        label: 'Sync SOP to Navbar (IMP)',
        description: 'Patches the public-side navigation and footer manifold to include the mission-critical SOP Manuals link.'
    },
    'seed_legal_pages': {
        path: 'scripts/seed_legal_pages.js',
        type: 'data',
        label: 'Seed Legal Pages (Privacy/Terms)',
        description: 'Initializes the dynamic configurations for Privacy Policy, Terms & Conditions, and Refund Policy.'
    },
    'clean_activity_logs': {
        path: 'utils/cleanupLogs.js',
        type: 'security',
        label: 'Purge Security Logs',
        description: 'Optimizes database by deleting audit and activity logs older than 30 days.'
    },

    // DIAGNOSTICS & SYSTEM TESTS
    'run_all_tests': {
        path: 'npm test',
        type: 'diagnostics',
        label: 'Execute Full Suite',
        description: 'Runs the entire Jest testing cluster to verify system integrity.'
    },
    'test_api_connection': { path: 'test-api-connection.js', type: 'diagnostics', label: 'API Connection', description: 'Basic endpoint Ping/Pong test.' },
    'test_admin_pages': { path: 'test-admin-pages.js', type: 'diagnostics', label: 'Admin Access Test', description: 'Verifies authorization flows for admin routes.' },
    'test_board': { path: 'test-board.js', type: 'diagnostics', label: 'Board Module Test', description: 'Validates board applications and recruitment logic.' },
    'test_contact': { path: 'test-contact.js', type: 'diagnostics', label: 'Contact CRM Test', description: 'Verifies lead generation and contact form processing.' },
    'test_content_editor': { path: 'test-content-editor.js', type: 'diagnostics', label: 'Content Editor Test', description: 'Stresses the dynamic JSON content saving mechanism.' },
    'test_corporate': { path: 'test-corporate.js', type: 'diagnostics', label: 'Corporate Module', description: 'Tests B2B and partnership application flows.' },
    'test_documentaries': { path: 'test-documentaries.js', type: 'diagnostics', label: 'Video Archive Test', description: 'Verifies metadata and streaming links for documentaries.' },
    'test_email': { path: 'test-email.js', type: 'diagnostics', label: 'Email SMTP Test', description: 'Verifies Nodemailer and transactional email delivery.' },
    'test_feedback': { path: 'test-feedback.js', type: 'diagnostics', label: 'Feedback Loop Test', description: 'Validates user submission and sentiment capture.' },
    'test_gallery': { path: 'test-gallery.js', type: 'diagnostics', label: 'Gallery Asset Test', description: 'Tests Cloudinary image retrieval and transformation.' },
    'test_reach': { path: 'test-our-reach.js', type: 'diagnostics', label: 'Geographical Reach', description: 'Verifies impact mapping and district-level data.' },
    'test_press': { path: 'test-press.js', type: 'diagnostics', label: 'Press Release Test', description: 'Validates automated editorial and newsroom outputs.' },
    'test_schemes': { path: 'test-schemes.js', type: 'diagnostics', label: 'Govt Schemes Test', description: 'Verifies application logic for welfare programs.' },
    'test_services': { path: 'test-services.js', type: 'diagnostics', label: 'Services Logic', description: 'Tests core service delivery and scheduling modules.' },
    'test_stories': { path: 'test-stories.js', type: 'diagnostics', label: 'Impact Stories', description: 'Verifies blog-style impact narrative storage.' },
    'test_volunteers': { path: 'test-volunteer.js', type: 'diagnostics', label: 'Volunteer Registry', description: 'tests on-boarding and background check status logic.' },
    'test_api_v2': { path: 'testAPI.js', type: 'diagnostics', label: 'API v2 Integrity', description: 'Comprehensive swagger-aligned API endpoint test.' },
    'test_cloudinary': { path: 'testCloudinary.js', type: 'diagnostics', label: 'Cloudinary Handshake', description: 'Direct verification of asset cloud connection.' },
    'test_login_flow': { path: 'testLogin.js', type: 'diagnostics', label: 'Authentication Flow', description: 'Security test for JWT and login/logout handshakes.' },
    'test_phase_5': { path: 'testPhase5.js', type: 'diagnostics', label: 'Phase 5 Deployment', description: 'Final staging integration test for latest features.' },

    // INTELLIGENCE & DOCUMENTATION
    'generate_postman': {
        path: 'generatePostman.js',
        type: 'intelligence',
        label: 'Rebuild API Docs',
        description: 'Synchronizes Swagger/Postman documentation with the latest route changes.'
    }
};

exports.runMaintenanceScript = async (req, res) => {
    try {
        const { scriptKey } = req.body;
        const scriptDef = ALLOWED_SCRIPTS[scriptKey];

        if (!scriptKey || !scriptDef) {
            return res.status(400).json({
                success: false,
                message: 'Unauthorized or invalid script identifier'
            });
        }

        const scriptValue = scriptDef.path;
        const isSystemCommand = scriptValue.startsWith('npm') || scriptValue.startsWith('jest');
        const command = isSystemCommand
            ? scriptValue
            : `node ${path.join(__dirname, '../', scriptValue)}`;

        console.log(`🚀 RUNNING MAINTENANCE SCRIPT: ${scriptKey} via [${command}]`);

        // Execute the script
        exec(command, async (error, stdout, stderr) => {
            if (error) {
                console.error(`❌ SCRIPT ERROR: ${error.message}`);
                return res.status(500).json({
                    success: false,
                    message: 'Script failed during execution',
                    error: error.message
                });
            }
            await ActivityLog.create({
                userId: req.admin._id,
                userEmail: req.admin.email,
                userRole: req.admin.role,
                action: 'system_maintenance',
                targetType: 'system',
                description: `Executed maintenance: ${scriptDef.label}`,
                status: 'success',
                ipAddress: req.ip,
                method: 'POST',
                endpoint: req.originalUrl
            });

            res.status(200).json({
                success: true,
                message: `Protocol '${scriptDef.label}' finalized`,
                output: stdout
            });
        });

    } catch (error) {
        console.error('❌ Maintenance Controller Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error while running maintenance script'
        });
    }
};

exports.getScriptsStatus = (req, res) => {
    res.status(200).json({
        success: true,
        scripts: Object.keys(ALLOWED_SCRIPTS).map(key => ({
            id: key,
            ...ALLOWED_SCRIPTS[key]
        }))
    });
};

exports.runCustomCommand = async (req, res) => {
    try {
        const { command } = req.body;

        if (!command) {
            return res.status(400).json({
                success: false,
                message: 'Manual command sequence required'
            });
        }

        console.log(`📡 MANUAL OVERRIDE INITIATED: [${command}]`);

        // Execute the manual command
        exec(command, async (error, stdout, stderr) => {
            const status = error ? 'failed' : 'success';
            const logDescription = `Executed manual command: ${command.substring(0, 50)}${command.length > 50 ? '...' : ''}`;

            await ActivityLog.create({
                userId: req.admin._id,
                userEmail: req.admin.email,
                userRole: req.admin.role,
                action: 'system_maintenance',
                targetType: 'system',
                description: logDescription,
                status: status,
                ipAddress: req.ip,
                method: 'POST',
                endpoint: req.originalUrl,
                metadata: { command, error: error?.message }
            });

            if (error) {
                return res.status(500).json({
                    success: false,
                    message: 'Manual protocol failed',
                    error: error.message
                });
            }

            res.status(200).json({
                success: true,
                message: 'Manual protocol finalized',
                output: stdout
            });
        });

    } catch (error) {
        console.error('❌ Manual Override Error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server failure during manual override'
        });
    }
};
