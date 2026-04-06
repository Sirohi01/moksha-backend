require('dotenv').config();
const mongoose = require('mongoose');
const SOP = require('./models/SOP');
const Admin = require('./models/Admin');

const seedSOPs = async () => {
    try {
        console.log('🚀 INITIALIZING SOP SYNCHRONIZATION...');

        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/moksha_seva');
        console.log('📦 DATABASE CONNECTED');

        const admin = await Admin.findOne({ role: 'super_admin' });
        if (!admin) {
            console.error('❌ CRITICAL ERROR: NO SUPER_ADMIN DETECTED. ABORTING SEED.');
            process.exit(1);
        }

        const sampleSOPs = [
            {
                title: 'MCD Clearance Protocol',
                slug: 'mcd-clearance-protocol',
                category: 'MCD',
                description: 'Standard procedure for obtaining municipal clearance for final rites across Delhi-NCR.',
                content: `
                    <h2><strong>1. CORE OBJECTIVE</strong></h2>
                    <p>To ensure 100% compliance with Municipal Corporation of Delhi (MCD) regulations for the respectful storage and transition of mortal remains.</p>
                    
                    <h2><strong>2. REQUIRED DOCUMENTATION</strong></h2>
                    <ul>
                        <li><strong>Identified ID:</strong> Aadhar Card or Voter ID of the deceased.</li>
                        <li><strong>Medical Certificate:</strong> Form 4 (Hospital) or Form 4A (Residential) signed by a registered medical practitioner.</li>
                        <li><strong>Applicant ID:</strong> Identity proof of the primary applicant (Next of Kin).</li>
                    </ul>

                    <h2><strong>3. OPERATIONAL STEPS</strong></h2>
                    <ol>
                        <li>Log into the MCD Online Portal or visit the Zonal Office.</li>
                        <li>Upload digital copies of medical certification.</li>
                        <li>Pay the statutory fee (if applicable) and obtain the digital clearance slip.</li>
                        <li>Coordinate with the Moksha Ambulance node for physical transit.</li>
                    </ol>

                    <p><em>Note: For late-night operations, contact the 24/7 Zonal Helpline directly.</em></p>
                `,
                status: 'published',
                isCritical: true,
                author: admin._id
            },
            {
                title: 'Ambulance Transit Safety',
                slug: 'ambulance-transit-safety',
                category: 'Ambulance',
                description: 'Tactical guidelines for ambulance personnel during high-traffic transit periods.',
                content: `
                    <h2><strong>1. VEHICLE READINESS</strong></h2>
                    <p>All ambulances must undergo a 15-point diagnostic check before every deployment to ensure zero failure during transit.</p>
                    
                    <h2><strong>2. PATIENT/REMAINS HANDLING</strong></h2>
                    <p>Use specialized hydraulic stretchers for safe transfer. Ensure high-fidelity cooling systems are active for distances exceeding 15km.</p>

                    <h2><strong>3. COMMUNICATION PROTOCOL</strong></h2>
                    <ul>
                        <li>Constant synchronization with the Moksha Command Hub.</li>
                        <li>Real-time traffic analysis using established GPS nodes.</li>
                        <li>Immediate reporting of any operational delays or route diversions.</li>
                    </ul>
                `,
                status: 'published',
                isCritical: false,
                author: admin._id
            }
        ];
        for (const sop of sampleSOPs) {
            const exists = await SOP.findOne({ slug: sop.slug });
            if (!exists) {
                await SOP.create(sop);
                console.log(`✅ PROTOCOL ESTABLISHED: ${sop.title}`);
            } else {
                console.log(`➖ PROTOCOL ALREADY ACTIVE: ${sop.title}`);
            }
        }

        console.log('🏆 SOP SYNCHRONIZATION COMPLETE');
        process.exit(0);

    } catch (error) {
        console.error('❌ SYNCHRONIZATION FAILED:', error);
        process.exit(1);
    }
};

seedSOPs();
