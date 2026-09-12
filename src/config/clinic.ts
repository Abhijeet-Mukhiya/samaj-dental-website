import { ClinicConfig } from '../types/clinic';

/**
 * Single source of truth for this demo build.
 * Publicly available reference facts are used where verified; the phone and
 * email below are intentionally the contact details supplied for this demo.
 */
export const clinicConfig: ClinicConfig = {
  name: "Samaj Dental Care Clinic - Pepsicola Chowk",
  tagline: "Multispecialty dental care in Suncity, Pepsicola, Kathmandu",
  demoNotice: "DEMO WEBSITE — Sample information for demonstration only. Replace all sample content with clinic-approved details before launch.",
  logoText: "Samaj Dental",
  logoSubtext: "Pepsicola",
  faviconUrl: "/favicon.svg",

  phone: "+977 9820231230",
  email: "",
  whatsapp: "9779820231230",
  whatsappMessage: "Hello, I would like to request a dental appointment at Samaj Dental Care Clinic - Pepsicola Chowk.",
  emergencyPhone: "",

  address: "Suncity, Pepsicola Chowk, Mahadev Chaur Sadak",
  city: "Kathmandu",
  country: "Nepal",
  postalCode: "44600",
  mapsEmbedUrl: "",
  directionsUrl: "https://www.google.com/maps/search/?api=1&query=Samaj%20Dental%20Care%20Clinic%20Pepsicola%20Chowk%2C%20Kathmandu",

  openingHours: [
    { day: "Sunday", hours: "8:00 AM – 8:00 PM", isOpen: true },
    { day: "Monday", hours: "8:00 AM – 8:00 PM", isOpen: true },
    { day: "Tuesday", hours: "8:00 AM – 8:00 PM", isOpen: true },
    { day: "Wednesday", hours: "8:00 AM – 8:00 PM", isOpen: true },
    { day: "Thursday", hours: "8:00 AM – 8:00 PM", isOpen: true },
    { day: "Friday", hours: "8:00 AM – 8:00 PM", isOpen: true },
    { day: "Saturday", hours: "8:00 AM – 8:00 PM", isOpen: true }
  ],
  emergencyAvailability: "Contact the clinic directly for urgent dental concerns. Emergency availability is not advertised as 24/7 in this demo.",
  accreditations: [],
  social: {},

  siteSections: {
    about: true, services: true, doctors: true, gallery: true,
    testimonials: false, faq: true, contact: true, appointment: true,
    privacy: true, terms: true
  },

  colors: { primary: "#0d9488", secondary: "#0f172a", accent: "#0284c7" },

  hero: {
    trustBadge: "Suncity • Pepsicola • Kathmandu",
    headline: "Modern dental care, conveniently close to home.",
    subheadline: "Explore dental treatment options, learn what to expect, and send an appointment request directly to the Pepsicola Chowk clinic team.",
    primaryCtaText: "Request an Appointment",
    secondaryCtaText: "Explore Treatments",
    heroImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80",
    satisfactionText: "Clear information • Direct contact • Appointment requests",
    trustIndicators: ["Multispecialty dental care", "Convenient Pepsicola location", "Daily listed hours", "Phone & WhatsApp contact"]
  },

  about: {
    title: "Dental care in Suncity, Pepsicola",
    subtitle: "A convenient local option for a wide range of dental needs",
    story: "Samaj Dental Care Clinic - Pepsicola Chowk is the Suncity, Pepsicola location referenced in the public clinic information. The branch is described as a multispecialty dental clinic serving patients with a broad range of dental treatment needs.",
    mission: "Make dental care easier to access by combining clear information, convenient appointment requests, and a patient-focused clinic experience.",
    vision: "Help patients make informed decisions about their oral health by connecting them with appropriate dental professionals and treatment options.",
    values: [
      { title: "Patient First", description: "Keep communication respectful, practical, and centered on the patient's needs.", iconName: "HeartHandshake" },
      { title: "Clear Communication", description: "Explain services and appointment steps in language that is easy to understand.", iconName: "MessageCircle" },
      { title: "Professional Care", description: "Treatment recommendations should follow appropriate clinical assessment by dental professionals.", iconName: "ShieldCheck" }
    ],
    features: ["Multispecialty dental services", "Convenient Pepsicola location", "Appointment requests by web, phone or WhatsApp", "Clear treatment information"],
    technology: [],
    clinicImage: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80",
    secondaryImage: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80"
  },

  stats: [],

  services: [
    { id: "demo-service-general", title: "General Dental Consultation", category: "General", shortDescription: "Routine dental assessment and treatment planning.", fullDescription: "SAMPLE SERVICE — Replace with clinic-approved service description before launch.", iconName: "Smile", duration: "30 mins", priceRange: "NPR 500 (sample)", image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80", isFeatured: true, benefits: ["Professional assessment", "Clear treatment planning", "Follow-up guidance"], procedures: [{title:"Consultation",description:"Discuss your dental concern."},{title:"Assessment",description:"A dental professional evaluates your needs."},{title:"Plan",description:"Appropriate care options are explained."}] },
    { id: "demo-service-cleaning", title: "Dental Cleaning", category: "General", shortDescription: "Professional cleaning for routine oral-health maintenance.", fullDescription: "SAMPLE SERVICE — Replace with verified clinic information before launch.", iconName: "Sparkles", duration: "45 mins", priceRange: "NPR 1,500 (sample)", image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80", isFeatured: true, benefits: ["Professional assessment", "Cleaning plan", "Home-care guidance"], procedures: [{title:"Assessment",description:"Oral health is assessed."},{title:"Cleaning",description:"Professional cleaning is performed as appropriate."},{title:"Guidance",description:"Follow-up and home-care guidance are provided."}] },
    { id: "demo-service-filling", title: "Dental Filling", category: "General", shortDescription: "Assessment and restorative options for cavities and damaged teeth.", fullDescription: "SAMPLE SERVICE — Replace with verified clinic information before launch.", iconName: "CirclePlus", duration: "45 mins", priceRange: "NPR 2,000 (sample)", image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=80", isFeatured: true, benefits: ["Assessment before treatment", "Restorative options", "Follow-up guidance"], procedures: [{title:"Examination",description:"The tooth is examined."},{title:"Treatment",description:"A suitable restorative option is performed when appropriate."},{title:"Review",description:"The result and follow-up are discussed."}] },
    { id: "demo-service-rct", title: "Root Canal Treatment", category: "General", shortDescription: "Assessment and treatment options for problems affecting the inside of a tooth.", fullDescription: "SAMPLE SERVICE — Replace with verified clinic information before launch.", iconName: "ShieldCheck", duration: "60 mins", priceRange: "NPR 8,000 (sample)", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80", isFeatured: true, benefits: ["Professional assessment", "Treatment planning", "Follow-up care"], procedures: [{title:"Assessment",description:"The tooth is evaluated."},{title:"Treatment",description:"Treatment is completed according to the clinical plan."},{title:"Restoration",description:"Restoration is planned as appropriate."}] },
    { id: "demo-service-extraction", title: "Tooth Extraction", category: "Surgical", shortDescription: "Assessment and extraction when clinically appropriate.", fullDescription: "SAMPLE SERVICE — Replace with verified clinic information before launch.", iconName: "Activity", duration: "30 mins", priceRange: "NPR 2,500 (sample)", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80", isFeatured: false, benefits: ["Clinical assessment", "Procedure-specific guidance", "Follow-up planning"], procedures: [{title:"Assessment",description:"The tooth and surrounding area are evaluated."},{title:"Procedure",description:"Extraction is performed when appropriate."},{title:"Aftercare",description:"Aftercare guidance is provided."}] },
    { id: "demo-service-cosmetic", title: "Cosmetic Dental Consultation", category: "Cosmetic", shortDescription: "Consultation for cosmetic and restorative dental options.", fullDescription: "SAMPLE SERVICE — Replace with clinic-approved information before launch.", iconName: "Sparkles", duration: "30 mins", priceRange: "Sample pricing", image: "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80", isFeatured: true, benefits: ["Individual assessment", "Treatment options", "Clear planning"], procedures: [{title:"Consultation",description:"Discuss goals and concerns."},{title:"Assessment",description:"A dental professional evaluates suitability."},{title:"Plan",description:"Appropriate options are explained."}] },
    { id: "demo-service-preventive", title: "Preventive Dental Care", category: "General", shortDescription: "Routine preventive care and oral-health guidance.", fullDescription: "SAMPLE SERVICE — Replace with clinic-approved information before launch.", iconName: "ShieldCheck", duration: "30 mins", priceRange: "Sample pricing", image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80", isFeatured: false, benefits: ["Oral-health assessment", "Preventive guidance", "Personalized care plan"], procedures: [{title:"Assessment",description:"A dental professional reviews oral-health needs."},{title:"Care",description:"Appropriate preventive care is discussed or provided."},{title:"Guidance",description:"Home-care and follow-up guidance are explained."}] },
    { id: "demo-service-restorative", title: "Restorative Dentistry Consultation", category: "General", shortDescription: "Consultation for restoring damaged or weakened teeth.", fullDescription: "SAMPLE SERVICE — Replace with clinic-approved information before launch.", iconName: "CirclePlus", duration: "45 mins", priceRange: "Sample pricing", image: "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=80", isFeatured: false, benefits: ["Clinical assessment", "Restoration options", "Treatment planning"], procedures: [{title:"Assessment",description:"The affected tooth is evaluated."},{title:"Options",description:"Appropriate restorative approaches are discussed."},{title:"Plan",description:"A treatment plan is prepared when suitable."}] },
    { id: "demo-service-ortho", title: "Orthodontic Consultation", category: "Orthodontics", shortDescription: "Consultation for alignment and bite-related concerns.", fullDescription: "SAMPLE SERVICE — Replace with clinic-approved information before launch.", iconName: "Smile", duration: "30 mins", priceRange: "Sample pricing", image: "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80", isFeatured: false, benefits: ["Alignment assessment", "Treatment options", "Care planning"], procedures: [{title:"Assessment",description:"Alignment and bite concerns are reviewed."},{title:"Discussion",description:"Suitable options are explained."},{title:"Plan",description:"Next steps are outlined after assessment."}] },
    { id: "demo-service-emergency", title: "Urgent Dental Consultation", category: "Emergency", shortDescription: "Prompt assessment for urgent dental concerns during clinic hours.", fullDescription: "SAMPLE SERVICE — Replace with clinic-approved information before launch.", iconName: "AlertCircle", duration: "30 mins", priceRange: "Sample pricing", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=800&q=80", isFeatured: false, benefits: ["Prompt assessment", "Clear next steps", "Direct clinic guidance"], procedures: [{title:"Assessment",description:"The urgent concern is assessed."},{title:"Guidance",description:"Immediate appropriate next steps are discussed."},{title:"Follow-up",description:"Further care is arranged when required."}] },
  ],

  doctors: [
    {
      id: "demo-doctor-1",
      name: "Dr. Maya Sterling",
      title: "General & Preventive Dentist · Fictional Demo Profile",
      qualification: "Professional details available after clinic verification",
      specialty: "General & Preventive Dentistry",
      experienceYears: undefined,
      bio: "Fictional demonstration profile created to show how a clinic can present a dental professional. Replace this profile with clinic-approved information before launch.",
      image: "/doctor-maya-sterling.svg",
      email: "",
      availableDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      servicesOffered: [],
    },
    {
      id: "demo-doctor-2",
      name: "Dr. Arjun Bennett",
      title: "Restorative & Cosmetic Dentist · Fictional Demo Profile",
      qualification: "Professional details available after clinic verification",
      specialty: "Restorative & Cosmetic Dentistry",
      experienceYears: undefined,
      bio: "Fictional demonstration profile created to show how a clinic can present a dental professional. Replace this profile with clinic-approved information before launch.",
      image: "/doctor-arjun-bennett.svg",
      email: "",
      availableDays: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      servicesOffered: [],
    },
  ],
  testimonials: [],

  faqs: [
    { id: "faq-1", category: "Appointments", question: "How can I request an appointment?", answer: "Use the appointment form, call +977 9820231230, or contact the clinic on WhatsApp. Your request is not confirmed until the clinic responds." },
    { id: "faq-2", category: "General", question: "Where is the Pepsicola Chowk clinic located?", answer: "The reference listing identifies the clinic around Suncity, Pepsicola Chowk in Kathmandu. Use the Google Maps directions button for the latest map location." },
    { id: "faq-3", category: "Treatments", question: "Which dental treatment do I need?", answer: "A dental professional should assess your individual needs before recommending treatment. Website service descriptions are general information, not a diagnosis." },
    { id: "faq-4", category: "Appointments", question: "Can I contact the clinic directly?", answer: "Yes. Call +977 9820231230 or use WhatsApp. Add the clinic email here once an official address is confirmed." },
    { id: "faq-5", category: "Appointments", question: "What are the listed opening hours?", answer: "The current reference listing shows 8:00 AM to 8:00 PM daily. Confirm availability with the clinic before visiting, as schedules can change." }
  ],

  gallery: [
    { id: "gal-1", title: "Modern Dental Treatment Room", category: "Clinic & Facilities", image: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1000&q=80", caption: "Demo image — replace with an actual clinic photo before launch." },
    { id: "gal-2", title: "Welcoming Reception", category: "Clinic & Facilities", image: "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1000&q=80", caption: "Demo image — replace with an actual clinic photo before launch." },
    { id: "gal-3", title: "Dental Equipment", category: "Equipment & Tech", image: "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1000&q=80", caption: "Demo image — replace with an actual clinic photo before launch." },
    { id: "gal-4", title: "Dental Care", category: "Treatments", image: "https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=1000&q=80", caption: "Demo image — replace with an actual clinic photo before launch." }
  ],

  appointmentSettings: {
    timeSlots: ["08:00 AM", "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM", "01:00 PM", "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM", "07:00 PM"],
    noticeRequiredHours: 0,
    allowEmergencyBooking: false,
    emergencyNoticeText: "For urgent concerns, contact the clinic directly. Appointment availability must be confirmed by the clinic.",
    guaranteeNoticeText: "Submitting this form sends an appointment request. The clinic will contact you to confirm availability."
  },

  seo: {
    siteUrl: import.meta.env.VITE_SITE_URL || "",
    defaultTitle: "Samaj Dental Care Clinic - Pepsicola Chowk | Dental Care in Kathmandu",
    titleTemplate: "%s | Samaj Dental Care Clinic - Pepsicola Chowk",
    defaultDescription: "Explore dental services and request an appointment at Samaj Dental Care Clinic - Pepsicola Chowk in Suncity, Pepsicola, Kathmandu.",
    ogImage: "https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=1200&q=80"
  }
};
