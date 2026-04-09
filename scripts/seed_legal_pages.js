const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const ContentSchema = new mongoose.Schema({
    type: String,
    slug: String,
    content: String,
    version: Number,
    status: String,
    title: String,
    category: String,
    metaTitle: String,
    metaDescription: String
}, { strict: false });

const Content = mongoose.models.Content || mongoose.model('Content', ContentSchema, 'contents');

const NEW_PAGE_CONFIGS = {
  donate: {
    hero: {
      badge: { icon: "Heart", text: "Every Life Deserves Dignity" },
      title: { line1: "Your", line2: "Compassion", line3: "Changes Lives" },
      subtitle: "Just ₹500 provides a complete dignified cremation service. Your donation ensures no soul is forgotten, regardless of their circumstances.",
      impactStats: [
        { value: "15,000+", label: "Lives Honored" },
        { value: "50+", label: "Cities Served" },
        { value: "100%", label: "Transparency" }
      ],
      ctaButtons: { primary: "Donate Now", secondary: "See Our Impact" },
      startingAmount: "Starting ₹500"
    },
    success: {
      title: "Thank You for Your Generosity",
      message: "Your donation of {amount} has been received. Thank you for helping us provide a dignified farewell to those in need.",
      receiptNote: "Your 80G Tax Receipt has been emailed to you.",
      fallbackAmount: "₹500"
    },
    validation: {
        minAmount: "Please select or enter a donation amount (minimum ₹100)",
        requiredFields: "Please fill in all required fields",
        agreeTerms: "Please agree to the terms and conditions"
    }
  },
  privacy: {
    hero: {
        badge: "LEGAL & TRUST",
        title: "PRIVACY",
        subtitle: "AND POLICY",
        lastUpdated: "March 2024"
    },
    sections: [
        {
            title: "Data Collection",
            icon: "Eye",
            content: "We collect only the most essential information required to fulfill our mission. This includes contact details provided during donation, volunteer registration, or while reporting an unclaimed body. We do not sell or trade your personal data with third-party commercial entities."
        },
        {
            title: "How We Use Data",
            icon: "FileText",
            content: "Information collected is used strictly for operational purposes: verifying reports, processing donations, issuing tax-exemption certificates (80G), and maintaining the Wall of Remembrance. Your data helps us maintain absolute transparency in our audit trails."
        },
        {
            title: "Security Measures",
            icon: "Lock",
            content: "We employ industry-standard encryption and secure server protocols to protect your sensitive information. Our 'Transparency Dashboard' anonymizes sensitive personal data while still providing public accountability for our mission's impact."
        }
    ],
    sidebar: {
        title: "Institutional Trust",
        content: "Our legal framework is built to ensure that every rupee spent and every soul served is accounted for in the public interest.",
        buttonText: "Read Compliance",
        buttonHref: "/compliance",
        icon: "Shield"
    },
    footer: {
        title: "Grievance Officer",
        content: "If you have any concerns regarding your data, contact our Nodal Officer.",
        contactEmail: "help@mokshasewa.org"
    }
  },
  terms: {
    hero: {
        badge: "LEGAL DOCUMENT",
        title: "Terms &",
        subtitle: "Conditions",
        lastUpdated: "March 9, 2026"
    },
    sections: [
        {
            title: "1. Introduction",
            content: "Welcome to Moksha Sewa. These Terms and Conditions ('Terms') govern your use of our website, services, and any donations made to our organization. By accessing our website or making a donation, you agree to be bound by these Terms."
        },
        {
            title: "2. Acceptance of Terms",
            content: "By using our website, making a donation, or engaging with our services, you acknowledge that you have read and understood these Terms, agree to comply with all applicable laws, and are at least 18 years of age or have parental consent."
        },
        {
            title: "3. Donations",
            content: "All donations are voluntary and non-refundable except as specified in our Refund Policy. Donations are eligible for 80G tax exemption. Funds will be used for cremation services, ambulance operations, and administrative costs."
        }
    ],
    footer: {
        title: "Contact Information",
        content: "If you have any questions about these Terms & Conditions, please contact us.",
        contactEmail: "info@mokshasewa.org"
    }
  },
  refund: {
    hero: {
        badge: "FINANCIAL POLICY",
        title: "Refund &",
        subtitle: "Cancellation",
        lastUpdated: "March 9, 2026"
    },
    sections: [
        {
            title: "1. Donation Refunds",
            content: "Moksha Sewa takes the utmost care to process donations as per the instructions given by our donors. However, if a donation has been made erroneously, please contact us within 7 days. Refunds will be considered on a case-by-case basis."
        },
        {
            title: "2. Missing 80G Certificates",
            content: "If you have not received your 80G tax exemption certificate within 48 hours of donation, please contact our support team with your transaction details. We will reissue the certificate immediately."
        }
    ],
    footer: {
        title: "Accounts Department",
        content: "For refund-related queries, please email our financial nodal office.",
        contactEmail: "accounts@mokshasewa.org"
    }
  }
};

async function seed() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        for (const [slug, config] of Object.entries(NEW_PAGE_CONFIGS)) {
            const configString = JSON.stringify(config, null, 2);
            
            await Content.deleteMany({ type: 'page_config', slug: slug });
            
            const result = await Content.create({ 
                type: 'page_config', 
                slug: slug,
                content: configString,
                version: 1,
                status: 'published',
                title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Page Configuration`,
                category: 'configuration'
            });

            console.log(`✅ SEEDED: ${slug} (ID: ${result._id})`);
        }

        await mongoose.disconnect();
        console.log('Seed completed successfully');
    } catch (err) {
        console.error('ERROR:', err);
    }
}

seed();
