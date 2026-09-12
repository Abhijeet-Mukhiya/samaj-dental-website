export interface Doctor {
  id: string;
  name: string;
  title: string;
  qualification: string;
  specialty: string;
  experienceYears?: number;
  bio: string;
  fullBio?: string;
  image: string;
  email: string;
  availableDays: string[];
  servicesOffered: string[];
  education?: string[];
  memberships?: string[];
  languages?: string[];
}

export interface ServiceProcedure {
  title: string;
  description: string;
}

export interface ServiceFAQ {
  question: string;
  answer: string;
}

export interface Service {
  id: string;
  title: string;
  category: 'General' | 'Cosmetic' | 'Surgical' | 'Orthodontics' | 'Pediatric' | 'Emergency';
  shortDescription: string;
  fullDescription: string;
  iconName: string; // Lucide icon identifier
  duration: string;
  priceRange: string;
  image: string;
  benefits: string[];
  procedures: ServiceProcedure[];
  faqs?: ServiceFAQ[];
  isFeatured?: boolean;
}

export interface Testimonial {
  id: string;
  patientName: string;
  patientRole?: string;
  rating: number; // 1-5
  text: string;
  treatmentName: string;
  date: string;
  patientImage?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'General' | 'Appointments' | 'Treatments' | 'Emergency' | 'Insurance & Payment';
}

export interface GalleryItem {
  id: string;
  title: string;
  category: 'All' | 'Clinic & Facilities' | 'Equipment & Tech' | 'Patient Comfort' | 'Treatments';
  image: string;
  caption?: string;
}

export interface StatItem {
  id: string;
  label: string;
  value: string;
  subtext: string;
  iconName: string;
}

export interface DaySchedule {
  day: string;
  hours: string;
  isOpen: boolean;
}

export interface SocialLinks {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  youtube?: string;
  google?: string;
}

export interface ClinicColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface HeroConfig {
  trustBadge: string;
  headline: string;
  subheadline: string;
  primaryCtaText: string;
  secondaryCtaText: string;
  heroImage: string;
  trustIndicators: string[];
  ratingText?: string;
  satisfactionText?: string;
}

export interface AboutConfig {
  title: string;
  subtitle: string;
  story: string;
  mission: string;
  vision: string;
  values: { title: string; description: string; iconName: string }[];
  features: string[];
  technology: { title: string; description: string; iconName: string }[];
  clinicImage: string;
  secondaryImage: string;
}

export interface AppointmentSettings {
  timeSlots: string[];
  noticeRequiredHours: number;
  allowEmergencyBooking: boolean;
  emergencyNoticeText: string;
  guaranteeNoticeText: string;
}

export interface ClinicConfig {
  name: string;
  tagline: string;
  demoNotice?: string;
  logoText: string;
  logoSubtext: string;
  logoImage?: string;
  faviconUrl: string;
  timezone?: string;
  
  // Contact details
  phone: string;
  secondaryPhone?: string;
  emergencyPhone?: string;
  email: string;
  whatsapp: string; // WhatsApp phone number with country code
  whatsappMessage: string;
  
  // Location
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  mapsEmbedUrl?: string;
  directionsUrl: string;
  
  // Operating Hours & Availability
  openingHours: DaySchedule[];
  emergencyAvailability: string;

  // Accreditations & Guarantees
  accreditations: string[];
  
  // Social Media
  social: SocialLinks;
  
  // Branding Colors
  colors: ClinicColors;
  
  // Hero & About Config
  hero: HeroConfig;
  about: AboutConfig;
  
  siteSections: {
    about: boolean; services: boolean; doctors: boolean; gallery: boolean;
    testimonials: boolean; faq: boolean; contact: boolean; appointment: boolean;
    privacy: boolean; terms: boolean;
  };

  // Dynamic Content Lists
  stats: StatItem[];
  services: Service[];
  doctors: Doctor[];
  testimonials: Testimonial[];
  faqs: FAQItem[];
  gallery: GalleryItem[];
  
  // Appointment Settings
  appointmentSettings: AppointmentSettings;

  // SEO default info
  seo: {
    siteUrl?: string;
    defaultTitle: string;
    titleTemplate: string;
    defaultDescription: string;
    ogImage: string;
  };
}
