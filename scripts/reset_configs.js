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

const CLEAN_CONFIGS = {
  gallery: {
    hero: {
      badge: "Visual Archive",
      title: {
        line1: "Captured",
        line2: "Moments",
        line3: ""
      },
      description: "A curated collection of visual documentation showcasing our mission impact.",
      stats: {
        momentsCaptured: { number: "2.8K+", label: "Moments" },
        citiesDocumented: { number: "38+", label: "Cities" }
      }
    },
    gallery: {
      categories: ["All", "Services", "Community", "Events", "Volunteers"]
    },
    modal: {
      badge: "Verified Mission Data_",
      description: "Mission documentation from the Moksha Sewa Archive.",
      zoneLabel: "Operational Zone",
      dateLabel: "Deployment Date",
      returnButton: "Return to Archive Hub"
    }
  },
  press: {
    hero: {
      badge: "Official Media Syndicate . Prime",
      title: "GLOBAL",
      subtitle: "PRESS ROOM",
      description: "The centralized depository for authorized statements, media protocols, and official institutional announcements."
    },
    footer: {
      title: "REPOSITORY_ALPHA",
      protocolLabel: "PROTOCOL",
      categories: ["INTEGRITY", "JURISDICTION", "SYSTEM", "ACCESS"]
    }
  },
  documentaries: {
    hero: {
      badge: "Theatrical Collection . Prime",
      title: "CINEMA",
      subtitle: "MANIFESTO",
      description: "Documenting high-integrity narratives of human dignity and institutional impact across the globe."
    },
    footer: {
      title: "THEATER_OF_DIGNITY",
      hubLabel: "HUB",
      cities: ["VARANASI", "NEW DELHI", "NEW YORK", "GENEVA"]
    }
  },
  privacy: {
    hero: {
      badge: "LEGAL & TRUST",
      title: "PRIVACY",
      subtitle: "AND POLICY",
      description: "Our commitment to protecting your personal data and ensuring 100% transparency in our operations.",
      lastUpdated: "March 9, 2026"
    },
    trustIndicators: [
      { icon: "Shield", label: "DATA ENCRYPTED" },
      { icon: "CheckCircle", label: "GDPR COMPLIANT" },
      { icon: "Heart", label: "NO DATA SELLING" }
    ],
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
    },
    cta: {
      title: "Integrity Above All",
      description: "We are committed to the highest standards of financial and data integrity. Every donation is tracked and documented.",
      primaryButton: { text: "Donate Now", href: "/donate" },
      secondaryButton: { text: "Contact Compliance", href: "/contact" }
    }
  },
  terms: {
    hero: {
      badge: "LEGAL DOCUMENT",
      title: "Terms &",
      subtitle: "Conditions",
      description: "The legal framework governing your interaction with Moksha Sewa platform.",
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
    },
    cta: {
      title: "Building Trust Together",
      description: "Clear terms ensure a transparent relationship between our donors and the mission.",
      primaryButton: { text: "Learn More", href: "/about" }
    }
  },
  refund: {
    hero: {
      badge: "FINANCIAL POLICY",
      title: "Refund &",
      subtitle: "Cancellation",
      description: "Complete information about donation refunds, cancellations, and our commitment to absolute transparency.",
      lastUpdated: "March 9, 2026"
    },
    trustIndicators: [
      { icon: "CheckCircle", label: "REFUND WINDOW: 7 DAYS" },
      { icon: "Clock", label: "PROCESSING: 5-7 DAYS" },
      { icon: "Shield", label: "100% TRANSPARENT" }
    ],
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
    },
    cta: {
      title: "Honoring Every Contribution",
      description: "Your donation directly supports dignified last rites for unclaimed souls. Together, we ensure no one is forgotten.",
      primaryButton: { text: "Make a Donation", href: "/donate" },
      secondaryButton: { text: "Contact Support", href: "/contact" }
    }
  },
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
    trustSignals: [
      "80G Tax Exempt",
      "Secure Payments",
      "Public Documentation",
      "Verified Impact"
    ],
    amountSelection: {
      title: "Select Donation Amount",
      subtitle: "Choose an amount that fits your budget. Every rupee helps.",
      customAmountLabel: "Or Enter Custom Amount",
      customAmountPlaceholder: "Enter amount (min ₹100)"
    },
    donationTiers: [
      { amount: 500, label: "One Soul", desc: "Covers complete costs for one dignified cremation." },
      { amount: 2500, label: "Community", desc: "Supports dignified rites for 5 families." },
      { amount: 5000, label: "City Impact", desc: "Ensures mission stability in one district." },
      { amount: 10000, label: "Sacred Guardian", desc: "Supports operational costs for one mission center." }
    ],
    form: {
      title: "Donor Information",
      subtitle: "Please provide your details for 80G tax benefits and documentation.",
      sections: {
        personalInfo: {
          title: "Personal Information",
          fields: {
            fullName: { label: "Full Name", placeholder: "As per PAN card" },
            email: { label: "Email Address", placeholder: "For donation receipt" },
            phone: { label: "Phone Number", placeholder: "WhatsApp number preferred" }
          }
        },
        address: {
          title: "Address for 80G Receipt",
          fields: {
            address: { label: "Mailing Address", placeholder: "Full address for tax receipt" },
            city: { label: "City", placeholder: "Your city" },
            pincode: { label: "Pincode", placeholder: "6-digit code" },
            state: { label: "State", placeholder: "Select state" }
          }
        },
        taxDetails: {
          title: "Tax Details (Optional)",
          fields: {
            panNumber: { label: "PAN Number", placeholder: "Required for 80G receipt" },
            note: "Required for 80G compliance"
          }
        },
        preferences: {
          title: "Donation Purpose",
          frequency: {
            label: "Frequency",
            types: [
              { label: "One-Time", value: "one-time" },
              { label: "Monthly", value: "monthly" },
              { label: "Yearly", value: "yearly" }
            ]
          },
          purpose: {
            label: "Purpose",
            options: [
              { label: "General Donation", value: "general" },
              { label: "Unclaimed Bodies Cremation", value: "cremation" },
              { label: "Ambulance Support", value: "ambulance" },
              { label: "Emergency Relief", value: "emergency" }
            ]
          }
        }
      },
      preferences: {
        anonymous: "Make this donation anonymous",
        taxReceipt: "I need an 80G tax receipt",
        terms: { text: "I agree to the", link: "/legal/terms", linkText: "Terms & Conditions" },
        refund: { text: "I accept the", link: "/donate/refund-policy", linkText: "Refund Policy" }
      },
      buttonText: "DONATE {amount} NOW",
      secureLabel: "SECURE SSL ENCRYPTION",
      taxLabel: "80G TAX EXEMPTION"
    },
    success: {
      title: "Thank You for Your Generosity",
      message: "Your donation of {amount} has been received. Thank you for helping us provide a dignified farewell to those in need.",
      receiptNote: "Your 80G Tax Receipt has been emailed to you.",
      fallbackAmount: "₹500",
      homeButton: "Back to Home"
    },
    validation: {
      minAmount: "Please select or enter a donation amount (minimum ₹100)",
      requiredFields: "Please fill in all required fields",
      agreeTerms: "Please agree to the terms and conditions"
    },
    states: [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
      "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
      "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
      "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Puducherry", "Chandigarh", "Ladakh",
      "Jammu & Kashmir", "Dadra and Nagar Haveli & Daman and Diu", "Andaman and Nicobar Islands", "Lakshadweep"
    ]
  }
};

async function resetConfigs() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    const AdminSchema = new mongoose.Schema({}, { strict: false });
    const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema, 'admins');
    const defaultAdmin = await Admin.findOne({ role: 'super_admin' });

    if (!defaultAdmin) {
      console.error('❌ CRITICAL: No Super Admin found in database. Seeding without author (will require manual repair in Editorial Hub).');
    }

    for (const [slug, config] of Object.entries(CLEAN_CONFIGS)) {
      const configString = JSON.stringify(config, null, 2);

      const updateFields = {
        content: configString,
        version: 1,
        status: 'published',
        title: `${slug.charAt(0).toUpperCase() + slug.slice(1)} Page Configuration`,
        category: 'configuration'
      };

      if (defaultAdmin) {
        updateFields.author = defaultAdmin._id;
      }

      const result = await Content.findOneAndUpdate(
        { type: 'page_config', slug: slug },
        { $set: updateFields },
        { upsert: true, new: true }
      );

      console.log(`✅ RESET: ${slug} (ID: ${result._id})`);
    }

    await mongoose.disconnect();
  } catch (err) {
    console.error('ERROR:', err);
  }
}

resetConfigs();
