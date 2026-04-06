require('dotenv').config();
const mongoose = require('mongoose');
const Content = require('./models/Content');

const addSOPToNavbar = async () => {
    try {
        console.log('🚀 INITIATING NAVBAR SYNCHRONIZATION...');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moksha_seva');
        console.log('📦 DATABASE CONNECTED');

        const layoutConfig = await Content.findOne({ slug: 'layout', type: 'page_config' });

        if (!layoutConfig) {
            console.error('❌ ERROR: LAYOUT CONFIGURATION NOT FOUND.');
            process.exit(1);
        }

        let config = JSON.parse(layoutConfig.content);

        // Find Services section in Navigation
        const servicesNav = config.navbar.navigation.find(item => item.label === 'Services');

        if (servicesNav) {
            // Check if already exists to prevent duplication
            const exists = servicesNav.subLinks.find(link => link.href === '/services/sop');

            if (!exists) {
                servicesNav.subLinks.push({
                    href: '/services/sop',
                    label: 'SOP Manuals',
                    icon: 'BookOpen'
                });
                console.log('✅ SOP MANUALS LINK ADDED TO SERVICES SUB-NAVIGATION.');
            } else {
                console.log('➖ SOP MANUALS LINK ALREADY EXISTS IN NAVIGATION.');
            }
        } else {
            console.error('❌ ERROR: SERVICES NAVIGATION SECTION NOT FOUND.');
            process.exit(1);
        }

        // Also add to Footer if needed (Footer -> Mission)
        const missionLinks = config.footer.links.Mission;
        if (missionLinks) {
            const footerExists = missionLinks.find(link => link.href === '/services/sop');
            if (!footerExists) {
                missionLinks.push({ label: 'SOP Manuals', href: '/services/sop' });
                console.log('✅ SOP MANUALS LINK ADDED TO FOOTER.');
            }
        }

        layoutConfig.content = JSON.stringify(config, null, 2);
        await layoutConfig.save();

        console.log('🏆 NAVBAR SYNCHRONIZATION COMPLETE');
        process.exit(0);

    } catch (error) {
        console.error('❌ SYNCHRONIZATION FAILED:', error);
        process.exit(1);
    }
};

addSOPToNavbar();
