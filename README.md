# Universal Dental Clinic Website Template

A premium, agency-grade, production-quality commercial React template built for selling to dental clinics and practices. Engineered for ultra-fast re-branding (30–60 minutes per client site).

---

## ⚡ 30–60 Minute Client Customization Checklist

All clinic-specific content, credentials, phone numbers, image URLs, doctors, services, FAQs, and branding colors are centrally managed in:

```
src/config/clinic.ts
```

> **IMPORTANT ARCHITECTURAL RULE:**
> You do **NOT** need to edit any UI components or page files to launch a new clinic website.
> Edit `src/config/clinic.ts` and the entire website (Navbar, Hero, Footer, Pages, Forms, SEO meta tags, and Maps) updates automatically!

---

### Step-by-Step Customization Guide

#### Step 1: Practice Identity & Branding (5 mins)
Open `src/config/clinic.ts` and update the practice name and logo:
```typescript
name: "Apex Dental Care",
tagline: "Precision & Comfort in Every Smile",
logoText: "Apex",
logoSubtext: "Dental Care",
faviconUrl: "/favicon.svg",
```

#### Step 2: Contact Info & Emergency Lines (5 mins)
```typescript
phone: "+1 (555) 123-4567",
secondaryPhone: "+1 (555) 123-4568",
emergencyPhone: "+1 (555) 911-DENT",
email: "info@apexdental.com",
whatsapp: "15551234567", // Country code without + or spaces
whatsappMessage: "Hello! I would like to inquire about an appointment at Apex Dental Care.",
```

#### Step 3: Location & Embedded Google Map (5 mins)
```typescript
address: "100 Medical Plaza, Suite 400",
city: "Austin",
country: "USA",
postalCode: "78701",
mapsEmbedUrl: "https://www.google.com/maps/embed?pb=...", // Google Maps Embed URL
directionsUrl: "https://maps.google.com/?q=100+Medical+Plaza+Austin",
```

#### Step 4: Color Theme (2 mins)
Update Hex colors in `colors`:
```typescript
colors: {
  primary: "#0d9488",   // Accent Teal / Main Brand
  secondary: "#0f172a", // Deep Navy Header/Footer
  accent: "#0284c7",    // Soft Medical Blue
}
```

#### Step 5: Hero Headline & CTAs (5 mins)
```typescript
hero: {
  trustBadge: "Austin • Sample Location",
  headline: "Modern dental care, clearly presented.",
  subheadline: "Use this section to explain the clinic's verified services, location, and appointment process.",
  primaryCtaText: "Request an Appointment",
  secondaryCtaText: "Explore Our Services",
  heroImage: "https://images.unsplash.com/photo-...",
  ratingText: "Sample clinic presentation",
  satisfactionText: "Clear information • Direct contact • Appointment requests",
  trustIndicators: [
    "Clinic-approved credentials",
    "Verified treatment information",
    "Convenient contact options",
    "Appointment requests"
  ]
}
```

#### Step 6: Dental Services Catalog (10 mins)
Modify the `services` array. Each service accepts:
- `id`: URL slug (`/services/dental-implants`)
- `title`: Display name
- `category`: `'General' | 'Cosmetic' | 'Surgical' | 'Orthodontics' | 'Pediatric' | 'Emergency'`
- `shortDescription`, `fullDescription`
- `iconName`: Any Lucide React icon name (`'Smile'`, `'Sparkles'`, `'Anchor'`, `'Sun'`, `'ShieldAlert'`)
- `duration`, `priceRange`, `benefits`, `procedures`

#### Step 7: Doctors & Clinical Specialists (10 mins)
Modify the `doctors` array with real doctor photos, titles, qualifications, and specialties.

#### Step 8: Replace Image Assets (5 mins)
Replace Unsplash photo URLs in `src/config/clinic.ts` with client-provided practice photos or local files stored in the `public/` directory.

---

## 🚀 Building & Deployment

### 1. Local Development
```bash
npm install
npm run dev
```

### 2. Production Build
```bash
npm run build
```
Outputs static assets to `dist/` ready for hosting on Vercel, Netlify, Cloudflare Pages, or static web servers.

---

## 🛠 Tech Stack Overview

- **Framework:** React 18
- **Build System:** Vite
- **Language:** TypeScript
- **Styling:** Tailwind CSS + CSS Variables
- **Icons:** Lucide React (`lucide-react`)
- **Router:** React Router 7 (`react-router-dom`)

---

## 📜 Commercial License
Commercial Reusable Template. Authorized for customization and sale to commercial dental practices.


## Production checklist

### Clinic configuration
Edit `src/config/clinic.ts` for brand, contact, visual, gallery, FAQ, and SEO defaults.
The live doctor/service catalog and appointment availability are served from Supabase when configured. Replace all sample/demo records in Supabase before a real launch.

### SEO
Set `VITE_SITE_URL` to the permanent production origin. The app generates canonical URLs from that value (or the current origin when it is not set), and `npm run build` regenerates the sitemap.

### Appointment requests
The website submits an appointment **request**, not an automatic confirmation. The clinic confirms availability and timing after receiving the request. Server-side validation, rate limiting, schedule checks, interval-overlap protection, and audit logging remain enabled.

### Supabase
Use the production schema in `supabase/schema.sql` and the Edge Functions in `supabase/functions/`. Keep service-role credentials server-side only. Configure `ALLOWED_ORIGINS` to the exact production domain(s).

### Local development
```bash
npm ci
npm run dev
```

### Quality checks
```bash
npm run lint
npm test
npm run build
npm run audit
```

### Demo data
The included catalog is intentionally marked as sample/demo content. Replace sample doctors, services, prices, images, reviews, hours, and contact details with clinic-approved information before launch.
