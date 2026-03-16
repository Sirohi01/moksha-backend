const mongoose = require('mongoose');
const Content = require('./models/Content');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/database');
const readConfigFile = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    let cleanContent = content
      .replace(/import.*from.*['"];?\n/g, '')
      .replace(/export\s+(const|default).*=/g, 'const config =')
      .replace(/export\s+default.*;\s*$/g, '')
      .replace(/;\s*$/, '');
    const configMatch = cleanContent.match(/const\s+\w+Config\s*:\s*\w+\s*=\s*({[\s\S]*});?$/);
    if (configMatch) {
      let configStr = configMatch[1];
      configStr = configStr
        .replace(/(\w+):/g, '"$1":') 
        .replace(/'/g, '"')           // Replace single quotes with double quotes
        .replace(/,(\s*[}\]])/g, '$1'); // Remove trailing commas
      
      return JSON.parse(configStr);
    }
    
    return null;
  } catch (error) {
    console.error(`Error reading config file ${filePath}:`, error.message);
    return null;
  }
};

// Page configurations to seed
const pageConfigs = [
  {
    pageName: 'homepage',
    configPath: '../frontend/config/homepage.config.ts'
  },
  {
    pageName: 'about',
    configPath: '../frontend/config/about.config.ts'
  },
  {
    pageName: 'how-it-works',
    configPath: '../frontend/config/how-it-works.config.ts'
  },
  {
    pageName: 'why-moksha-seva',
    configPath: '../frontend/config/why-moksha-seva.config.ts'
  },
  {
    pageName: 'our-reach',
    configPath: '../frontend/config/our-reach.config.ts'
  },
  {
    pageName: 'board',
    configPath: '../frontend/config/board.config.ts'
  },
  {
    pageName: 'services',
    configPath: '../frontend/config/services.config.ts'
  },
  {
    pageName: 'report',
    configPath: '../frontend/config/report.config.ts'
  },
  {
    pageName: 'impact',
    configPath: '../frontend/config/impact.config.ts'
  },
  {
    pageName: 'stories',
    configPath: '../frontend/config/stories.config.ts'
  }
];
// Sample configurations (since reading TS files is complex, we'll use JSON directly)
const sampleConfigs = {
  homepage: {
    hero: {
      slides: [
        "/gallery/image1.png",
        "/gallery/image02.png",
        "/gallery/image03.png",
        "/gallery/image2.png",
        "/gallery/image3.png",
        "/gallery/image6.png"
      ],
      autoSlideInterval: 5000
    },
    actionBanner: {
      title: "Free Sacred Rites for Unclaimed Souls • Dignity for the Forgotten",
      buttons: [
        {
          text: "Report a Case",
          href: "/report",
          variant: "primary"
        },
        {
          text: "Donate Now",
          href: "/donate",
          variant: "secondary"
        }
      ]
    },
    about: {
      badge: "About Moksha Seva",
      title: "Restoring Dignity to the",
      titleHighlight: "Final Journey",
      description: "Moksha Seva is dedicated to ensuring that no soul departs this world without the sacred rites and dignity they deserve.",
      stats: [
        { number: "5000+", label: "Souls Served" },
        { number: "38+", label: "Cities" },
        { number: "24/7", label: "Service" }
      ],
      buttons: [
        {
          text: "Learn More",
          href: "/about",
          variant: "primary"
        },
        {
          text: "Join Our Mission",
          href: "/volunteer",
          variant: "ghost"
        }
      ],
      image: "/gallery/image001.png"
    },
    ourSeva: {
      badge: "Our Sacred Services",
      title: "Our Seva",
      description: "We provide comprehensive support with compassion and dignity, ensuring every soul receives the respect they deserve in their final journey.",
      programmes: [
        {
          title: "Final Journey",
          icon: "Heart",
          description: "Providing dignified transportation and sacred final rites for unclaimed souls with complete respect and traditional ceremonies.",
          image: "/gallery/image001.png",
          href: "/services"
        },
        {
          title: "Compassionate Care",
          icon: "Heart",
          description: "Supporting families in need with emotional, logistical and financial assistance during their most difficult times.",
          image: "/gallery/image002.png",
          href: "/services"
        },
        {
          title: "Community Outreach",
          icon: "Users",
          description: "Educating communities about dignity in death and building awareness for those who have no one to care.",
          image: "/gallery/image003.png",
          href: "/services"
        },
        {
          title: "Sacred Documentation",
          icon: "FileText",
          description: "Maintaining proper records and ensuring legal compliance while honoring the memory of every soul we serve.",
          image: "/gallery/image004.png",
          href: "/services"
        }
      ]
    },
    joinMission: {
      badge: "MISSION SAATHI PORTAL",
      title: "STAND WITH US",
      titleHighlight: "IN THE FINAL JOURNEY",
      description: "Whether you have an hour a week or a lifetime to give, your presence can bring dignity to a soul forgotten by the world. Join our specialized hubs in 38+ cities.",
      backgroundImage: "/gallery/image4.png",
      buttons: [
        {
          text: "JOIN OUR FORCE",
          href: "/volunteer",
          variant: "primary"
        },
        {
          text: "VIEW OPPORTUNITIES",
          href: "/contact",
          variant: "secondary"
        }
      ],
      stats: [
        { number: "5000+", label: "SOULS SERVED" },
        { number: "38+", label: "CITIES ACTIVE" },
        { number: "24/7", label: "EMERGENCY RESPONSE" }
      ]
    },
    urgentCampaigns: {
      badge: "Active Missions",
      title: "Urgent Campaigns",
      description: "Support our sacred missions across India",
      campaigns: [
        {
          title: "KASHI GHAT MISSION",
          description: "Revitalizing the final rites facilities at the sacred Manikarnika Ghat.",
          targeted: "₹5,00,000",
          raised: "₹3,20,000",
          percentage: "64%",
          image: "/gallery/image1.png"
        },
        {
          title: "NEW ANTIM YATRA VAN",
          description: "Aiding the purchase of a specialized mobile unit for the Delhi-NCR hub.",
          targeted: "₹12,00,000",
          raised: "₹7,80,000",
          percentage: "65%",
          image: "/gallery/hero_moksha_1.png"
        },
        {
          title: "SACRED OIL FUND",
          description: "Ensuring a steady supply of traditional oils and materials for unclaimed rites.",
          targeted: "₹1,00,000",
          raised: "₹85,000",
          percentage: "85%",
          image: "/gallery/gallery_peaceful_departure_1772861335733.png"
        }
      ],
      autoSlideInterval: 6000,
      labels: {
        activeCampaign: "Active Campaign",
        raised: "Raised: ",
        donateNow: "Donate Now",
        viewCampaign: "View Campaign"
      }
    },
    transparency: {
      title: "TRANSPARENCY",
      titleHighlight: "IS OUR SANCTITY",
      description: "Every rupee donated to Moksha Seva is a sacred trust. We maintain 100% visibility on all our mission operational costs and final rites expenditures.",
      stats: [
        { label: "Direct Mission Costs", percentage: "82%" },
        { label: "Service Maintenance", percentage: "12%" },
        { label: "Administrative Support", percentage: "6%" }
      ],
      trustSection: {
        title: "YOUR TRUST MATTERS",
        description: "We are committed to the values of absolute accountability as established by our founding charter.",
        badges: [
          { text: "80G", subtext: "TAX EXEMPT READY", color: "text-[#f4c430]" },
          { text: "100%", subtext: "MISSION FOCUSED", color: "text-orange-600" }
        ]
      }
    },
    labels: {
      heroAltText: "Moksha Seva - Dignified Final Journey",
      learnMore: "Learn More",
      joinMissionAltText: "Join Our Mission"
    },
    missionPillars: {
      badge: "Core Values",
      title: "Mission Pillars",
      description: "Five sacred principles guiding our mission",
      pillars: [
        { title: "Final Dignity", icon: "Heart", number: "01" },
        { title: "Sacred Rites", icon: "Flame", number: "02" },
        { title: "Restoring Humanity", icon: "Users", number: "03" },
        { title: "Legal Sanctity", icon: "ShieldCheck", number: "04" },
        { title: "Mission Unity", icon: "Handshake", number: "05" }
      ],
      bottomStatement: "United in Service, Guided by Compassion"
    },
    storiesInMotion: {
      title: "STORIES IN MOTION",
      stories: [
        { image: "/gallery/image005.png", title: "SACRED KASHI RITES" },
        { image: "/gallery/image006.png", title: "MISSION PRAYAGRAJ" },
        { image: "/gallery/image007.png", title: "FINAL JOURNEY" },
        { image: "/gallery/image008.png", title: "AMBULANCE SERVICE" },
        { image: "/gallery/image009.png", title: "DIGNIFIED FAREWELL" }
      ]
    },
    sacredJourney: {
      badge: "THE CHRONICLE",
      title: "OUR SACRED JOURNEY",
      timeline: [
        {
          year: "2018",
          event: "Mission started in a single city with 1 volunteer.",
          icon: "Star",
          description: "A humble beginning focused on the unclaimed souls of a single city hub."
        },
        {
          year: "2020",
          event: "Reached the milestone of 500+ dignified cremations.",
          icon: "Heart",
          description: "Establishing ourselves as a beacon of hope for the destitute during times of loss."
        },
        {
          year: "2023",
          event: "Expanded to 30+ cities across Northern India.",
          icon: "Globe",
          description: "Scaling our specialized mobile units to serve a wider humanitarian landscape."
        },
        {
          year: "2026",
          event: "Operating in 38 cities with 400+ active volunteers.",
          icon: "Users",
          description: "A national force for terminal dignity, powered by thousands of supporters."
        }
      ]
    },
    mediaRecognition: {
      badge: "IN NATIONAL MEDIA",
      logos: ["TIMES OF INDIA", "DAINIK BHASKAR", "AAJ TAK", "NDTV", "HINDUSTAN TIMES"]
    },
    testimonials: {
      badge: "WHISPERED VOICES",
      slides: [
        {
          quote: "Moksha Seva provided a dignified farewell when we had no one else to turn to.",
          author: "Rajesh K., Beneficiary"
        },
        {
          quote: "Their dedication to the sacred rites of unclaimed souls is truly divine work.",
          author: "Pritam S., Local Partner"
        },
        {
          quote: "A world-class organization that treats every human being with ultimate respect.",
          author: "Anita D., Volunteer"
        }
      ],
      autoSlideInterval: 6000
    },
    governmentPartners: {
      title: "GOVERNMENT & INSTITUTIONAL PARTNERS",
      partners: [
        { name: "MCG", label: "MUNICIPAL CORPORATION" },
        { name: "UP GOVT", label: "DEPARTMENT OF HEALTH" },
        { name: "DELHI POLICE", label: "INSTITUTIONAL PARTNER" },
        { name: "NRHM", label: "NATIONAL HEALTH MISSION" }
      ]
    },
    faq: {
      title: "FREQUENT QUESTIONS",
      questions: [
        {
          question: "HOW ARE CASES REPORTED?",
          answer: "Our 24/7 mission helpline receives calls from police departments, hospitals, and kind-hearted citizens."
        },
        {
          question: "ARE TRADITIONAL RITES FOLLOWED?",
          answer: "Yes. Every 'Antyesti' is performed strictly according to sacred Hindu traditions by our staff priests."
        },
        {
          question: "IS THE DONATION TAX-EXEMPT?",
          answer: "Yes, Moksha Seva is a registered entity and all donations are 80G tax-exempted according to regulations."
        }
      ]
    }
  },
  
  about: {
    hero: {
      badge: "✦ Our Story ✦",
      title: "About Moksha Seva",
      description: "Founded in 2018, Moksha Seva began with a simple conviction: that every human being — regardless of identity, wealth, or social status — deserves a respectful and dignified farewell.",
      stats: [
        { number: "2,847", label: "Lives Honored" },
        { number: "38+", label: "Cities Served" },
        { number: "6", label: "Years of Service" }
      ],
      image: "/gallery/image007.png",
      cardTitle: "Serving with Dignity",
      cardDescription: "Every soul deserves respect in their final journey"
    },
    missionVision: {
      mission: {
        title: "Our Mission",
        description: "To ensure every unclaimed body and destitute individual receives a dignified cremation with proper rites, complete documentation, and public accountability — in partnership with police departments, hospitals, and municipal authorities.",
        icon: "Target"
      },
      vision: {
        title: "Our Vision", 
        description: "A society where no person is left without dignified last rites — where technology, compassion, and civic duty unite to ensure that death does not discriminate, and neither does our response to it.",
        icon: "Eye"
      }
    },
    story: {
      tag: "Journey",
      title: "How Moksha Seva Began",
      paragraphs: [
        "In 2017, our founder Suresh Narayan witnessed an unclaimed body lying uncremated near a Delhi railway station for three days due to bureaucratic delays and lack of resources. That experience became the seed of Moksha Seva.",
        "Starting with just 5 volunteers and a small fund, the organization began documenting and coordinating cremations in partnership with Delhi Police. Within a year, we had performed 200 cremations and helped 50 families navigate government processes.",
        "Today, Moksha Seva operates in 38 cities with 412 active volunteers, and has performed 2,847 cremations — each one documented and publicly accessible. We work in formal partnership with 12 police districts, 8 hospitals, and 25 NGOs."
      ],
      stats: [
        { number: "2,847", label: "Cremations Performed" },
        { number: "38", label: "Cities Served" },
        { number: "412", label: "Active Volunteers" },
        { number: "8+", label: "Years of Service" }
      ],
      image: "/gallery/image009.png",
      imageAlt: "Our Journey"
    },
    values: {
      tag: "Values",
      title: "What We Stand For",
      values: [
        {
          icon: "Heart",
          title: "Compassion First",
          description: "Every individual, regardless of identity or status, deserves care and dignity in their final moments."
        },
        {
          icon: "Eye",
          title: "Radical Transparency",
          description: "All cases, finances, and operations are publicly documented. No hidden practices."
        },
        {
          icon: "Users",
          title: "Community Powered",
          description: "Our strength lies in our volunteer network, partner NGOs, and generous donors."
        },
        {
          icon: "Award",
          title: "Accountability",
          description: "We are accountable to every family, donor, and the public through open data."
        }
      ]
    },
    team: {
      tag: "Team",
      title: "The People Behind Moksha Seva",
      members: [
        {
          name: "Suresh Narayan",
          role: "Founder & Director",
          city: "Delhi",
          years: "6 years"
        },
        {
          name: "Priya Iyer",
          role: "Operations Head",
          city: "Mumbai",
          years: "4 years"
        },
        {
          name: "Mohammed Rafiq",
          role: "Legal & Compliance",
          city: "Delhi",
          years: "5 years"
        },
        {
          name: "Kavitha Rajan",
          role: "Volunteer Coordinator",
          city: "Chennai",
          years: "3 years"
        },
        {
          name: "Arjun Bhatia",
          role: "Technology Lead",
          city: "Bangalore",
          years: "2 years"
        },
        {
          name: "Sunita Devi",
          role: "Community Outreach",
          city: "Lucknow",
          years: "4 years"
        }
      ]
    },
    certifications: {
      title: "Official Registrations & Certifications",
      certifications: [
        { text: "Registered NGO under Societies Act" },
        { text: "12A Income Tax Exemption" },
        { text: "80G Donation Tax Benefit" },
        { text: "FCRA Registered" }
      ]
    }
  },

  "how-it-works": {
    metadata: {
      title: "How It Works"
    },
    hero: {
      badge: "✦ Our Sacred Process ✦",
      title: "How",
      titleHighlight: "Moksha Seva",
      description: "A transparent, humane, and legally compliant 6-step process — from the first report to a permanent public record."
    },
    steps: [
      {
        icon: "Phone",
        step: "Step 1",
        title: "Report an Unclaimed Body",
        description: "A body is reported through our 24/7 helpline, online form, by police, hospital staff, or a member of the public. Every report is logged with a unique Case ID.",
        timeline: "0 - 2 hours",
        actions: [
          "Report received via helpline/form/police",
          "Case ID generated instantly",
          "Notification sent to nearest volunteer team"
        ]
      },
      {
        icon: "Shield",
        step: "Step 2", 
        title: "Police Coordination & Verification",
        description: "Our team coordinates with the nearest police station within 2 hours of the report. Police file an FIR, and we register the case in our system.",
        timeline: "2 - 6 hours",
        actions: [
          "FIR filed with police",
          "Body transported to safe location",
          "Documentation begins"
        ]
      },
      {
        icon: "Search",
        step: "Step 3",
        title: "Identification Attempt", 
        description: "We make every effort to identify the deceased — using our database, social media outreach, Missing Persons helplines, and hospital records. Family is notified if found.",
        timeline: "24 - 72 hours",
        actions: [
          "Photo added to public database",
          "Social media outreach",
          "Hospital & missing persons cross-check",
          "DNA sample preserved"
        ]
      },
      {
        icon: "FileText",
        step: "Step 4",
        title: "Documentation & Legal Process",
        description: "All necessary legal documentation is completed — death certificate application, NOC from police, case records, and next-of-kin search documentation.",
        timeline: "During 72-hour window",
        actions: [
          "Death certificate filed",
          "Police NOC obtained", 
          "All documentation digitized",
          "Legal compliance verified"
        ]
      },
      {
        icon: "Flame",
        step: "Step 5",
        title: "Dignified Cremation",
        description: "If the person remains unidentified after 72 hours (or if family requests), we conduct a full cremation with proper religious rites at an approved cremation ground.",
        timeline: "Within 72-96 hours",
        actions: [
          "Cremation with religious rites",
          "Ash immersion in sacred water body",
          "Volunteer team in attendance",
          "Video documentation for records"
        ]
      },
      {
        icon: "Award",
        step: "Step 6",
        title: "Certificate & Public Record",
        description: "An official cremation certificate is issued. The case is published on our public Transparency Dashboard with all details — permanently accessible.",
        timeline: "Within 48 hours post-cremation",
        actions: [
          "Official certificate issued",
          "Record published on dashboard",
          "Case archived for 25 years",
          "Family can access records anytime"
        ]
      }
    ],
    callToAction: {
      title: "Have a Case to Report?",
      description: "Our team is available 24/7. Every report is taken seriously and acted upon immediately.",
      buttons: {
        reportOnline: {
          text: "Report Online",
          href: "/report"
        },
        callButton: {
          text: "Call 1800-123-456",
          phoneNumber: "+911800123456"
        }
      }
    }
  },

  "why-moksha-seva": {
    metadata: {
      title: "Why Moksha Seva"
    },
    hero: {
      title: "Why Choose",
      titleHighlight: "Moksha Seva",
      description: "When dignity matters most, trust the organization that has served with compassion for over 8 years",
      stats: [
        { number: "2,840+", label: "Lives Honored" },
        { number: "38+", label: "Cities" },
        { number: "8+", label: "Years" }
      ],
      image: "/gallery/image0010.png",
      imageAlt: "Moksha Seva service"
    },
    reasons: [
      {
        icon: "Heart",
        title: "COMPASSIONATE CARE",
        description: "Every soul deserves dignity in their final journey. We treat each case with utmost respect and traditional Hindu rites.",
        color: "text-red-500"
      },
      {
        icon: "Shield",
        title: "TRUSTED LEGACY",
        description: "8+ years of dedicated service with 100% transparency and government partnerships across 38+ cities.",
        color: "text-blue-500"
      },
      {
        icon: "Users",
        title: "COMMUNITY DRIVEN",
        description: "400+ trained volunteers and local partnerships ensure we're always ready to serve when needed most.",
        color: "text-[#20b2aa]"
      },
      {
        icon: "Clock",
        title: "24/7 AVAILABILITY",
        description: "Our helpline and emergency response team operates round the clock, ensuring no soul is left unclaimed.",
        color: "text-orange-500"
      },
      {
        icon: "Award",
        title: "RECOGNIZED EXCELLENCE",
        description: "Featured in national media and recognized by government bodies for our humanitarian service.",
        color: "text-purple-500"
      },
      {
        icon: "CheckCircle",
        title: "COMPLETE COMPLIANCE",
        description: "All services follow legal protocols with proper documentation and 80G tax-exempt donations.",
        color: "text-green-500"
      }
    ],
    impact: {
      title: "Our Impact Speaks",
      stats: [
        { number: "2,840+", label: "Sacred Rites Completed" },
        { number: "38+", label: "Cities Served" },
        { number: "400+", label: "Active Volunteers" },
        { number: "100%", label: "Legal Compliance" }
      ]
    },
    callToAction: {
      title: "Join Our Sacred Mission",
      description: "Be part of a movement that ensures every soul receives the dignity they deserve in their final journey.",
      buttons: {
        volunteer: {
          text: "Become a Volunteer",
          href: "/volunteer"
        },
        donate: {
          text: "Support Our Cause",
          href: "/donate"
        }
      }
    }
  },

  "our-reach": {
    metadata: {
      title: "Our Reach"
    },
    hero: {
      badge: "OUR SERVICE NETWORK",
      title: "OUR GLOBAL",
      titleHighlight: "REACH",
      description: "Moksha Seva operates across 38+ major cities in India, with a dedicated Force of 400+ Saathis ready to respond to any call for dignity."
    },
    regions: [
      {
        name: "North India",
        cities: ["Delhi", "Lucknow", "Ghaziabad", "Kanpur", "Varanasi"],
        density: "High Response Hub",
        stats: "1,200+ Served"
      },
      {
        name: "South India",
        cities: ["Bangalore", "Chennai", "Hyderabad", "Kochi", "Mysore"],
        density: "Tier 1 Center",
        stats: "800+ Served"
      },
      {
        name: "West India",
        cities: ["Mumbai", "Pune", "Ahmedabad", "Nashik", "Surat"],
        density: "State Command Center",
        stats: "1,500+ Served"
      },
      {
        name: "East India",
        cities: ["Kolkata", "Patna", "Ranchi", "Bhubaneswar", "Guwahati"],
        density: "Growing Hub",
        stats: "400+ Served"
      },
      {
        name: "Central India",
        cities: ["Bhopal", "Indore", "Nagpur", "Jabalpur", "Raipur"],
        density: "Response Center",
        stats: "600+ Served"
      }
    ],
    expansionCard: {
      title: "WANT US IN YOUR CITY?",
      description: "Help us expand the 'Force of Dignity' to your city. We provide infrastructure, training, and legal support.",
      buttonText: "REQUEST EXPANSION"
    },
    networkStats: {
      badge: "TOTAL SERVICE REACH",
      title: "THE LARGEST RESPONSE",
      titleHighlight: "FORGOTTEN",
      stats: [
        { number: "38+", label: "Active Cities" },
        { number: "400+", label: "Saathi Force" },
        { number: "8,500+", label: "Total Services" },
        { number: "24/7", label: "Response Units" }
      ]
    },
    form: {
      title: "BRING MOKSHA SEVA",
      titleHighlight: "TO YOUR CITY",
      description: "Help us expand our mission of dignity. We'll work with local partners, volunteers, and authorities to establish operations in your city.",
      successTitle: "REQUEST RECEIVED!",
      successDescription: "Thank you for your interest in bringing Moksha Seva to your city. Our expansion team will review your request and contact you within 5-7 business days.",
      successRequestId: "Request ID:",
      whatWeProvideText: "What we provide: Training for volunteers, ambulance coordination, legal support, and ongoing operational guidance. All services remain 100% free for beneficiaries.",
      submitButtonText: "SUBMIT EXPANSION REQUEST",
      loadingText: "SUBMITTING...",
      footerText: "Our expansion team will review your request and contact you within 5-7 business days.",
      closeButtonText: "CLOSE",
      labels: {
        fullName: "FULL NAME *",
        email: "EMAIL ADDRESS *",
        phone: "PHONE NUMBER *",
        city: "CITY NAME *",
        state: "STATE *",
        population: "POPULATION (OPTIONAL)",
        organization: "ORGANIZATION (OPTIONAL)",
        localSupport: "LOCAL SUPPORT TYPE",
        whyNeeded: "WHY YOUR CITY NEEDS US? *"
      },
      placeholders: {
        fullName: "Enter your full name",
        email: "your.email@example.com",
        phone: "+91 98765 43210",
        city: "Enter city name",
        selectState: "Select state",
        population: "e.g., 5 lakhs, 2 million (minimum 1000)",
        organization: "NGO, Trust, or Community Group",
        whyNeeded: "Tell us about the need for dignified cremation services in your city... (minimum 50 characters)"
      },
      supportTypes: [
        { value: "individual", label: "Individual" },
        { value: "organization", label: "Organization" },
        { value: "government", label: "Government" },
        { value: "community", label: "Community" },
        { value: "multiple", label: "Multiple" }
      ],
      validationMessages: {
        populationMinimum: "Minimum population: 1,000 people",
        populationTooSmall: "Too small: {population} (need 1000+)",
        whyNeededMinimum: "Minimum 50 characters required",
        whyNeededCounter: "{current}/2000 {remaining}"
      },
      states: [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry", "Chandigarh"
      ]
    },
    modal: {
      regionModalDescription: "Our {regionName} operations serve as a critical hub in our national network, providing 24/7 dignified cremation services across multiple cities. Each region is supported by dedicated volunteers, ambulance units, and partnerships with local authorities.",
      expansionButtonText: "REQUEST EXPANSION IN THIS REGION",
      badge: "REGIONAL HUB"
    },
    labels: {
      activeCities: "ACTIVE SERVICE CITIES:",
      permanentImpact: "Permanent Impact",
      activeCitiesCount: "Active Cities",
      totalServices: "Total Services",
      expansionRequestBadge: "EXPANSION REQUEST"
    }
  },

  "board": {
    metadata: {
      title: "Board & Advisors"
    },
    hero: {
      badge: "OUR LEADERSHIP",
      title: "OUR BOARD &",
      titleHighlight: "ADVISORS",
      description: "Moksha Seva is guided by a collective of experts in legal, medical, and spiritual domains. Together, we ensure the mission remains pure and powerful."
    },
    leadership: [
      {
        name: "Saurabh Dev",
        role: "Managing Trustee",
        desc: "Founder and Lead for all field operations in 38+ cities.",
        icon: "Users",
        id: "saurabh-dev"
      },
      {
        name: "Dr. Ananya Sharma",
        role: "Medical Compliance Officer",
        desc: "Expert in legal post-mortem and forensic clearance processes.",
        icon: "ShieldCheck",
        id: "dr-ananya-sharma"
      },
      {
        name: "Pandit Ravi Shastri",
        role: "Sacred Rites Advisor",
        desc: "Ensures every ritual is conducted as per Vedic traditions with absolute dignity.",
        icon: "Users",
        id: "pandit-ravi-shastri"
      },
      {
        name: "Rajesh Khanna",
        role: "Operational Logistics",
        desc: "Coordinates the 400+ Saathi force and volunteer response units.",
        icon: "BarChart3",
        id: "rajesh-khanna"
      },
      {
        name: "Sunita Reddy",
        role: "Legal & Transparency lead",
        desc: "Oversees 80G filings, government relations, and audit reports.",
        icon: "ShieldCheck",
        id: "sunita-reddy"
      }
    ],
    joinCard: {
      title: "JOIN THE ADVISORY COUNCIL",
      description: "We are looking for experts in law, spirituality, and medicine to help us scale the mission across 100+ cities.",
      buttonText: "APPLY TO BOARD",
      buttonHref: "/board/apply"
    },
    stats: [
      { number: "12", label: "Active Advisors" },
      { number: "38", label: "City Heads" },
      { number: "100%", label: "Transparency" },
      { number: "24/7", label: "Field Support" }
    ],
    labels: {
      viewProfile: "VIEW PROFILE"
    }
  },

  "services": {
    metadata: {
      title: "Services"
    },
    hero: {
      badge: "✦ Our Services ✦",
      title: "Our",
      titleHighlight: "Services",
      description: "End-to-end humanitarian services — from cremation to documentation to family support — all at no cost to destitute individuals and families."
    },
    mainServices: [
      {
        icon: "Flame",
        title: "Dignified Cremation Services",
        badge: "Core Service",
        badgeVariant: "primary",
        desc: "We perform complete cremation rituals for unclaimed bodies, homeless individuals, and destitute families. Services include transportation, preparation, religious rites (per deceased's religion), and disposal of ashes in a sacred water body.",
        includes: [
          "Body transportation to cremation ground",
          "Ritual preparation and last rites",
          "Religious rites as per tradition",
          "Ash immersion ceremony"
        ]
      },
      {
        icon: "FileText",
        title: "Documentation & Legal Support",
        badge: "Admin",
        badgeVariant: "secondary",
        desc: "Full legal documentation including official death certificates, police NOC, case registration, and post-cremation certificates — all handled by our trained documentation team.",
        includes: [
          "Death certificate (official)",
          "Police NOC coordination",
          "Case registration & body ID",
          "Post-cremation certificate"
        ]
      },
      {
        icon: "Users",
        title: "Family Support & Counseling",
        badge: "Support",
        badgeVariant: "primary",
        desc: "For poor families who cannot afford funeral costs, we provide full support at no charge. We also assist in identifying government schemes and financial aid available.",
        includes: [
          "Free service for destitute families",
          "Grief counseling sessions",
          "Government scheme guidance",
          "Legal heir certificate help"
        ]
      },
      {
        icon: "Camera",
        title: "Body Identification Services",
        badge: "Investigation",
        badgeVariant: "secondary",
        desc: "We maintain a photographic and descriptive database to assist in identifying unclaimed bodies. We coordinate with hospitals, police, and social media to reunite families.",
        includes: [
          "Photographic documentation",
          "Database listing for 90 days",
          "Social media outreach",
          "DNA coordination (partner labs)"
        ]
      },
      {
        icon: "BookOpen",
        title: "Awareness & Training Programs",
        badge: "Education",
        badgeVariant: "secondary",
        desc: "We train police officers, hospital staff, and municipal workers on protocols for handling unclaimed bodies with dignity, proper documentation, and legal compliance.",
        includes: [
          "Police department training",
          "Hospital staff workshops",
          "Municipal worker orientation",
          "NGO capacity building"
        ]
      },
      {
        icon: "Shield",
        title: "Government Liaison Services",
        badge: "Compliance",
        badgeVariant: "primary",
        desc: "We act as a bridge between families and government authorities — helping navigate bureaucracy, apply for aid, and ensure legal rights are protected.",
        includes: [
          "Government scheme applications",
          "Compensation claim support",
          "Legal heir documentation",
          "Pension and welfare follow-up"
        ]
      }
    ],
    eligibility: {
      badge: "✦ Eligibility ✦",
      title: "Who Can Access Our Services?",
      description: "Our services are completely free and available to anyone in need. We believe dignity in death is a fundamental right, not a privilege.",
      mainImage: "/gallery/image6.png",
      mainImageAlt: "Moksha Seva services",
      items: [
        {
          icon: "UserCheck",
          title: "Unclaimed Bodies",
          desc: "Bodies reported by police, hospitals, or public with no family to claim them",
          image: "/gallery/image1.png"
        },
        {
          icon: "Heart",
          title: "Homeless Individuals",
          desc: "People without family or support system who need dignified final rites",
          image: "/gallery/image2.png"
        },
        {
          icon: "Users",
          title: "Destitute Families",
          desc: "Families who cannot afford cremation costs - we provide complete support",
          image: "/gallery/image3.png"
        },
        {
          icon: "Shield",
          title: "Hospital Referrals",
          desc: "Bodies referred by government and private hospitals across our service areas",
          image: "/gallery/image4.png"
        },
        {
          icon: "MapPin",
          title: "Municipal Cases",
          desc: "Cases reported by municipal authorities and local government bodies",
          image: "/gallery/image5.png"
        }
      ]
    }
  },

  "report": {
    metadata: {
      title: "Report"
    },
    hero: {
      badge: "Emergency Report",
      title: "Report an Unclaimed Body",
      description: "If you have found an unclaimed or unidentified body, please fill this form immediately. Our team responds within 24 hours."
    },
    success: {
      title: "Report Submitted",
      description: "Your report has been received. Our team will contact you within 24 hours.",
      referencePrefix: "MS-2024-",
      urgentAssistanceText: "For urgent assistance, call:",
      phoneNumber: "+911800123456",
      phoneLabel: "1800-123-456 (24/7)",
      submitAnotherText: "Submit another report"
    },
    importantNotice: {
      title: "Important Notice",
      message: "Please also inform your nearest police station. Moksha Seva works in coordination with law enforcement. Do not move or disturb the body."
    },
    formHeader: {
      title: "Case Report Form",
      subtitle: "Please provide as much detail as possible to help us respond quickly"
    },
    sections: [
      { number: 1, title: "Reporter Details", icon: "User" },
      { number: 2, title: "Location Details", icon: "MapPin" },
      { number: 3, title: "Time Details", icon: "Clock" },
      { number: 4, title: "Body Details", icon: "FileText" },
      { number: 5, title: "Identification Marks", icon: "Camera" },
      { number: 6, title: "Physical Condition" },
      { number: 7, title: "Authority Details" },
      { number: 8, title: "Additional Information" },
      { number: 9, title: "Witness Information (Optional)" },
      { number: 10, title: "Document Details (Optional)", icon: "FileText" },
      { number: 11, title: "Upload Photos (Optional)" },
      { number: 12, title: "Consent & Agreement" }
    ],
    labels: {
      reporterName: "Your Name",
      reporterPhone: "Contact Number *",
      reporterEmail: "Email Address",
      reporterAddress: "Your Address",
      reporterRelation: "Relation to Case",
      exactLocation: "Exact Location *",
      landmark: "Landmark",
      area: "Area/Locality *",
      city: "City *",
      state: "State *",
      pincode: "Pincode",
      locationType: "Location Type *",
      gpsCoordinates: "GPS Coordinates (if available)",
      dateFound: "Date Found *",
      timeFound: "Time Found *",
      approximateDeathTime: "Approximate Time of Death (if known)",
      gender: "Gender *",
      approximateAge: "Approximate Age",
      height: "Height (approx.)",
      weight: "Weight (approx.)",
      complexion: "Complexion",
      hairColor: "Hair Color",
      eyeColor: "Eye Color",
      tattoos: "Tattoos",
      scars: "Scars",
      birthmarks: "Birthmarks",
      jewelry: "Jewelry",
      clothing: "Clothing Description",
      personalBelongings: "Personal Belongings",
      bodyCondition: "Body Condition *",
      visibleInjuries: "Visible Injuries",
      causeOfDeathSuspected: "Suspected Cause of Death",
      policeInformed: "Police has been informed",
      policeStationName: "Police Station Name",
      firNumber: "FIR Number (if filed)",
      hospitalName: "Hospital Name (if body is at hospital)",
      postMortemDone: "Post-mortem has been conducted",
      identityDocumentsFound: "Identity documents found with body",
      documentDetails: "Document Details",
      suspectedIdentity: "Suspected Identity",
      familyContacted: "Family members have been contacted",
      additionalNotes: "Additional Notes",
      witnessName: "Witness Name",
      witnessPhone: "Witness Phone",
      witnessAddress: "Witness Address",
      bplCardNumber: "BPL Card Number",
      bplCardPhoto: "Upload BPL Card Photo",
      aadhaarNumber: "Aadhaar Number",
      aadhaarPhoto: "Upload Aadhaar Card Photo",
      nocDetails: "Certificate Details",
      nocPhoto: "Upload Certificate Photo",
      panNumber: "PAN Number",
      panPhoto: "Upload PAN Card Photo",
      agreeToTerms: "I confirm that the information provided is accurate to the best of my knowledge *",
      consentToShare: "I consent to share this information with authorities and Moksha Seva team *",
      submitButton: "Submit Emergency Report",
      confidentialityText: "Your information is confidential and used only for case resolution."
    },
    placeholders: {
      reporterName: "Full name",
      reporterPhone: "+91 98765 43210",
      reporterEmail: "your@email.com",
      reporterAddress: "Complete address",
      exactLocation: "Street address, building name, etc.",
      landmark: "Nearby landmark",
      area: "Area name",
      city: "City",
      pincode: "000000",
      gpsCoordinates: "Lat, Long",
      approximateDeathTime: "e.g., 2-3 hours ago, yesterday evening",
      approximateAge: "e.g., 30-35 years",
      height: "e.g., 5'6'' or 168 cm",
      weight: "e.g., 65 kg",
      complexion: "Fair, Wheatish, Dark",
      hairColor: "Black, Brown, Grey",
      eyeColor: "Brown, Black, etc.",
      tattoos: "Describe any tattoos",
      scars: "Describe any scars",
      birthmarks: "Describe any birthmarks",
      jewelry: "Rings, chains, watches, etc.",
      clothing: "Describe clothing in detail",
      personalBelongings: "Wallet, phone, documents, bags, etc.",
      visibleInjuries: "Describe any visible injuries or wounds",
      causeOfDeathSuspected: "If you have any suspicion (accident, natural, etc.)",
      policeStationName: "Station name",
      firNumber: "FIR number",
      hospitalName: "Hospital name",
      documentDetails: "Aadhaar, PAN, Driving License, etc.",
      suspectedIdentity: "If you suspect who the person might be",
      additionalNotes: "Any other relevant information...",
      witnessName: "Name of another witness",
      witnessPhone: "+91 98765 43210",
      witnessAddress: "Address",
      bplCardNumber: "Enter BPL card number",
      aadhaarNumber: "Enter Aadhaar number",
      nocDetails: "Enter certificate type and details",
      panNumber: "Enter PAN number"
    },
    selectOptions: {
      reporterRelation: [
        { value: "", label: "Select relation" },
        { value: "witness", label: "Witness" },
        { value: "relative", label: "Relative" },
        { value: "police", label: "Police Personnel" },
        { value: "hospital", label: "Hospital Staff" },
        { value: "passerby", label: "Passerby" },
        { value: "other", label: "Other" }
      ],
      locationType: [
        { value: "", label: "Select type" },
        { value: "road", label: "Road/Highway" },
        { value: "hospital", label: "Hospital" },
        { value: "home", label: "Residential Area" },
        { value: "public_place", label: "Public Place" },
        { value: "river", label: "River/Water Body" },
        { value: "railway", label: "Railway Track/Station" },
        { value: "forest", label: "Forest/Rural Area" },
        { value: "other", label: "Other" }
      ],
      gender: [
        { value: "", label: "Select gender" },
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
        { value: "unknown", label: "Unable to Determine" }
      ],
      bodyCondition: [
        { value: "", label: "Select condition" },
        { value: "recent", label: "Recent (less than 24 hours)" },
        { value: "decomposed", label: "Decomposed (1-7 days)" },
        { value: "advanced", label: "Advanced Decomposition (7+ days)" },
        { value: "skeletal", label: "Skeletal Remains" },
        { value: "unknown", label: "Unable to Determine" }
      ],
      states: [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
        "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
        "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
        "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "ladakh", "Puducherry",
        "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
      ]
    },
    selectPlaceholders: {
      state: "Select state"
    },
    documentSections: {
      title: "Document Details (Optional)",
      description: "If available, please provide details and upload photos of the following documents",
      bplCard: "BPL Card (Below Poverty Line)",
      aadhaarCard: "Aadhaar Card",
      nocCertificate: "NOC from Family / Government Certificate / Pradhan Certificate",
      panCard: "PAN Card"
    },
    sectionTitles: {
      physicalCondition: "Physical Condition",
      authorityDetails: "Authority Details",
      additionalInformation: "Additional Information",
      witnessInformation: "Witness Information (Optional)",
      uploadPhotos: "Upload Photos (Optional)",
      consentAgreement: "Consent & Agreement"
    },
    uploadTexts: {
      clickToUpload: "Click to upload or drag and drop",
      dragAndDrop: "Click to upload or drag and drop",
      fileTypes: "JPG, PNG up to 5MB",
      multipleFiles: "JPG, PNG up to 10MB (Multiple files allowed)"
    },
    emergency: {
      title: "For immediate assistance:",
      phoneNumber: "1800-123-456",
      phoneLabel: "Toll Free · 24/7 · All India",
      description: "For immediate assistance:"
    }
  },

  "impact": {
    metadata: {
      title: "Impact"
    },
    hero: {
      title: "Our",
      highlightText: "Impact",
      description: "Measuring the difference we make in ensuring dignity for every soul's final journey across India",
      image: "/gallery/image2.png",
      imageAlt: "Our impact in serving communities",
      keyStats: {
        livesHonored: {
          number: "2,840+",
          label: "Lives Honored"
        },
        cities: {
          number: "38+",
          label: "Cities"
        },
        years: {
          number: "8+",
          label: "Years"
        }
      },
      missionImpact: {
        title: "Our Mission Impact",
        description: "Every number represents a family we've supported, a community we've served, and a life we've honored with dignity and respect.",
        features: {
          freeService: "100% Free Service",
          available247: "24/7 Available"
        }
      },
      actions: {
        joinMission: {
          text: "Join Our Mission",
          href: "/volunteer"
        },
        supportWork: {
          text: "Support Our Work",
          href: "/donate"
        }
      },
      floatingStats: {
        volunteers: {
          number: "400+",
          label: "Volunteers"
        },
        compliance: {
          number: "100%",
          label: "Compliance"
        }
      }
    },
    impactStats: {
      title: "Our Impact in Numbers",
      description: "Every number represents a life touched, a family supported, and dignity restored in the most sacred moments.",
      stats: [
        {
          icon: "Heart",
          number: "2,840+",
          label: "Sacred Rites Completed",
          description: "Sacred rites performed with dignity and respect",
          color: "text-red-500"
        },
        {
          icon: "MapPin",
          number: "38+",
          label: "Cities Actively Served",
          description: "Cities where we actively serve communities",
          color: "text-blue-500"
        },
        {
          icon: "Users",
          number: "400+",
          label: "Trained Volunteers",
          description: "Dedicated volunteers across India",
          color: "text-[#20b2aa]"
        },
        {
          icon: "Calendar",
          number: "8+",
          label: "Years of Service",
          description: "Years of compassionate service",
          color: "text-orange-500"
        },
        {
          icon: "Award",
          number: "100%",
          label: "Legal Compliance",
          description: "Adherence to legal and ethical standards",
          color: "text-green-500"
        },
        {
          icon: "TrendingUp",
          number: "24/7",
          label: "Emergency Response",
          description: "Round-the-clock emergency response",
          color: "text-purple-500"
        }
      ],
      additionalMetrics: {
        freeService: {
          symbol: "₹0",
          title: "Free Service",
          description: "No cost to families in need"
        },
        certified: {
          symbol: "✓",
          title: "80G Certified",
          description: "Tax exemption for donors"
        },
        available247: {
          symbol: "∞",
          title: "24/7 Available",
          description: "Always ready to serve"
        },
        withDignity: {
          symbol: "♥",
          title: "With Dignity",
          description: "Every soul honored equally"
        }
      }
    },
    growthTimeline: {
      title: "Our Growth Journey",
      description: "From humble beginnings in 2018 to serving 38+ cities today, our journey reflects the growing trust communities place in our mission of dignity and compassion.",
      image: "/gallery/image3.png",
      imageAlt: "Our growth across cities",
      yearlyData: [
        { year: "2018", rites: 45, cities: 1, volunteers: 5 },
        { year: "2019", rites: 180, cities: 3, volunteers: 25 },
        { year: "2020", rites: 520, cities: 8, volunteers: 60 },
        { year: "2021", rites: 890, cities: 15, volunteers: 120 },
        { year: "2022", rites: 1240, cities: 22, volunteers: 200 },
        { year: "2023", rites: 1680, cities: 30, volunteers: 300 },
        { year: "2024", rites: 2150, cities: 35, volunteers: 380 },
        { year: "2025", rites: 2840, cities: 38, volunteers: 400 }
      ],
      highlightedYears: [
        { year: "2018", rites: 45, cities: 1 },
        { year: "2021", rites: 890, cities: 15 },
        { year: "2024", rites: 2150, cities: 35 },
        { year: "2025", rites: 2840, cities: 38 }
      ]
    },
    testimonials: {
      title: "Voices of Impact",
      testimonials: [
        {
          quote: "Moksha Seva gave my father the dignified farewell he deserved when we had nowhere else to turn.",
          author: "Priya Sharma, Delhi",
          role: "Beneficiary Family",
          image: "/gallery/image4.png"
        },
        {
          quote: "Working with Moksha Seva has been the most fulfilling experience of my life. Every soul matters.",
          author: "Rajesh Kumar, Volunteer",
          role: "5 Years of Service",
          image: "/gallery/image5.png"
        },
        {
          quote: "Their transparency and dedication to traditional rites is unmatched in humanitarian work.",
          author: "Dr. Anita Verma",
          role: "Social Worker",
          image: "/gallery/image6.png"
        }
      ]
    },
    callToAction: {
      title: "Be Part of Our Impact",
      description: "Every contribution, every volunteer hour, every shared story amplifies our impact in serving humanity.",
      image: "/gallery/image1.png",
      imageAlt: "Join our mission",
      actions: {
        joinMission: {
          text: "Join Our Mission",
          href: "/volunteer"
        },
        supportWork: {
          text: "Support Our Work",
          href: "/donate"
        }
      }
    }
  },

  "stories": {
    metadata: {
      title: "Stories"
    },
    hero: {
      badge: "STORIES OF RESILIENCE",
      title: "NARRATIVES OF",
      highlightText: "DIGNITY",
      description: "Every person we serve has a story that was almost lost. We document these journeys to ensure their humanity is never forgotten."
    },
    storiesGrid: {
      stories: [
        {
          title: "The Man with the Silver Key",
          duration: "4:15",
          type: "Short Film",
          description: "A forgotten watchmaker in Varanasi and the Saathi who became his son for one final hour.",
          image: "https://images.unsplash.com/photo-1533158307587-828f0a76ef46?q=80&w=2000&auto=format&fit=crop",
          imageAlt: "The Man with the Silver Key story"
        },
        {
          title: "Night Shift Dignity",
          duration: "6:30",
          type: "Documentary",
          description: "Follow our Lucknow response unit through a midnight call that changed their lives forever.",
          image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2000&auto=format&fit=crop",
          imageAlt: "Night Shift Dignity documentary"
        },
        {
          title: "Naming the Nameless",
          duration: "3:45",
          type: "Cinematic Short",
          description: "The deep investigation process we follow to find the identity of those forgotten by society.",
          image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop",
          imageAlt: "Naming the Nameless cinematic short"
        }
      ],
      buttons: {
        watchNow: "WATCH NOW",
        favorite: "Add to favorites"
      }
    },
    newsletter: {
      title: "GET STORIES IN YOUR",
      highlightText: "INBOX",
      description: "Subscribe to 'The Dignity Dispatch'—a monthly long-form narrative series about the souls we serve. No spam, just humanity.",
      placeholder: "YOUR EMAIL ADDRESS",
      buttonText: "SUBSCRIBE"
    }
  },

  "remembrance": {
    metadata: {
      title: "Remembrance"
    },
    hero: {
      badge: "DIGITAL MEMORIAL",
      title: "WALL OF",
      highlightText: "REMEMBRANCE",
      description: "We \"Name the Nameless.\" This is a sacred digital space for the souls we have served—because every single person deserves a legacy of dignity."
    },
    memorialGrid: {
      search: {
        placeholder: "SEARCH BY NAME, CASE ID, OR CITY...",
        buttonText: "FIND SOUL"
      },
      memorials: [
        {
          name: "John Doe (Case #MS-104)",
          date: "March 15, 2023",
          city: "Delhi",
          tribute: "A soul that lived behind the shadows of Connaught Place. Found peace at the banks of Yamuna."
        },
        {
          name: "Unknown Woman (#MS-105)",
          date: "March 16, 2023",
          city: "Lucknow",
          tribute: "Dignity was her name when we met her at Charbagh. Her last journey was a sacred one."
        },
        {
          name: "Baba Ji (#MS-106)",
          date: "March 18, 2023",
          city: "Varanasi",
          tribute: "A life of devotion, a departure of dignity. We were his family at the final hour."
        },
        {
          name: "Elder Man (#MS-107)",
          date: "March 20, 2023",
          city: "Mumbai",
          tribute: "The city of speed stopped for 5 minutes during his final farewell. He wasn't alone."
        },
        {
          name: "Case #MS-108",
          date: "March 22, 2023",
          city: "Pune",
          tribute: "A quiet soul found in the outskirts. His memory now lives in the hearts of his Saathi family."
        }
      ],
      actions: {
        offerFlower: "Offer a Flower",
        viewCase: "VIEW CASE"
      },
      stats: {
        number: "8,500+",
        description: "SOULS REMEMBERED ON THIS WALL",
        sponsorButton: "SPONSOR A TRIBUTE",
        sponsorLink: "/donate"
      }
    },
    memorialMessage: {
      title: "\"NO SOUL SHOULD BE",
      highlightText: "FORGOTTEN\"",
      description: "The Wall of Remembrance is not just a database; it is our commitment to ensure that even those who left this world with nothing, leave it with a memory.",
      actions: {
        leaveTribute: {
          text: "LEAVE A TRIBUTE",
          href: "/donate"
        },
        missionStory: {
          text: "OUR MISSION STORY",
          href: "/how-it-works"
        }
      }
    }
  },

  "testimonials": {
    metadata: {
      title: "Testimonials"
    },
    hero: {
      title: "",
      highlightText: "Testimonials",
      description: "Hear from the families, volunteers, and partners who have experienced our compassionate service"
    },
    stats: [
      { number: "2,840+", label: "Families Served" },
      { number: "98%", label: "Satisfaction Rate" },
      { number: "400+", label: "Volunteer Testimonials" },
      { number: "38+", label: "Cities Covered" }
    ],
    testimonialsGrid: {
      title: "Stories of Gratitude",
      testimonials: [
        {
          name: "Rajesh Kumar",
          role: "Beneficiary Family",
          location: "Delhi",
          rating: 5,
          quote: "When my father passed away and we had no resources for proper rites, Moksha Seva stepped in like angels. They performed every ritual with such care and respect, following all Hindu traditions perfectly. I will be forever grateful.",
          image: "/gallery/image1.png"
        },
        {
          name: "Dr. Priya Sharma",
          role: "Hospital Administrator",
          location: "Mumbai",
          rating: 5,
          quote: "We work closely with Moksha Seva for unclaimed bodies at our hospital. Their professionalism, speed of response, and adherence to legal protocols is exemplary. They treat every case with dignity.",
          image: "/gallery/image2.png"
        },
        {
          name: "Anita Verma",
          role: "Volunteer",
          location: "Varanasi",
          rating: 5,
          quote: "Being a volunteer with Moksha Seva for 3 years has been the most fulfilling experience of my life. Every soul we serve reminds me why this work is so sacred and important.",
          image: "/gallery/image3.png"
        },
        {
          name: "Suresh Patel",
          role: "Corporate Partner",
          location: "Ahmedabad",
          rating: 5,
          quote: "Our company has been supporting Moksha Seva for 2 years. Their transparency in fund utilization and regular impact reports give us complete confidence in their mission.",
          image: "/gallery/image4.png"
        },
        {
          name: "Maya Singh",
          role: "Social Worker",
          location: "Lucknow",
          rating: 5,
          quote: "I've referred many families to Moksha Seva during their most difficult times. The compassion and support they provide goes beyond just the final rites - they truly care for the families.",
          image: "/gallery/image5.png"
        },
        {
          name: "Ramesh Gupta",
          role: "Government Official",
          location: "Patna",
          rating: 5,
          quote: "Moksha Seva has been an invaluable partner in our efforts to ensure dignified treatment of unclaimed bodies. Their systematic approach and documentation is commendable.",
          image: "/gallery/image6.png"
        }
      ]
    },
    videoTestimonials: {
      title: "Video Stories",
      description: "Watch heartfelt stories from families and volunteers who have experienced our compassionate service firsthand.",
      videos: [
        {
          title: "Family Testimonial 1",
          duration: "2 minutes",
          thumbnail: "/gallery/image1.png",
          alt: "Video testimonial 1"
        },
        {
          title: "Family Testimonial 2",
          duration: "2 minutes",
          thumbnail: "/gallery/image2.png",
          alt: "Video testimonial 2"
        },
        {
          title: "Family Testimonial 3",
          duration: "2 minutes",
          thumbnail: "/gallery/image3.png",
          alt: "Video testimonial 3"
        }
      ]
    },
    callToAction: {
      title: "Share Your Story",
      description: "Have you been touched by our service? We'd love to hear your story and share it with others who might need hope.",
      actions: {
        shareStory: {
          text: "Share Your Story",
          href: "/contact"
        },
        joinMission: {
          text: "Join Our Mission",
          href: "/volunteer"
        }
      }
    }
  },

  "gallery": {
    metadata: {
      title: "Gallery"
    },
    hero: {
      badge: "Visual Journey",
      title: {
        line1: "Moments",
        line2: "of",
        line3: "Grace"
      },
      description: "Every frame captures the essence of compassion, dignity, and the sacred bond between humanity and service",
      stats: {
        momentsCaptured: {
          number: "2,840+",
          label: "Moments Captured"
        },
        categories: {
          number: "16",
          label: "Photo Categories"
        },
        citiesDocumented: {
          number: "38+",
          label: "Cities Documented"
        },
        storiesTold: {
          number: "400+",
          label: "Stories Told"
        }
      },
      backgroundImages: [
        "/gallery/image1.png", "/gallery/image2.png", "/gallery/image3.png", 
        "/gallery/image4.png", "/gallery/image5.png", "/gallery/image6.png",
        "/gallery/gallery_cremation_ceremony_1772861295131.png",
        "/gallery/gallery_volunteer_service_1772861316550.png",
        "/gallery/gallery_peaceful_departure_1772861335733.png",
        "/gallery/gallery_ambulance_unit_1772862517482.png",
        "/gallery/gallery_community_support_1772861359875.png",
        "/gallery/gallery_volunteer_meeting_1772862633347.png",
        "/gallery/gallery_memorial_site_1772862535416.png",
        "/gallery/hero_ambulance.png", "/gallery/hero_mission_1.png",
        "/gallery/hero_moksha_1.png"
      ]
    },
    gallery: {
      categories: ["All", "Services", "Team", "Community", "Spirituality", "Infrastructure"],
      loadMoreText: "Load More Images",
      images: [
        {
          src: "/gallery/gallery_cremation_ceremony_1772861295131.png",
          title: "Dignified Farewell Ceremony",
          category: "Services",
          location: "Nigambodh Ghat, Delhi",
          date: "Jan 2024",
          height: 400
        },
        {
          src: "/gallery/gallery_volunteer_service_1772861316550.png",
          title: "Compassionate Volunteers",
          category: "Team",
          location: "Community Center, Delhi",
          date: "Feb 2024",
          height: 280
        },
        {
          src: "/gallery/gallery_peaceful_departure_1772861335733.png",
          title: "Serene Landscapes of Peace",
          category: "Spirituality",
          location: "Yamuna Bank",
          date: "Mar 2024",
          height: 350
        },
        {
          src: "/gallery/gallery_ambulance_unit_1772862517482.png",
          title: "Moksha Seva Mobile Unit",
          category: "Infrastructure",
          location: "Service Station",
          date: "Feb 2024",
          height: 320
        },
        {
          src: "/gallery/gallery_community_support_1772861359875.png",
          title: "Community of Support",
          category: "Community",
          location: "Ghaziabad Hub",
          date: "Mar 2024",
          height: 250
        },
        {
          src: "/gallery/gallery_volunteer_meeting_1772862633347.png",
          title: "The Heart of Service",
          category: "Team",
          location: "Ghaziabad Office",
          date: "Dec 2023",
          height: 380
        },
        {
          src: "/gallery/gallery_memorial_site_1772862535416.png",
          title: "Sacred Memorial Space",
          category: "Spirituality",
          location: "Memorial Park",
          date: "Jan 2024",
          height: 300
        },
        {
          src: "/gallery/hero_ambulance.png",
          title: "Emergency Response Vehicle",
          category: "Infrastructure",
          location: "Delhi NCR",
          date: "Nov 2023",
          height: 260
        },
        {
          src: "/gallery/hero_mission_1.png",
          title: "Our Mission in Action",
          category: "Services",
          location: "Multiple Cities",
          date: "2023",
          height: 420
        },
        {
          src: "/gallery/hero_moksha_1.png",
          title: "Moksha Seva Team",
          category: "Team",
          location: "Head Office",
          date: "Oct 2023",
          height: 290
        },
        {
          src: "/gallery/image1.png",
          title: "Serving with Dignity",
          category: "Services",
          location: "Varanasi",
          date: "Sep 2023",
          height: 340
        },
        {
          src: "/gallery/image2.png",
          title: "Community Outreach",
          category: "Community",
          location: "Mumbai",
          date: "Aug 2023",
          height: 310
        },
        {
          src: "/gallery/image3.png",
          title: "Volunteer Training",
          category: "Team",
          location: "Bangalore",
          date: "Jul 2023",
          height: 270
        },
        {
          src: "/gallery/image4.png",
          title: "Sacred Rituals",
          category: "Spirituality",
          location: "Haridwar",
          date: "Jun 2023",
          height: 390
        },
        {
          src: "/gallery/image5.png",
          title: "Support Network",
          category: "Community",
          location: "Pune",
          date: "May 2023",
          height: 330
        },
        {
          src: "/gallery/image6.png",
          title: "Compassionate Care",
          category: "Services",
          location: "Kolkata",
          date: "Apr 2023",
          height: 360
        }
      ]
    }
  },

  "feedback": {
    metadata: {
      title: "Feedback"
    },
    hero: {
      badge: "Your Voice Matters",
      title: "Share Your Feedback",
      description: "Help us improve our services and serve you better. Your feedback is invaluable to us.",
      icon: "MessageSquare"
    },
    success: {
      title: "Thank You!",
      description: "Your feedback has been received and is valuable to us.",
      referencePrefix: "FB-2024-",
      submitAnotherText: "Submit another feedback"
    },
    alert: {
      title: "We Value Your Opinion",
      message: "Your feedback helps us improve our services and better serve those in need. All responses are confidential."
    },
    formHeader: {
      title: "Feedback Form",
      subtitle: "Please share your experience and suggestions with us"
    },
    sections: [
      { number: 1, title: "Your Details", icon: "User" },
      { number: 2, title: "Feedback Type", icon: "MessageSquare" },
      { number: 3, title: "Rate Your Experience", icon: "Star" },
      { number: 4, title: "Your Feedback", icon: "MessageSquare" },
      { number: 5, title: "Suggestions & Recommendations", icon: "Star" },
      { number: 6, title: "Privacy & Consent", icon: "Shield" }
    ],
    labels: {
      yourName: "Your Name *",
      emailAddress: "Email Address *",
      phoneNumber: "Phone Number",
      typeOfFeedback: "Type of Feedback *",
      serviceUsed: "Service Used",
      overallExperienceRating: "Overall Experience Rating *",
      subject: "Subject *",
      detailedMessage: "Detailed Message *",
      suggestionsForImprovement: "Suggestions for Improvement",
      wouldRecommend: "Would you recommend Moksha Seva to others? *",
      consentToPublish: "I consent to Moksha Seva using my feedback (anonymously) for testimonials and service improvement purposes",
      submitButton: "Submit Feedback",
      confidentialityText: "Your feedback is confidential and helps us serve better."
    },
    placeholders: {
      fullName: "Full name",
      email: "your@email.com",
      phone: "+91 98765 43210",
      subject: "Brief subject of your feedback",
      detailedMessage: "Please share your detailed feedback, experience, or suggestions...",
      suggestions: "How can we improve our services?"
    },
    selectOptions: {
      feedbackType: [
        { value: "", label: "Select type" },
        { value: "service_experience", label: "Service Experience" },
        { value: "website", label: "Website Feedback" },
        { value: "volunteer", label: "Volunteer Experience" },
        { value: "donation", label: "Donation Process" },
        { value: "complaint", label: "Complaint" },
        { value: "suggestion", label: "Suggestion" },
        { value: "appreciation", label: "Appreciation" },
        { value: "other", label: "Other" }
      ],
      serviceUsed: [
        { value: "", label: "Select service" },
        { value: "cremation", label: "Cremation Services" },
        { value: "report", label: "Report Unclaimed Body" },
        { value: "volunteer", label: "Volunteer Program" },
        { value: "donation", label: "Donation" },
        { value: "helpline", label: "24/7 Helpline" },
        { value: "website", label: "Website" },
        { value: "other", label: "Other" }
      ],
      recommendation: [
        { value: "yes", label: "Yes, definitely" },
        { value: "maybe", label: "Maybe" },
        { value: "no", label: "No" }
      ]
    },
    ratingLabels: {
      excellent: "Excellent",
      veryGood: "Very Good",
      good: "Good",
      fair: "Fair",
      poor: "Poor"
    },
    validationMessages: {
      fillRequiredFields: "Please fill in all required fields",
      selectRating: "Please select a rating between 1 and 5 stars",
      submitFailed: "Failed to submit feedback"
    },
    contact: {
      title: "Have questions? Contact us:",
      phone: {
        number: "+911800123456",
        display: "📞 1800-123-456"
      },
      email: {
        address: "feedback@mokshaseva.org",
        display: "✉️ feedback@mokshaseva.org"
      }
    }
  },

  "volunteer": {
    metadata: {
      title: "Volunteer"
    },
    hero: {
      badge: "✦ Join Us ✦",
      title: "Become a Volunteer",
      description: "Join 412 volunteers across 38 cities. No special qualifications needed — only compassion and a few hours a month."
    },
    success: {
      title: "Welcome to the Moksha Seva Family!",
      description: "Thank you for registering as a volunteer. Our coordination team will reach out to you within 2–3 business days.",
      registerAnotherText: "Register another volunteer"
    },
    whyVolunteer: [
      {
        icon: "Heart",
        title: "Make a Difference",
        desc: "Directly help ensure dignified last rites for those who have none."
      },
      {
        icon: "Users",
        title: "Join a Community",
        desc: "Be part of a compassionate, purpose-driven volunteer network."
      },
      {
        icon: "Clock",
        title: "Flexible Commitment",
        desc: "Even a few hours a month creates real impact."
      }
    ],
    volunteerTypes: [
      {
        value: "field_volunteer",
        label: "Field Volunteer",
        desc: "On-ground support for cremation services",
        icon: "Users",
        commitment: "10-15 hours/month"
      },
      {
        value: "transport_logistics",
        label: "Transportation & Logistics",
        desc: "Vehicle support and body transportation",
        icon: "MapPin",
        commitment: "Flexible, on-call"
      },
      {
        value: "documentation",
        label: "Documentation Support",
        desc: "Help with paperwork and legal formalities",
        icon: "FileText",
        commitment: "5-10 hours/month"
      },
      {
        value: "counseling",
        label: "Grief Counseling",
        desc: "Emotional support for families",
        icon: "Heart",
        commitment: "8-12 hours/month"
      },
      {
        value: "medical_support",
        label: "Medical Support",
        desc: "Healthcare professionals for medical assistance",
        icon: "Shield",
        commitment: "On-call basis"
      },
      {
        value: "fundraising",
        label: "Fundraising & Donor Relations",
        desc: "Help raise funds and manage donors",
        icon: "Briefcase",
        commitment: "Flexible"
      },
      {
        value: "awareness",
        label: "Social Media & Awareness",
        desc: "Content creation and online campaigns",
        icon: "Users",
        commitment: "5-8 hours/month"
      },
      {
        value: "tech_support",
        label: "Tech & IT Support",
        desc: "Website, app, and technical assistance",
        icon: "GraduationCap",
        commitment: "Flexible, remote"
      },
      {
        value: "event_coordinator",
        label: "Event Coordinator",
        desc: "Organize awareness events and campaigns",
        icon: "Calendar",
        commitment: "Project-based"
      },
      {
        value: "training",
        label: "Training & Mentorship",
        desc: "Train new volunteers and provide guidance",
        icon: "GraduationCap",
        commitment: "8-10 hours/month"
      }
    ],
    formHeader: {
      title: "Volunteer Registration Form",
      subtitle: "Complete all sections • Fields marked with * are required"
    },
    sections: [
      { number: 1, title: "Personal Information" },
      { number: 2, title: "Address Details" },
      { number: 3, title: "Professional Background" },
      { number: 4, title: "Social Media Profiles (Optional)", subtitle: "Help us connect with you and share volunteer opportunities" },
      { number: 5, title: "Volunteer Preferences" },
      { number: 6, title: "Emergency Contact" },
      { number: 7, title: "Additional Information" }
    ],
    registrationTypes: {
      individual: {
        title: "Individual Volunteer",
        description: "Register as a single volunteer",
        icon: "User"
      },
      group: {
        title: "Group Volunteer",
        description: "Register as a group/organization",
        icon: "Users"
      }
    },
    labels: {
      selectVolunteerTypes: "Select Volunteer Type(s)",
      selectVolunteerTypesDesc: "Choose one or more areas where you'd like to contribute",
      registrationType: "Registration Type",
      asRepresentative: "(as representative)",
      groupName: "Group/Organization Name",
      groupSize: "Number of Members",
      groupType: "Group Type",
      groupLeaderDetails: "Group Leader/Coordinator Details",
      groupLeaderName: "Leader Name",
      groupLeaderPhone: "Leader Phone",
      groupLeaderEmail: "Leader Email",
      fullName: "Full Name",
      emailAddress: "Email Address",
      phoneNumber: "Phone Number",
      alternatePhone: "Alternate Phone",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      completeAddress: "Complete Address",
      city: "City",
      state: "State",
      pinCode: "PIN Code",
      currentOccupation: "Current Occupation",
      organizationInstitution: "Organization/Institution",
      experienceLevel: "Experience Level",
      specialSkills: "Special Skills",
      socialMediaNote: "Help us connect with you and share volunteer opportunities",
      facebookProfile: "Facebook Profile",
      instagramHandle: "Instagram Handle",
      twitterHandle: "Twitter/X Handle",
      linkedinProfile: "LinkedIn Profile",
      availability: "Availability",
      preferredLocation: "Preferred Location",
      languagesKnown: "Languages Known",
      hasVehicle: "I have my own vehicle",
      vehicleType: "Vehicle Type",
      emergencyContactName: "Contact Name",
      emergencyContactPhone: "Contact Phone",
      emergencyContactRelation: "Relationship",
      whyVolunteer: "Why do you want to volunteer with us?",
      previousVolunteerWork: "Previous Volunteer Experience (if any)",
      medicalConditions: "Any Medical Conditions we should know about?",
      agreeToTerms: "I agree to the",
      termsAndConditions: "Terms & Conditions",
      termsLink: "/legal/terms",
      andText: "and",
      privacyPolicy: "Privacy Policy",
      privacyLink: "/privacy",
      agreeToBackgroundCheck: "I consent to a background verification check for volunteer safety",
      submitButton: "Register as Volunteer",
      reviewNote: "Our team will review your application and contact you within 3-5 business days"
    },
    placeholders: {
      groupName: "e.g., ABC College, XYZ Company",
      groupSize: "e.g., 10",
      groupLeaderName: "Full name",
      groupLeaderPhone: "+91 98765 43210",
      groupLeaderEmail: "leader@email.com",
      fullName: "As per government ID",
      email: "your@email.com",
      phone: "+91 98765 43210",
      alternatePhone: "+91 98765 43210",
      completeAddress: "House/Flat No., Building, Street, Locality",
      city: "Mumbai",
      pinCode: "400001",
      occupation: "e.g., Teacher, Engineer, Student",
      organization: "Company or school name",
      skills: "e.g., Communication, Leadership, Technical",
      facebook: "https://facebook.com/yourprofile",
      instagram: "@yourusername",
      twitter: "@yourusername",
      linkedin: "https://linkedin.com/in/yourprofile",
      preferredLocation: "Area or locality",
      languagesKnown: "e.g., Hindi, English, Marathi",
      vehicleType: "e.g., Car, Bike, Van",
      emergencyName: "Full name",
      emergencyPhone: "+91 98765 43210",
      emergencyRelation: "e.g., Father, Spouse",
      whyVolunteerPlaceholder: "Share your motivation...",
      previousWorkPlaceholder: "Describe your previous volunteer work...",
      medicalConditionsPlaceholder: "Optional - helps us ensure your safety"
    },
    selectOptions: {
      groupTypes: [
        { value: "", label: "Select Group Type" },
        { value: "corporate", label: "Corporate/Company" },
        { value: "college", label: "College/University" },
        { value: "school", label: "School" },
        { value: "ngo", label: "NGO/Non-Profit" },
        { value: "community", label: "Community Group" },
        { value: "religious", label: "Religious Organization" },
        { value: "other", label: "Other" }
      ],
      genders: [
        { value: "", label: "Select Gender" },
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "other", label: "Other" },
        { value: "prefer_not_to_say", label: "Prefer not to say" }
      ],
      experienceLevels: [
        { value: "", label: "Select Experience" },
        { value: "no_experience", label: "No Prior Experience" },
        { value: "some_experience", label: "Some Experience (1-2 years)" },
        { value: "experienced", label: "Experienced (3-5 years)" },
        { value: "expert", label: "Expert (5+ years)" }
      ],
      availabilityOptions: [
        { value: "", label: "Select Availability" },
        { value: "weekdays_morning", label: "Weekdays Morning (9 AM - 1 PM)" },
        { value: "weekdays_evening", label: "Weekdays Evening (5 PM - 9 PM)" },
        { value: "weekends", label: "Weekends (Sat-Sun)" },
        { value: "full_time", label: "Full Time (Mon-Fri)" },
        { value: "on_call", label: "On Call (Emergency basis)" },
        { value: "flexible", label: "Flexible (As per availability)" }
      ],
      stateSelectLabel: "Select State",
      states: [
        "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
        "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
        "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
        "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
        "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
        "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
      ]
    },
    validationMessages: {
      fillRequiredFields: "Please fill in all required fields and select at least one volunteer type",
      selectVolunteerType: "Please select at least one volunteer type",
      submitFailed: "Failed to submit volunteer application"
    }
  },

  "corporate": {
    metadata: {
      title: "Corporate"
    },
    hero: {
      badge: "STRATEGIC PARTNERSHIPS",
      title: "CORPORATE",
      subtitle: "IMPACT",
      partnersText: "PARTNERS",
      description: "Scale your CSR impact by supporting the most fundamental human right: the right to a dignified departure. Partner with India's largest response network."
    },
    models: [
      {
        title: "City Sponsorship",
        desc: "Adopt an entire city's operations for a year. Cover fuel, rituals, and logistics for every case in that region.",
        icon: "Globe"
      },
      {
        title: "Employee Giving",
        desc: "Enable payroll giving where your employees can contribute a small amount monthly to the 'Dignity Fund'.",
        icon: "Heart"
      },
      {
        title: "Infrastructure Grant",
        desc: "Help us build 'Moksha Kendras'—dignified storage and response centers in cities with high needs.",
        icon: "Briefcase"
      },
      {
        title: "CSR Reporting",
        desc: "We provide comprehensive Impact Reports, Audit Certificates, and 80G documentation for your board.",
        icon: "BarChart3"
      }
    ],
    trust: {
      icon: "ShieldCheck",
      title: "ABSOLUTE",
      subtitle: "TRANS- PARENCY",
      forCSRText: "FOR CSR",
      description: "We provide real-time dashboards for our corporate partners. Track every rupee and every case sponsored by your organization.",
      certifications: {
        taxExemption: {
          value: "80G",
          label: "Tax Exemption"
        },
        permanentReg: {
          value: "12A",
          label: "Permanent Reg."
        }
      },
      imageUrl: "https://images.unsplash.com/photo-1556761175-b413da4baf72?q=80&w=2000&auto=format&fit=crop",
      imageAlt: "Corporate Partnership",
      videoButtonLink: "/documentaries"
    },
    buttons: {
      getPartnershipDeck: "Get Partnership Deck",
      contactLink: "/contact"
    }
  },

  "legacy-giving": {
    metadata: {
      title: "Legacy Giving"
    },
    hero: {
      badge: "THE 100-YEAR MISSION",
      title: "LEGACY",
      subtitle: "GIVING",
      description: "Your kindness can be immortal. By including Moksha Seva in your long-term planning, you ensure no individual dies alone or without dignity for the next century."
    },
    options: [
      {
        title: "Legacy in Wills",
        desc: "A bequest in your will ensures that your kindness lives on even after you're gone. Help a soul depart with the same dignity you would want for yourself.",
        icon: "Scale"
      },
      {
        title: "Endowment Giving",
        desc: "A significant one-time contribution to our Permanent Fund that generates income for years to come, ensuring our 24/7 mission never stops.",
        icon: "Banknote"
      },
      {
        title: "The Family Legacy",
        desc: "Start a collective family fund where your children can honor their ancestors by serving the most forgotten people in our society.",
        icon: "ShieldCheck"
      },
      {
        title: "Property Bequest",
        desc: "Donate property to build response centers or volunteer housing in cities where help is needed most.",
        icon: "Flower"
      }
    ],
    message: {
      icon: "ShieldCheck",
      title: "LEAVE A LEGACY",
      subtitle: "OF",
      subtitleHighlight: "DIGNITY",
      description: "Every soul we honor in 2124 will be because of the visionaries of 2024. Be the light for the generations you will never see.",
      buttons: {
        talkToFounder: "TALK TO OUR FOUNDER",
        talkToFounderLink: "/contact",
        downloadPDF: "DAWN OF THE SECOND CENTURY PDF",
        downloadPDFLink: "/legacy-giving/request-info"
      }
    },
    buttons: {
      requestInfoPack: "REQUEST INFO PACK",
      requestInfoLink: "/legacy-giving/request-info"
    }
  },

  "tribute": {
    metadata: {
      title: "Tribute"
    },
    hero: {
      badge: "A SACRED GIFT",
      title: "IN",
      subtitle: "MEMORY",
      titleSuffix: "OF...",
      description: "Donate in the name of your private loved ones to provide a final farewell to those who have been forgotten by the rest of the world."
    },
    options: [
      {
        title: "Honor a Special Day",
        desc: "Celebrate your own birthday or anniversary by sponsoring the last rites of a person who has no one left.",
        icon: "Calendar"
      },
      {
        title: "In Loving Memory",
        desc: "Remember your own parents or loved ones by donor-sponsoring a dignified cremation on their death anniversary.",
        icon: "Flower"
      },
      {
        title: "Tribute Fund",
        desc: "Start a collective drive with your community or office teammates to honor a coworker or elder who has passed.",
        icon: "Heart"
      },
      {
        title: "Memorial Plaque",
        desc: "For significant tribute donations, we will place a physical or digital plaque in our next response center in your loved one's name.",
        icon: "ShieldCheck"
      }
    ],
    quote: {
      icon: "Flower",
      title: "THE BEAUTY OF",
      subtitle: "REMEMBRANCE",
      quote: "Giving a forgotten soul a name and a prayer is the highest form of service. When we do it in the name of our own ancestors, we create a circle of divinity that heals the entire world.",
      imageUrl: "/gallery/gallery_peaceful_departure_1772861335733.png",
      imageAlt: "Dignified Offering",
      buttonText: "START A TRIBUTE NOW",
      buttonLink: "/donate"
    },
    buttons: {
      sponsorTribute: "Sponsor This Tribute",
      donateLink: "/donate"
    }
  },

  "transparency": {
    metadata: {
      title: "Transparency Dashboard"
    },
    hero: {
      badge: "✦ Public Record ✦",
      title: "Transparency Dashboard",
      description: "Every cremation performed by Moksha Seva is publicly documented. Search, verify, and download certificates freely.",
      icon: "Shield"
    },
    stats: {
      labels: {
        totalCremations: "Total Cremations",
        certificatesIssued: "Certificates Issued",
        activeCases: "Active Cases",
        citiesCovered: "Cities Covered"
      }
    },
    records: {
      title: "Cremation Records",
      downloadButton: "Download CSV",
      tableHeaders: [
        "Body ID",
        "Location Found", 
        "Date Found",
        "Cremation Date",
        "Cremation Ground",
        "Officer",
        "Certificate No.",
        "Status"
      ],
      statusBadge: "✓ Issued",
      footerText: "All data is verified and legally certified",
      tableAriaLabel: "Complete cremation records",
      viewCertificateLabel: "View certificate for",
      showingRecordsText: "Showing",
      certificateIssuedBadge: "✓ Certificate Issued"
    },
    reports: {
      title: "Monthly Transparency Reports",
      description: "We publish detailed monthly reports including fund utilization, case statistics, and operational updates. All reports are free to download.",
      downloadButton: "Download Latest Report",
      reportMonth: "March 2024"
    }
  },

  "schemes": {
    metadata: {
      title: "Schemes"
    },
    hero: {
      badge: "GOVERNMENT RESOURCES",
      title: "FUNERAL ASSISTANCE",
      subtitle: "SCHEMES",
      description: "Complete guide to Central and State government schemes providing financial assistance for funeral expenses and family support"
    },
    tabs: {
      central: "Central Government Schemes",
      state: "State-Wise Schemes"
    },
    centralSchemes: [
      {
        title: "National Family Benefit Scheme (NFBS)",
        authority: "National Social Assistance Programme",
        benefit: "₹20,000 lump sum",
        eligibility: "BPL family, Breadwinner death (age 18-64)",
        purpose: "Family को death के बाद financial help",
        status: "Active",
        icon: "Users",
        color: "text-[#f4c430]"
      },
      {
        title: "Antyesti / Antim Sanskar Assistance",
        authority: "Central Government",
        benefit: "₹3,000 – ₹5,000 funeral expense",
        eligibility: "Poor / destitute families",
        purpose: "Implemented mostly through state governments",
        status: "Active",
        icon: "BookOpen",
        color: "text-[#20b2aa]"
      }
    ],
    stateSchemes: [
      {
        state: "Uttar Pradesh",
        schemes: [
          {
            title: "Raja Harishchandra Antyeshti Sahayata Yojana",
            benefit: "₹3,000 funeral expense",
            eligibility: "Poor families",
            icon: "Building2",
            description: "UP government की यह योजना गरीब परिवारों को अंतिम संस्कार के लिए वित्तीय सहायता प्रदान करती है।"
          },
          {
            title: "Dattopant Thengadi Mratak Shramik Sahayata",
            benefit: "Financial help for construction workers",
            eligibility: "Construction workers के death पर",
            icon: "Users",
            description: "निर्माण श्रमिकों की मृत्यु पर उनके परिवार को वित्तीय सहायता प्रदान की जाती है।"
          }
        ]
      },
      {
        state: "Rajasthan",
        schemes: [
          {
            title: "Antyesti Sahayata Yojana",
            benefit: "₹5,000 funeral expense",
            eligibility: "BPL families",
            icon: "IndianRupee",
            description: "राजस्थान सरकार द्वारा BPL परिवारों को अंतिम संस्कार हेतु वित्तीय सहायता।"
          }
        ]
      },
      {
        state: "Madhya Pradesh",
        schemes: [
          {
            title: "Antyeshti Sahayata Yojana",
            benefit: "₹5,000",
            eligibility: "Poor families",
            icon: "BookOpen",
            description: "मध्य प्रदेश में गरीब परिवारों के लिए अंतिम संस्कार सहायता योजना।"
          }
        ]
      },
      {
        state: "Bihar",
        schemes: [
          {
            title: "Kabir Antyeshti Anudan Yojana",
            benefit: "₹3,000",
            eligibility: "BPL families - Direct payment family को",
            icon: "Users",
            description: "बिहार सरकार की यह योजना BPL परिवारों को सीधे भुगतान के रूप में सहायता प्रदान करती है।"
          }
        ]
      },
      {
        state: "Jharkhand",
        schemes: [
          {
            title: "Mukhyamantri Antyeshti Sahayata",
            benefit: "₹3,000 – ₹5,000",
            eligibility: "Poor families",
            icon: "Building2",
            description: "झारखंड के मुख्यमंत्री अंतिम संस्कार सहायता योजना।"
          }
        ]
      },
      {
        state: "Chhattisgarh",
        schemes: [
          {
            title: "Antyeshti Sahayata Scheme",
            benefit: "₹2,000 – ₹5,000",
            eligibility: "BPL families",
            icon: "IndianRupee",
            description: "छत्तीसगढ़ सरकार की अंतिम संस्कार सहायता योजना।"
          }
        ]
      },
      {
        state: "West Bengal",
        schemes: [
          {
            title: "Samobyathi Scheme",
            benefit: "₹2,000 funeral assistance",
            eligibility: "Poor families",
            icon: "BookOpen",
            description: "पश्चिम बंगाल की समोब्यथी योजना गरीब परिवारों को अंतिम संस्कार सहायता प्रदान करती है।"
          }
        ]
      },
      {
        state: "Odisha",
        schemes: [
          {
            title: "Harischandra Sahayata Yojana",
            benefit: "₹2,000 cash + Free cremation facilities",
            eligibility: "Destitute families",
            icon: "Users",
            description: "ओडिशा की हरिश्चंद्र सहायता योजना नकद राशि और मुफ्त दाह संस्कार की सुविधा प्रदान करती है।"
          }
        ]
      },
      {
        state: "Gujarat",
        schemes: [
          {
            title: "Manav Garima / Funeral Assistance",
            benefit: "Funeral cost support",
            eligibility: "Poor families",
            icon: "Building2",
            description: "गुजरात की मानव गरिमा योजना गरीब परिवारों को अंतिम संस्कार की लागत में सहायता प्रदान करती है।"
          }
        ]
      },
      {
        state: "Maharashtra",
        schemes: [
          {
            title: "Sanjay Gandhi Niradhar Anudan Yojana",
            benefit: "Death assistance + funeral support",
            eligibility: "Destitute families",
            icon: "IndianRupee",
            description: "महाराष्ट्र की संजय गांधी निराधार अनुदान योजना मृत्यु सहायता और अंतिम संस्कार सहायता प्रदान करती है।"
          }
        ]
      },
      {
        state: "Tamil Nadu",
        schemes: [
          {
            title: "Perunthalaivar Kamarajar Funeral Assistance Scheme",
            benefit: "₹15,000 funeral expense",
            eligibility: "Poor families",
            icon: "BookOpen",
            description: "तमिलनाडु की पेरुंथलैवर कामराज अंतिम संस्कार सहायता योजना सबसे अधिक राशि प्रदान करती है।"
          }
        ]
      },
      {
        state: "Karnataka",
        schemes: [
          {
            title: "Sandhya Suraksha / Death Assistance",
            benefit: "Financial help",
            eligibility: "Poor families",
            icon: "Users",
            description: "कर्नाटक की संध्या सुरक्षा योजना गरीब परिवारों को मृत्यु सहायता प्रदान करती है।"
          }
        ]
      },
      {
        state: "Delhi",
        schemes: [
          {
            title: "Municipal Cremation Support",
            benefit: "Electric / CNG crematorium free या subsidized",
            eligibility: "Poor families को free cremation facility",
            icon: "Building2",
            description: "दिल्ली नगर निगम गरीब परिवारों को मुफ्त या सब्सिडी वाली दाह संस्कार सुविधा प्रदान करता है।"
          }
        ]
      }
    ],
    otherSchemes: [
      {
        title: "Construction Worker Welfare Board",
        benefit: "₹5,000-₹10,000 funeral assistance",
        eligibility: "Registered construction workers",
        description: "निर्माण श्रमिक कल्याण बोर्ड के तहत पंजीकृत श्रमिकों को अंतिम संस्कार सहायता।",
        icon: "Users"
      },
      {
        title: "SC/ST Welfare Department",
        benefit: "₹2,000-₹5,000 funeral assistance",
        eligibility: "SC/ST families",
        description: "अनुसूचित जाति/जनजाति कल्याण विभाग द्वारा अंतिम संस्कार सहायता।",
        icon: "Users"
      },
      {
        title: "Panchayat Relief Fund",
        benefit: "Emergency death assistance",
        eligibility: "Village level support",
        description: "पंचायत राहत कोष से आपातकालीन मृत्यु सहायता प्रदान की जाती है।",
        icon: "Building2"
      }
    ],
    assistanceTypes: [
      { type: "BPL funeral assistance", amount: "₹2,000 – ₹5,000" },
      { type: "Labour welfare funeral", amount: "₹5,000 – ₹10,000" },
      { type: "State special schemes", amount: "₹3,000 – ₹15,000" },
      { type: "National Family Benefit", amount: "₹20,000" }
    ],
    helpSources: [
      "Panchayat",
      "Municipal Corporation", 
      "District Magistrate office",
      "Social Welfare Department"
    ],
    sections: {
      centralTitle: "Central Government Schemes (All India)",
      stateTitle: "🗺️ State-Wise Funeral / Cremation Schemes",
      otherAssistanceTitle: "Other Government Funeral Assistance",
      assistanceAmountsTitle: "💰 Typical Government Funeral Assistance (India)",
      helpSourcesTitle: "✅ Where to Get Help",
      helpSourcesDescription: "Poor families को usually help milti hai through these government offices:"
    },
    buttons: {
      applyForScheme: "Apply for this scheme",
      applyForAssistance: "Apply for assistance"
    },
    tableHeaders: {
      schemeType: "Scheme Type",
      amount: "Amount"
    },
    form: {
      labels: {
        fullName: "FULL NAME",
        emailAddress: "EMAIL ADDRESS",
        phoneNumber: "PHONE NUMBER",
        fullAddress: "FULL ADDRESS",
        city: "CITY",
        state: "STATE",
        pincode: "PINCODE",
        additionalDetails: "ADDITIONAL DETAILS (OPTIONAL)",
        selectState: "Select state"
      },
      placeholders: {
        fullName: "Enter your full name",
        email: "your.email@example.com",
        phone: "+91 98765 43210",
        address: "Complete address",
        city: "City name",
        pincode: "123456",
        message: "Any specific questions or urgent requirements..."
      },
      validation: {
        fillRequiredFields: "Please fill in all required fields"
      },
      success: {
        title: "REQUEST RECEIVED!",
        description: "Thank you for reaching out. Our schemes assistance team will contact you within 24 hours to help you with the application process.",
        closeButton: "CLOSE",
        submitAnotherButton: "SUBMIT ANOTHER REQUEST"
      },
      formHeader: {
        badge: "SCHEME ASSISTANCE",
        title: "REQUEST HELP FOR",
        subtitle: "",
        description: "Fill in your details and our team will guide you through the entire application process."
      },
      note: "Note: Our team will contact you within 24 hours to verify your eligibility and guide you through the documentation process. All assistance is completely free.",
      submitButton: "SUBMIT REQUEST",
      confidentialityNote: "Your information is confidential and will only be used for scheme assistance."
    },
    help: {
      title: "NEED HELP",
      subtitle: "FOR APPLYING?",
      description: "Dealing with government paperwork can be overwhelming during a crisis. Our trained volunteers will help you navigate the entire process, 100% free.",
      phone: "1800-123-456",
      email: "schemes@mokshaseva.org",
      callLabel: "CALL US",
      emailLabel: "EMAIL SUPPORT"
    },
    states: [
      "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat",
      "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh",
      "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
      "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh",
      "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh", "Puducherry",
      "Chandigarh", "Andaman and Nicobar Islands", "Dadra and Nagar Haveli and Daman and Diu", "Lakshadweep"
    ]
  },

  donate: {
    hero: {
      badge: {
        icon: "Heart",
        text: "Every Life Deserves Dignity"
      },
      title: {
        line1: "Your",
        line2: "Compassion",
        line3: "Changes Lives"
      },
      subtitle: "Just ₹500 provides a complete dignified cremation service.",
      impactStats: [
        { value: "15,000+", label: "Lives Honored" },
        { value: "50+", label: "Cities Served" },
        { value: "100%", label: "Transparency" }
      ]
    },
    donationTiers: [
      {
        amount: 500,
        label: "One Cremation",
        desc: "Covers basic cremation services for one person",
        impact: "1 person's dignified farewell"
      },
      {
        amount: 2000,
        label: "Family Support Package",
        desc: "Cremation + documentation + family counseling",
        impact: "1 family fully supported"
      }
    ]
  },

  "contact": {
    metadata: {
      title: "Contact"
    },
    hero: {
      badge: "✦ Get in Touch ✦",
      title: "Contact Us",
      description: "We are here to help — for emergencies, partnerships, media queries, or any other matter."
    },
    contactInfo: [
      {
        icon: "Phone",
        title: "Helpline (24/7)",
        info: "1800-123-456",
        sub: "Toll Free · All India",
        href: "tel:+911800123456"
      },
      {
        icon: "Mail",
        title: "Email",
        info: "help@mokshaseva.org",
        sub: "Response within 24 hours",
        href: "mailto:help@mokshaseva.org"
      },
      {
        icon: "MapPin",
        title: "Head Office",
        info: "12, Seva Marg, New Delhi",
        sub: "Delhi 110001",
        href: "#"
      },
      {
        icon: "Clock",
        title: "Office Hours",
        info: "Mon–Sat: 9am–6pm",
        sub: "Emergency line: 24/7",
        href: "#"
      }
    ],
    regionalCoordinators: {
      title: "Regional Coordinators",
      coordinators: [
        {
          city: "Mumbai",
          name: "Priya Iyer",
          phone: "+91 98765 00001"
        },
        {
          city: "Chennai",
          name: "Kavitha Rajan",
          phone: "+91 98765 00002"
        },
        {
          city: "Delhi",
          name: "Suresh Narayan",
          phone: "+91 98765 00003"
        },
        {
          city: "Bangalore",
          name: "Arjun Bhatia",
          phone: "+91 98765 00004"
        },
        {
          city: "Kolkata",
          name: "Anita Devi",
          phone: "+91 98765 00005"
        },
        {
          city: "Lucknow",
          name: "Sunita Devi",
          phone: "+91 98765 00006"
        }
      ]
    },
    form: {
      title: "Send a Message",
      labels: {
        yourName: "Your Name",
        email: "Email",
        phone: "Phone",
        subject: "Subject",
        message: "Message"
      },
      placeholders: {
        fullName: "Full name",
        email: "you@email.com",
        phone: "+91 ...",
        selectSubject: "Select subject...",
        message: "How can we help you?"
      },
      subjectOptions: [
        { value: "general", label: "General Inquiry" },
        { value: "partnership", label: "NGO / Government Partnership" },
        { value: "media", label: "Media & Press" },
        { value: "volunteer", label: "Volunteering" },
        { value: "donation", label: "Donation Query" },
        { value: "emergency", label: "Emergency Case Report" },
        { value: "feedback", label: "Feedback & Suggestions" },
        { value: "other", label: "Other" }
      ],
      submitButton: "Send Message",
      validation: {
        fillRequiredFields: "Please fill in all required fields",
        networkError: "Network error. Please check your connection and try again.",
        submitError: "Failed to send message. Please try again."
      },
      success: {
        title: "Message Sent!",
        description: "We will respond within 24 hours. For emergencies, please call our 24/7 helpline.",
        sendAnotherButton: "Send another message"
      }
    },
    sections: {
      reachUsDirectly: "Reach Us Directly"
    }
  },

  "press": {
    metadata: {
      title: "Press"
    },
    hero: {
      badge: "MEDIA RELATIONS",
      title: "PRESS ROOM &",
      subtitle: "RESOURCES",
      description: "Official media assets, press releases, and stories for journalists covering humanitarian work, social justice, and dignified response."
    },
    pressCoverage: {
      items: [
        {
          source: "The Atlantic",
          date: "April 2024",
          title: "The Indian NGO giving a name to the nameless",
          type: "Feature Story"
        },
        {
          source: "BBC World",
          date: "March 2024",
          title: "Dignity in Departure: A 24/7 mission for the forgotten",
          type: "Video Interview"
        },
        {
          source: "Times of India",
          date: "February 2024",
          title: "Moksha Seva's Saathi Force expands to 38 cities",
          type: "News Report"
        },
        {
          source: "Forbes India",
          date: "January 2024",
          title: "Innovation in Humanitarian Response: Social Impact models",
          type: "Article"
        },
        {
          source: "Hindustan Times",
          date: "December 2023",
          title: "Digital transformation in social sector: Moksha Seva case study",
          type: "Analysis"
        },
        {
          source: "NDTV",
          date: "November 2023",
          title: "Ground Report: How volunteers are changing lives in 38 cities",
          type: "Documentary"
        }
      ],
      readButton: "Read Publication"
    },
    assetLibrary: {
      title: "ASSET LIBRARY",
      assets: [
        {
          name: "Brand & Logo Pack",
          format: "PNG / SVG / PDF",
          size: "12.4 MB"
        },
        {
          name: "High-Res Photo Gallery",
          format: "JPEG (4K Quality)",
          size: "450 MB"
        },
        {
          name: "Press Release Template",
          format: "DOCX / PDF",
          size: "1.2 MB"
        },
        {
          name: "Annual Performance Audit",
          format: "PDF",
          size: "4.5 MB"
        },
        {
          name: "Impact Statistics Report",
          format: "PDF / Excel",
          size: "2.8 MB"
        },
        {
          name: "Founder Interview Kit",
          format: "MP4 / Audio",
          size: "125 MB"
        },
        {
          name: "Field Operations Video",
          format: "MP4 (HD)",
          size: "890 MB"
        },
        {
          name: "Media Guidelines",
          format: "PDF",
          size: "800 KB"
        }
      ]
    },
    mediaContact: {
      title: "FOR",
      subtitle: "PRESS",
      description: "Are you a journalist or storyteller? Our communications team provides exclusive access to field operations and founder interviews.",
      contacts: [
        {
          icon: "Mail",
          label: "EMAIL US",
          value: "media@mokshaseva.org",
          href: "mailto:media@mokshaseva.org"
        },
        {
          icon: "Phone",
          label: "CALL PRESS OFFICE",
          value: "+91 98765 43210",
          href: "tel:+919876543210"
        }
      ]
    }
  },

  "documentaries": {
    metadata: {
      title: "Documentaries"
    },
    hero: {
      badge: "CINEMATIC SERIES",
      title: "HUMAN",
      subtitle: "DOCUMENTARIES",
      description: "We capture the raw, emotional, and powerful moments of our mission through cinematic storytelling. Watch the truth of dignity in departure."
    },
    films: {
      items: [
        {
          title: "One Last Rite",
          duration: "18:00",
          type: "Main Feature",
          year: "2024",
          desc: "A cinematic deep-dive into the founding philosophy of Moksha Seva and the people who make it possible.",
          image: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?q=80&w=2000&auto=format&fit=crop"
        },
        {
          title: "The City of Shadows",
          duration: "12:45",
          type: "City Series",
          year: "2023",
          desc: "Exploring the life and death of those in the busiest hubs of Mumbai, and how our teams respond in the urban chaos.",
          image: "https://images.unsplash.com/photo-1533158307587-828f0a76ef46?q=80&w=2000&auto=format&fit=crop"
        },
        {
          title: "Ganga's Quiet Tears",
          duration: "15:30",
          type: "Regional Story",
          year: "2023",
          desc: "A spiritual exploration of final rites in Varanasi and the transition from identified to unidentified cases.",
          image: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=2000&auto=format&fit=crop"
        },
        {
          title: "Voices from the Field",
          duration: "22:15",
          type: "Documentary Series",
          year: "2024",
          desc: "Interviews with volunteers, families, and community members sharing their experiences with Moksha Seva's mission.",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=2000&auto=format&fit=crop"
        },
        {
          title: "The Silent Heroes",
          duration: "16:40",
          type: "Profile Series",
          year: "2023",
          desc: "Profiling the dedicated volunteers who work tirelessly to ensure dignity in the final journey of every soul.",
          image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000&auto=format&fit=crop"
        },
        {
          title: "Beyond the Call",
          duration: "19:25",
          type: "Impact Story",
          year: "2024",
          desc: "Following the 24/7 emergency response team and their commitment to serving those forgotten by society.",
          image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2000&auto=format&fit=crop"
        }
      ],
      watchButton: "WATCH FILM",
      newBadge: "New"
    },
    festivalSelections: {
      title: "Festival",
      subtitle: "Selections",
      description: "Our documentaries have been recognized at prestigious film festivals worldwide for authentic storytelling and humanitarian impact",
      festivals: [
        {
          name: "Sundance",
          subtitle: "Official Selection",
          year: "2024"
        },
        {
          name: "Cannes",
          subtitle: "Impact Award",
          year: "2023"
        },
        {
          name: "Human Rights",
          subtitle: "Best Documentary",
          year: "2024"
        },
        {
          name: "Docs World",
          subtitle: "Audience Choice",
          year: "2023"
        },
        {
          name: "Mumbai Film Festival",
          subtitle: "Social Impact Award",
          year: "2024"
        },
        {
          name: "Delhi International",
          subtitle: "Jury Special Mention",
          year: "2023"
        },
        {
          name: "IDFA Amsterdam",
          subtitle: "Official Selection",
          year: "2024"
        },
        {
          name: "Hot Docs Toronto",
          subtitle: "World Premiere",
          year: "2023"
        }
      ],
      recognitionText: "Recognized for authentic storytelling and humanitarian impact across international film festivals",
      stats: {
        awards: 6,
        selections: 15
      },
      statsLabels: {
        awards: "Awards",
        selections: "Selections"
      }
    }
  },

  layout: {
    navbar: {
      logo: {
        src: "/logo.png",
        alt: "Moksha Seva Logo",
        title: "Moksha Seva",
        subtitle: "Liberation Through Service"
      },
      navigation: [
        { href: "/", label: "Home", icon: "Home" },
        {
          label: "About",
          icon: "Info",
          subLinks: [
            { href: "/about", label: "About Us", icon: "Info" },
            { href: "/how-it-works", label: "How It Works", icon: "FileText" },
            { href: "/why-moksha-seva", label: "Why Choose Us", icon: "Target" },
            { href: "/our-reach", label: "Our Reach", icon: "Map" },
            { href: "/board", label: "Leadership", icon: "Users" }
          ]
        },
        {
          label: "Services",
          icon: "Flame",
          subLinks: [
            { href: "/services", label: "Cremation Services", icon: "Flame" },
            { href: "/report", label: "Report Unclaimed Body", icon: "Megaphone" }
          ]
        },
        {
          label: "Campaigns",
          icon: "Target",
          subLinks: [
            { href: "/campaigns", label: "All Campaigns", icon: "Target" },
            { href: "/campaigns/dignity-for-all", label: "Dignity For All", icon: "Heart" },
            { href: "/campaigns/adopt-a-city", label: "Adopt a City", icon: "Globe" },
            { href: "/campaigns/sacred-river", label: "Sacred River Initiative", icon: "Anchor" },
            { href: "/campaigns/home-for-saathis", label: "Saathi Shelter", icon: "Tent" }
          ]
        },
        {
          label: "Impact",
          icon: "TrendingUp",
          subLinks: [
            { href: "/impact", label: "Our Impact", icon: "TrendingUp" },
            { href: "/stories", label: "Stories of Change", icon: "Video" },
            { href: "/remembrance", label: "Wall of Remembrance", icon: "Bookmark" },
            { href: "/testimonials", label: "Testimonials", icon: "Heart" },
            { href: "/gallery", label: "Gallery", icon: "Video" },
            { href: "/feedback", label: "Share Feedback", icon: "MessageSquare" }
          ]
        },
        {
          label: "Get Involved",
          icon: "Users",
          subLinks: [
            { href: "/volunteer", label: "Volunteer", icon: "Users" },
            { href: "/corporate", label: "Corporate Partnerships", icon: "Globe" },
            { href: "/legacy-giving", label: "Legacy Giving", icon: "Heart" },
            { href: "/tribute", label: "In Memory Of", icon: "Heart" }
          ]
        },
        {
          label: "Trust",
          icon: "ShieldCheck",
          subLinks: [
            { href: "/transparency", label: "Transparency Dashboard", icon: "BarChart3" },
            { href: "/schemes", label: "Government Schemes", icon: "BookOpen" }
          ]
        },
        {
          label: "Contact",
          icon: "Mail",
          subLinks: [
            { href: "/contact", label: "Contact Us", icon: "Mail" },
            { href: "/press", label: "Press Room", icon: "Megaphone" },
            { href: "/documentaries", label: "Documentaries", icon: "Video" }
          ]
        }
      ],
      actions: {
        search: {
          label: "Search",
          shortcut: "Ctrl+K"
        },
        donate: {
          label: "Donate",
          mobileLabel: "Donate Now"
        }
      },
      mobile: {
        openLabel: "Open menu",
        closeLabel: "Close menu",
        moreLabel: "More"
      }
    },
    footer: {
      brand: {
        logo: {
          src: "/logo.png",
          alt: "Moksha Seva Logo"
        },
        title: "Moksha Seva",
        subtitle: "THE FINAL DIGNITY",
        description: "A world-class humanitarian force dedicated to the restoration of dignity for the forgotten dead. Powered by devotion and the vision of a society where no one departs alone."
      },
      emergency: {
        status: "EMERGENCY STATUS: 24/7 ACTIVE RESPONSE",
        reportLink: {
          text: "REPORT UNCLAIMED BODY",
          href: "/report"
        }
      },
      contact: {
        phone: {
          number: "tel:1800123456",
          display: "1800-123-456"
        },
        email: {
          address: "mailto:info@mokshaseva.org",
          display: "info@mokshaseva.org"
        }
      },
      links: {
        Mission: [
          { label: "Our Story", href: "/about" },
          { label: "Cremation Services", href: "/services" },
          { label: "The Reach", href: "/our-reach" },
          { label: "Transparency", href: "/transparency" }
        ],
        Engagement: [
          { label: "Report a Body", href: "/report" },
          { label: "Volunteer Portal", href: "/volunteer" },
          { label: "Stories of Change", href: "/stories" },
          { label: "Remembrance Wall", href: "/remembrance" }
        ],
        Legacy: [
          { label: "Donate Now", href: "/donate" },
          { label: "Legacy Giving", href: "/legacy-giving" },
          { label: "Sponsor a Tribute", href: "/tribute" },
          { label: "Documentaries", href: "/documentaries" }
        ],
        Trust: [
          { label: "Audit & Compliance", href: "/compliance" },
          { label: "Govt. Schemes", href: "/schemes" },
          { label: "Press Room", href: "/press" },
          { label: "FAQ & Support", href: "/faq" },
          { label: "Contact Us", href: "/contact" }
        ]
      },
      bottom: {
        missionStatus: "MISSION SCALE: 12+ CITIES ACTIVE",
        copyright: "MOKSHA SEVA",
        legalLinks: [
          { label: "TAX EXEMPT (80G)", href: "/compliance" },
          { label: "Privacy Policy", href: "/privacy" }
        ],
        socialPlatforms: ["Facebook", "Twitter", "Instagram", "Youtube"]
      }
    },
    socialFloating: {
      gallery: {
        label: "View Image Gallery",
        href: "/gallery",
        tooltip: "GALLERY"
      },
      socialLinks: [
        {
          name: "Facebook",
          icon: "Facebook",
          url: "https://facebook.com/mokshaseva",
          color: "hover:bg-blue-600"
        },
        {
          name: "X (Twitter)",
          icon: "Twitter",
          url: "https://x.com/mokshaseva",
          color: "hover:bg-black"
        },
        {
          name: "Instagram",
          icon: "Instagram",
          url: "https://instagram.com/mokshaseva",
          color: "hover:bg-pink-600"
        },
        {
          name: "YouTube",
          icon: "Youtube",
          url: "https://youtube.com/@mokshaseva",
          color: "hover:bg-red-600"
        },
        {
          name: "LinkedIn",
          icon: "Linkedin",
          url: "https://linkedin.com/company/mokshaseva",
          color: "hover:bg-blue-700"
        }
      ]
    }
  }
};

const seedPageConfigs = async () => {
  try {
    await connectDB();
    
    console.log('🌱 Seeding page configurations...');
    
    // Check if configs already exist (production safety)
    const existingConfigs = await Content.countDocuments({ type: 'page_config' });
    if (existingConfigs > 0) {
      console.log(`✅ Page configurations already exist (${existingConfigs} found). Skipping seed.`);
      return { success: true, message: 'Configs already exist', count: existingConfigs };
    }
    
    let seededCount = 0;
    
    // Seed each page configuration
    for (const [pageName, config] of Object.entries(sampleConfigs)) {
      try {
        const pageConfig = new Content({
          title: `${pageName.charAt(0).toUpperCase() + pageName.slice(1)} Page Configuration`,
          slug: pageName,
          content: JSON.stringify(config, null, 2),
          type: 'page_config',
          category: 'configuration',
          status: 'published',
          author: new mongoose.Types.ObjectId(),
          metaTitle: `${pageName} Page Config`,
          metaDescription: `Configuration data for ${pageName} page`,
          version: 1
        });
        
        await pageConfig.save();
        seededCount++;
        console.log(`✅ Created configuration for: ${pageName}`);
        
      } catch (error) {
        console.error(`❌ Failed to create config for ${pageName}:`, error.message);
      }
    }
    
    console.log(`🎉 Successfully seeded ${seededCount} page configurations!`);
    
    // Display summary
    const totalConfigs = await Content.countDocuments({ type: 'page_config' });
    console.log(`\n📊 Summary:`);
    console.log(`   Total Page Configs: ${totalConfigs}`);
    console.log(`   Status: All Published`);
    console.log(`   Ready for Frontend Integration: ✅`);
    
    return { success: true, message: 'Seeding completed', count: seededCount };
    
  } catch (error) {
    console.error('❌ Error seeding page configurations:', error);
    return { success: false, error: error.message };
  }
};

// Run seeder only if called directly (not when imported)
if (require.main === module) {
  seedPageConfigs().then((result) => {
    console.log('🏁 Seeding result:', result);
    process.exit(result.success ? 0 : 1);
  });
}

module.exports = seedPageConfigs;