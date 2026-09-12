/**
 * SANJAYA Civic Data & Fixture Repository
 * PRD Appendix A & Section 9: Local fixture data for stories, FAQs,
 * status timelines, and sample ticket states.
 */

const SANJAYA_DATA = {
  // Sample Incident Tickets for Tracker
  tickets: {
    "SJ-2026-8492": {
      id: "SJ-2026-8492",
      category: "Roads & Pavements",
      subcategory: "Deep structural pothole",
      status: "in_progress",
      statusLabel: "Work in progress",
      badgeClass: "badge-progress",
      location: "Ward 14, Southern Avenue junction, near Kali Bari",
      ward: "Ward 14",
      reportedAt: "10 September 2026, 09:15 AM",
      updatedAt: "12 September 2026, 11:30 AM",
      department: "Road Infrastructure & Asphalt Wing",
      nextStep: "Bitumen hot-mix resurfacing scheduled for nocturnal shift (22:00 IST)",
      description: "Severe pothole measuring approximately 1.2m wide and 15cm deep causing severe vehicular slowing and motorcycle hazard after heavy monsoon showers.",
      evidence: "2 photographs verified, GPS coordinates authenticated",
      timeline: [
        {
          phase: "Received",
          title: "Citizen signal authenticated",
          time: "10 Sep 2026, 09:15 AM",
          detail: "Report received via mobile portal with verified coordinates (22.5123° N, 88.3541° E) and high-resolution photo evidence.",
          status: "done"
        },
        {
          phase: "Being reviewed",
          title: "Jurisdictional review & de-duplication",
          time: "10 Sep 2026, 02:40 PM",
          detail: "Duty coordinator confirmed no existing ticket matches this exact pit. Verified jurisdiction under Ward 14 Civil Works.",
          status: "done"
        },
        {
          phase: "Sent to responsible team",
          title: "Dispatched to Road Infrastructure Wing",
          time: "11 Sep 2026, 10:00 AM",
          detail: "Forwarded to Junior Engineer (Roads) with medium-high urgency classification.",
          status: "done"
        },
        {
          phase: "Work in progress",
          title: "Field crew deployed & asphalt batch allocated",
          time: "12 Sep 2026, 11:30 AM",
          detail: "Contractor team on-site with cold-mix barricades; hot-mix steamroller scheduled for overnight window.",
          status: "current"
        },
        {
          phase: "Resolved",
          title: "Final surfacing & public verification",
          time: "Expected 13 Sep 2026",
          detail: "Site inspection, post-repair photograph log, and citizen ticket closure notice.",
          status: "pending"
        }
      ]
    },

    "SJ-2026-1044": {
      id: "SJ-2026-1044",
      category: "Solid Waste Management",
      subcategory: "Commercial container overflow",
      status: "resolved",
      statusLabel: "Resolved",
      badgeClass: "badge-resolved",
      location: "Ward 07, Lake Market North Gate, Rashbehari Avenue",
      ward: "Ward 07",
      reportedAt: "08 September 2026, 07:30 AM",
      updatedAt: "09 September 2026, 04:15 PM",
      department: "Solid Waste Conservancy Directorate",
      nextStep: "Issue resolved. Case closed with post-cleanup photo archive.",
      description: "Organic refuse spilled outside primary metal vat blocking pedestrian sidewalk and attracting stray cattle.",
      evidence: "Photo evidence attached, audio note in Bengali recorded",
      timeline: [
        {
          phase: "Received",
          title: "Report registered",
          time: "08 Sep 2026, 07:30 AM",
          detail: "Logged with audio statement and geolocation.",
          status: "done"
        },
        {
          phase: "Being reviewed",
          title: "Routed to Conservancy Inspector",
          time: "08 Sep 2026, 09:00 AM",
          detail: "Sanitation supervisor acknowledged overflow report.",
          status: "done"
        },
        {
          phase: "Sent to responsible team",
          title: "Compactor vehicle assigned",
          time: "08 Sep 2026, 11:15 AM",
          detail: "Route #12 hydraulic compactor vehicle diverted to station.",
          status: "done"
        },
        {
          phase: "Work in progress",
          title: "Vat clearance & bleaching disinfection",
          time: "08 Sep 2026, 02:30 PM",
          detail: "4.2 tonnes of refuse cleared; area washed with lime and disinfectant.",
          status: "done"
        },
        {
          phase: "Resolved",
          title: "Inspection verified & closed",
          time: "09 Sep 2026, 04:15 PM",
          detail: "Conservancy officer inspection logged. Citizen notified of successful clearance.",
          status: "done"
        }
      ]
    },

    "SJ-2026-3091": {
      id: "SJ-2026-3091",
      category: "Drainage & Waterlogging",
      subcategory: "Subsurface gully-pit silt blockage",
      status: "review",
      statusLabel: "Being reviewed",
      badgeClass: "badge-review",
      location: "Ward 22, College Street book market alleyway",
      ward: "Ward 22",
      reportedAt: "12 September 2026, 08:45 AM",
      updatedAt: "12 September 2026, 10:10 AM",
      department: "Sewerage & Drainage Engineering Division",
      nextStep: "Jurisdiction check against Central Metro drainage works underway",
      description: "Ankle-deep stagnant water accumulating after 30 minutes of rain due to choke in catch-pit strainer.",
      evidence: "1 photo uploaded showing silt accumulation",
      timeline: [
        {
          phase: "Received",
          title: "Signal accepted into portal",
          time: "12 Sep 2026, 08:45 AM",
          detail: "Ticket created by resident without login.",
          status: "done"
        },
        {
          phase: "Being reviewed",
          title: "Assessing duplicate reports & drainage master map",
          time: "12 Sep 2026, 10:10 AM",
          detail: "Checking whether blockage falls under tramline renovation or municipality drain.",
          status: "current"
        },
        {
          phase: "Sent to responsible team",
          title: "Desilting unit dispatch",
          time: "Pending assignment",
          detail: "Suction tanker suction unit queue assignment.",
          status: "pending"
        },
        {
          phase: "Work in progress",
          title: "Jetting & catch-pit unclogging",
          time: "Pending",
          detail: "Mechanical pipe clearing.",
          status: "pending"
        },
        {
          phase: "Resolved",
          title: "Clearance verification",
          time: "Pending",
          detail: "Flow check during low tide.",
          status: "pending"
        }
      ]
    },

    "SJ-2026-0012": {
      id: "SJ-2026-0012",
      category: "Street Lighting",
      subcategory: "Continuous blacked-out feeder segment",
      status: "assigned",
      statusLabel: "Sent to responsible team",
      badgeClass: "badge-assigned",
      location: "Ward 03, Vivekananda Road opposite Hedua Park",
      ward: "Ward 03",
      reportedAt: "11 September 2026, 09:20 PM",
      updatedAt: "12 September 2026, 08:00 AM",
      department: "Public Lighting & Electrical Undertaking",
      nextStep: "Line tester technician dispatched to pole cluster #43-52",
      description: "Six consecutive LED street lamps dark for three consecutive nights, causing public pedestrian hazard.",
      evidence: "Nighttime photo uploaded with street pole numbers",
      timeline: [
        {
          phase: "Received",
          title: "Ticket logged by night commuter",
          time: "11 Sep 2026, 09:20 PM",
          detail: "Pole identifiers captured in report text.",
          status: "done"
        },
        {
          phase: "Being reviewed",
          title: "Lighting control unit verified",
          time: "11 Sep 2026, 11:00 PM",
          detail: "Substation trip flagged on line sector C-4.",
          status: "done"
        },
        {
          phase: "Sent to responsible team",
          title: "Electrical maintenance team assigned",
          time: "12 Sep 2026, 08:00 AM",
          detail: "Job order #LT-902 dispatched to field van #4.",
          status: "current"
        },
        {
          phase: "Work in progress",
          title: "Cable splice repair & driver replacement",
          time: "Scheduled 12 Sep 2026, 02:00 PM",
          detail: "Aerial bucket truck scheduled.",
          status: "pending"
        },
        {
          phase: "Resolved",
          title: "Illumination lux test & closure",
          time: "Scheduled evening",
          detail: "Dusk sensor test verification.",
          status: "pending"
        }
      ]
    },

    "SNY-000001": {
      id: "SNY-000001",
      category: "Roads & Pavements",
      subcategory: "Broken manhole cover",
      status: "resolved",
      statusLabel: "Resolved",
      badgeClass: "badge-resolved",
      location: "Ward 12, Bidhan Sarani crossing",
      ward: "Ward 12",
      reportedAt: "01 September 2026, 11:00 AM",
      updatedAt: "03 September 2026, 03:00 PM",
      department: "Road Infrastructure Wing",
      nextStep: "Resolved and inspected.",
      description: "Cracked reinforced concrete cover over storm sewer.",
      evidence: "Marked on map and photo submitted.",
      timeline: [
        { phase: "Received", title: "Report received", time: "01 Sep 2026", detail: "Incident registered in database.", status: "done" },
        { phase: "Being reviewed", title: "Safety triage", time: "01 Sep 2026", detail: "Emergency barrier erected within 2 hours.", status: "done" },
        { phase: "Sent to responsible team", title: "Casting unit requisition", time: "02 Sep 2026", detail: "Precast heavy-duty cover supplied.", status: "done" },
        { phase: "Work in progress", title: "Installation & cement rim curing", time: "02 Sep 2026", detail: "Cover leveled with road grade.", status: "done" },
        { phase: "Resolved", title: "Inspection completed", time: "03 Sep 2026", detail: "Barricades removed; traffic restored.", status: "done" }
      ]
    }
  },

  // Public Civic Journal Stories (PRD Section 6.6)
  stories: [
    {
      id: "story-1",
      title: "Restoring the Tramline Crossing at Southern Avenue",
      category: "Roads & Pavements",
      categoryKey: "roads",
      ward: "Ward 14",
      date: "September 2026",
      summary: "How three complementary citizen reports gave road engineers the exact data needed to repave an accident-prone crossing in 36 hours.",
      sharedByResidents: "3 citizens independently uploaded geotagged photos showing protruding iron rail edges after the monsoon.",
      whatChanged: "The engineering wing coordinated with the tram authority to pour quick-curing polymer asphalt around the rails during a low-traffic night window.",
      outcome: "Zero skidding incidents reported in the 3 weeks following repair.",
      prototypeTag: "Illustrative Journal Entry",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Cdefs%3E%3ClinearGradient id='g1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%234B1724'/%3E%3Cstop offset='50%25' stop-color='%23280F17'/%3E%3Cstop offset='100%25' stop-color='%23160D12'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23g1)'/%3E%3Cpath d='M0,320 Q200,240 400,300 T800,220 L800,450 L0,450 Z' fill='%23C99A3D' opacity='0.15'/%3E%3Cpath d='M0,360 Q300,310 600,340 T800,310 L800,450 L0,450 Z' fill='%2372263A' opacity='0.3'/%3E%3Ccircle cx='400' cy='180' r='60' fill='%23C99A3D' opacity='0.2'/%3E%3Ctext x='400' y='190' font-family='serif' font-size='28' fill='%23F6E7BF' text-anchor='middle'%3EWard 14 Road Renewal%3C/text%3E%3C/svg%3E"
    },
    {
      id: "story-2",
      title: "Clean Footpaths Around Lake Market North Gate",
      category: "Solid Waste Management",
      categoryKey: "waste",
      ward: "Ward 07",
      date: "August 2026",
      summary: "Eliminating repeated vegetable market spillover with structured morning compactor dispatch.",
      sharedByResidents: "A voice note in Bengali describing vegetable vendors forced into the roadway because the waste vat was unserviced.",
      whatChanged: "Conservancy retimed the primary collection schedule from 11:00 AM to 06:30 AM before market opening.",
      outcome: "240 meters of continuous pedestrian sidewalk reclaimed and daily washing instituted.",
      prototypeTag: "Illustrative Journal Entry",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Cdefs%3E%3ClinearGradient id='g2' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%2336111C'/%3E%3Cstop offset='50%25' stop-color='%231F0A12'/%3E%3Cstop offset='100%25' stop-color='%23160D12'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23g2)'/%3E%3Crect x='100' y='80' width='600' height='290' rx='8' fill='none' stroke='%23C99A3D' stroke-width='1.5' opacity='0.25'/%3E%3Ctext x='400' y='235' font-family='serif' font-size='26' fill='%23F6E7BF' text-anchor='middle'%3EConservancy & Pedestrian Safety%3C/text%3E%3C/svg%3E"
    },
    {
      id: "story-3",
      title: "Desilting the Culvert at Amherst Street Junction",
      category: "Drainage & Waterlogging",
      categoryKey: "water",
      ward: "Ward 28",
      date: "July 2026",
      summary: "Preventing chronic library basement inundation through early citizen signal before peak monsoons.",
      sharedByResidents: "Photographs showing silt level reaching 80% capacity inside the storm intake grate.",
      whatChanged: "A mechanized desilting truck cleared 12 cubic meters of compacted clay within 48 hours of ticket review.",
      outcome: "Water drainage rate improved from 4 hours to under 20 minutes during subsequent cloudbursts.",
      prototypeTag: "Illustrative Journal Entry",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Cdefs%3E%3ClinearGradient id='g3' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23220E18'/%3E%3Cstop offset='100%25' stop-color='%23160D12'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23g3)'/%3E%3Ccircle cx='400' cy='225' r='100' fill='none' stroke='%23C99A3D' stroke-width='1' opacity='0.3'/%3E%3Ctext x='400' y='235' font-family='serif' font-size='24' fill='%23F6E7BF' text-anchor='middle'%3EMonsoon Resilience%3C/text%3E%3C/svg%3E"
    },
    {
      id: "story-4",
      title: "Feeder Cable Renewal Along Vivekananda Road",
      category: "Street Lighting",
      categoryKey: "lighting",
      ward: "Ward 03",
      date: "June 2026",
      summary: "Restoring illumination to eight park-facing lamps after underground moisture short.",
      sharedByResidents: "Two university students flagged poor visibility along the park perimeter path at night.",
      whatChanged: "Public lighting electrical unit traced an underground insulation break and pulled fresh armored cabling.",
      outcome: "Full nighttime lumen standard restored with energy-efficient LED upgrades.",
      prototypeTag: "Illustrative Journal Entry",
      image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Cdefs%3E%3ClinearGradient id='g4' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' stop-color='%23361520'/%3E%3Cstop offset='100%25' stop-color='%23160D12'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='800' height='450' fill='url(%23g4)'/%3E%3Cpath d='M250,350 L400,100 L550,350 Z' fill='%23C99A3D' opacity='0.12'/%3E%3Ctext x='400' y='270' font-family='serif' font-size='24' fill='%23F6E7BF' text-anchor='middle'%3EParkway Illumination%3C/text%3E%3C/svg%3E"
    }
  ],

  // Frequently Asked Questions (Help Centre - PRD Section 6.7)
  faqs: [
    {
      q: "Do I need to create an account or verify my identity to report an issue?",
      a: "No. SANJAYA is founded on the principle of open civic dignity. Any resident may report an issue anonymously or without an account. We only require a valid description, issue category, and physical location. Providing your name or phone number is entirely optional and only used if a field engineer needs directions."
    },
    {
      q: "What happens immediately after I submit a civic report?",
      a: "The portal instantly generates a unique tracking code (such as SJ-2026-XXXX). Your report is checked against nearby existing submissions to prevent duplicates, authenticated for jurisdiction, and routed directly to the responsible municipal department (Roads, Solid Waste, Drainage, or Lighting)."
    },
    {
      q: "Can I report an issue if I cannot take a photograph or don't have GPS?",
      a: "Yes. While a photograph helps field teams assess tools and materials in advance, you can describe the situation in plain text or submit a voice recording. For location, you can choose your ward from the list and name a recognizable landmark, intersection, or building."
    },
    {
      q: "What do the different ticket status terms mean?",
      a: "• 'Received': Stored in the queue and authenticated.\n• 'Being reviewed': Duty officer is checking jurisdiction and merging duplicates.\n• 'Sent to responsible team': Dispatched to the specialized engineering or sanitation office.\n• 'Work in progress': Field crew, equipment, or materials have been mobilized on site.\n• 'Resolved': Work completed, verified by site photographs, and archived."
    },
    {
      q: "Is SANJAYA meant for life-threatening emergencies?",
      a: "No. SANJAYA handles public civil infrastructure issues (road hazards, garbage spillages, drainage blocks, dark streets). In acute life emergencies (gas leaks, live wire collapse, structural building fire, medical crises), please call national emergency services (112) immediately."
    },
    {
      q: "How does SANJAYA prevent duplicate reports for the same pothole or spillage?",
      a: "When multiple residents report an incident in close geographical proximity (within 35 meters) under the same category, our system groups them together under a single master action card. Every resident's ticket stays connected to that work order so everyone receives updates simultaneously."
    }
  ],

  // Multilingual Strings (Assistant & Key Actions)
  i18n: {
    en: {
      reportIssue: "Report an issue",
      trackComplaint: "Track a complaint",
      howItWorks: "How it works",
      civicGuide: "Civic guide",
      more: "More",
      stories: "Stories",
      help: "Help centre",
      about: "About SANJAYA",
      authorityAccess: "Authority access",
      noAccountNeeded: "No account needed to report",
      assistantGreeting: "Greetings. I am SANJAYA's civic assistant. How may I assist your community today?",
      assistantHelpWith: "You can ask me questions about reporting an issue, finding ticket status, or municipal responsibilities."
    },
    hi: {
      reportIssue: "समस्या दर्ज करें",
      trackComplaint: "स्थिति ट्रैक करें",
      howItWorks: "यह कैसे काम करता है",
      civicGuide: "नागरिक मार्गदर्शिका",
      more: "अधिक",
      stories: "कहानियाँ",
      help: "सहायता केंद्र",
      about: "संजय के बारे में",
      authorityAccess: "अधिकारी लॉगिन",
      noAccountNeeded: "रिपोर्ट के लिए खाते की आवश्यकता नहीं",
      assistantGreeting: "नमस्ते। मैं संजय नागरिक सहायक हूँ। आज मैं आपकी क्या सहायता कर सकता हूँ?",
      assistantHelpWith: "आप मुझसे समस्या दर्ज करने, टिकट स्थिति जानने या नागरिक सेवाओं के बारे में पूछ सकते हैं।"
    },
    bn: {
      reportIssue: "সমস্যা জানান",
      trackComplaint: "অভিযোগ ট্র্যাক করুন",
      howItWorks: "পদ্ধতি",
      civicGuide: "নাগরিক নির্দেশিকা",
      more: "আরও",
      stories: "নাগরিক গল্প",
      help: "সহায়তা কেন্দ্র",
      about: "সঞ্জয় পরিচিতি",
      authorityAccess: "কর্তৃপক্ষ লগইন",
      noAccountNeeded: "রিপোর্ট করতে কোনো অ্যাকাউন্টের প্রয়োজন নেই",
      assistantGreeting: "নমস্কার। আমি সঞ্জয় নাগরিক সহকারী। আজ আপনাকে কীভাবে সাহায্য করতে পারি?",
      assistantHelpWith: "আপনি কোনো সমস্যা কীভাবে নথিভুক্ত করবেন, টিকিটের বর্তমান অবস্থা বা পৌর পরিষেবা নিয়ে প্রশ্ন করতে পারেন।"
    }
  }
};
