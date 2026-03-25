const mongoose = require('mongoose');
const Content = require('./models/Content');
const ComplianceDocument = require('./models/ComplianceDocument');
const Admin = require('./models/Admin');
require('dotenv').config();

const connectDB = require('./config/database');

const seedCompliance = async () => {
  try {
    await connectDB();

    // Get an admin user for the 'author' and 'uploadedBy' fields
    const admin = await Admin.findOne();
    if (!admin) {
      console.error('❌ No admin found! Please run seedAdmin.js first.');
      process.exit(1);
    }

    // 1. Seed Page Config for Compliance
    const complianceConfig = {
      hero: {
        badge: "TRUST & ACCOUNTABILITY",
        title: "AUDIT &",
        titleHighlight: "COMPLIANCE",
        description: "Moksha Seva operates with 100% legal compliance and transparency. We are a registered trust with deep accountability to the law and our donors."
      },
      taxExemption: {
        title: "TAX",
        titleHighlight: "EXEMPTION",
        description: "All donations made to Moksha Seva Foundation are eligible for tax deduction under Section 80G of the Income Tax Act, 1961. We provide instant digital receipts for all contributions.",
        registrations: [
          { label: "NGO DARPAN ID", value: "UP/2023/0345678" },
          { label: "CSR REGISTRATION NO", value: "CSR00012345" }
        ],
        points: [
          "Ensures all funds are audited monthly.",
          "Guarantee that mission remains non-profit.",
          "Enables government tracking and safety.",
          "Builds permanent trust with the public."
        ]
      }
    };

    await Content.findOneAndUpdate(
      { slug: 'compliance', type: 'page_config' },
      {
        title: 'Compliance Page Configuration',
        slug: 'compliance',
        content: JSON.stringify(complianceConfig),
        type: 'page_config',
        category: 'configuration',
        status: 'published',
        author: admin._id,
        metaTitle: 'Compliance & Audit - Moksha Seva',
        metaDescription: 'Official legal documents and compliance certificates of Moksha Seva Foundation.'
      },
      { upsert: true, new: true }
    );
    console.log('✅ Compliance page config seeded.');

    // 2. Seed Compliance Documents
    const documents = [
      {
        title: "80G Tax Exemption Certificate",
        description: "Official certificate allowing donors to claim tax benefits.",
        fileUrl: "https://example.com/80g_certificate.pdf",
        fileSize: "1.2 MB",
        validityDate: "2024-2027",
        documentType: "certificate",
        order: 1,
        uploadedBy: admin._id
      },
      {
        title: "12A Registration Document",
        description: "Permanent registration under Section 12A of the IT Act.",
        fileUrl: "https://example.com/12a_document.pdf",
        fileSize: "0.8 MB",
        validityDate: "Permanent",
        documentType: "certificate",
        order: 2,
        uploadedBy: admin._id
      },
      {
        title: "Annual Audit Report 2023-24",
        description: "Complete financial audit report for the fiscal year.",
        fileUrl: "https://example.com/audit_report_2023.pdf",
        fileSize: "2.4 MB",
        validityDate: "June 2024",
        documentType: "report",
        order: 3,
        uploadedBy: admin._id
      },
      {
        title: "FCRA Compliance Certificate",
        description: "Registration for receiving foreign contributions.",
        fileUrl: "https://example.com/fcra_certificate.pdf",
        fileSize: "1.5 MB",
        validityDate: "Active",
        documentType: "certificate",
        order: 4,
        uploadedBy: admin._id
      },
      {
        title: "Trust Deed & Bylaws",
        description: "Founding governing documents of Moksha Seva Trust.",
        fileUrl: "https://example.com/trust_deed.pdf",
        fileSize: "3.1 MB",
        validityDate: "Updated 2023",
        documentType: "legal",
        order: 5,
        uploadedBy: admin._id
      },
      {
        title: "NITI Aayog NGO Darpan Profile",
        description: "Verified profile on the Government of India portal.",
        fileUrl: "https://example.com/ngodarpan_profile.pdf",
        fileSize: "0.5 MB",
        validityDate: "Verified",
        documentType: "legal",
        order: 6,
        uploadedBy: admin._id
      }
    ];

    // Clear existing documents to avoid duplicates during seed
    await ComplianceDocument.deleteMany({});
    await ComplianceDocument.insertMany(documents);
    console.log('✅ Compliance documents seeded.');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  }
};

seedCompliance();
