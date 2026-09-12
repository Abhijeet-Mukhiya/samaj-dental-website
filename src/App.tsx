import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ScrollToTop } from './components/layout/ScrollToTop';
import { TopBar } from './components/layout/TopBar';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { StickyActionBar } from './components/layout/StickyActionBar';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { clinicConfig } from './config/clinic';
import { isSiteSectionEnabled } from './config/siteSections';
const HomePage = lazy(() => import('./pages/HomePage').then(m => ({ default: m.HomePage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then(m => ({ default: m.AboutPage })));
const ServicesPage = lazy(() => import('./pages/ServicesPage').then(m => ({ default: m.ServicesPage })));
const ServiceDetailPage = lazy(() => import('./pages/ServiceDetailPage').then(m => ({ default: m.ServiceDetailPage })));
const DoctorsPage = lazy(() => import('./pages/DoctorsPage').then(m => ({ default: m.DoctorsPage })));
const DoctorDetailPage = lazy(() => import('./pages/DoctorDetailPage').then(m => ({ default: m.DoctorDetailPage })));
const GalleryPage = lazy(() => import('./pages/GalleryPage').then(m => ({ default: m.GalleryPage })));
const TestimonialsPage = lazy(() => import('./pages/TestimonialsPage').then(m => ({ default: m.TestimonialsPage })));
const FAQPage = lazy(() => import('./pages/FAQPage').then(m => ({ default: m.FAQPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then(m => ({ default: m.ContactPage })));
const AppointmentPage = lazy(() => import('./pages/AppointmentPage').then(m => ({ default: m.AppointmentPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));
const PrivacyPage = lazy(() => import('./pages/PrivacyPage').then(m => ({ default: m.PrivacyPage })));
const TermsPage = lazy(() => import('./pages/TermsPage').then(m => ({ default: m.TermsPage })));

const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage').then(module => ({ default: module.AdminDashboardPage })));

function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-navy-900 font-sans antialiased pb-16 md:pb-0">
      <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-lg focus:bg-navy-950 focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-white focus:shadow-xl">
        Skip to main content
      </a>
      {clinicConfig.demoNotice && (
        <div className="bg-navy-950 px-4 py-2 text-center text-[11px] font-semibold tracking-wide text-slate-200" role="note">
          {clinicConfig.demoNotice}
        </div>
      )}
      <TopBar />
      <Navbar />
      <main id="main-content" className="flex-1">
        <Routes>
          <Route path="/" element={<HomePage />} />
          {isSiteSectionEnabled('about') && <Route path="/about" element={<AboutPage />} />}
          {isSiteSectionEnabled('services') && (
            <>
              <Route path="/services" element={<ServicesPage />} />
              <Route path="/services/:id" element={<ServiceDetailPage />} />
            </>
          )}
          {isSiteSectionEnabled('doctors') && (
            <>
              <Route path="/doctors" element={<DoctorsPage />} />
              <Route path="/doctors/:id" element={<DoctorDetailPage />} />
            </>
          )}
          {isSiteSectionEnabled('gallery') && <Route path="/gallery" element={<GalleryPage />} />}
          {isSiteSectionEnabled('testimonials') && <Route path="/testimonials" element={<TestimonialsPage />} />}
          {isSiteSectionEnabled('faq') && <Route path="/faq" element={<FAQPage />} />}
          {isSiteSectionEnabled('contact') && <Route path="/contact" element={<ContactPage />} />}
          {isSiteSectionEnabled('appointment') && <Route path="/appointment" element={<AppointmentPage />} />}
          {isSiteSectionEnabled('privacy') && <Route path="/privacy" element={<PrivacyPage />} />}
          {isSiteSectionEnabled('terms') && <Route path="/terms" element={<TermsPage />} />}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <StickyActionBar />
    </div>
  );
}

export function App() {
  return (
    <ErrorBoundary>
      <Router>
        <ScrollToTop />
        <Suspense fallback={
          <div className="min-h-screen grid place-items-center bg-slate-900 text-white text-sm font-semibold">
            Loading Samaj Dental Care Clinic...
          </div>
        }>
          <Routes>
            <Route path="/admin/*" element={<AdminDashboardPage />} />
            <Route path="/*" element={<PublicLayout />} />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
