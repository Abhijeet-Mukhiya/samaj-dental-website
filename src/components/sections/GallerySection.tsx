import React, { useState } from 'react';
import { Eye, Maximize2 } from 'lucide-react';
import { clinicConfig } from '../../config/clinic';
import { SectionHeading } from '../ui/SectionHeading';
import { LightboxModal } from '../ui/LightboxModal';
import { GalleryItem } from '../../types/clinic';

export const GallerySection: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeImageIndex, setActiveImageIndex] = useState<number | null>(null);

  const categories = ['All', 'Clinic & Facilities', 'Equipment & Tech', 'Patient Comfort', 'Treatments'];

  const filteredGallery = clinicConfig.gallery.filter((item) => {
    if (selectedCategory === 'All') return true;
    return item.category === selectedCategory;
  });

  const handlePrev = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((prev) => (prev === 0 ? filteredGallery.length - 1 : (prev as number) - 1));
    }
  };

  const handleNext = () => {
    if (activeImageIndex !== null) {
      setActiveImageIndex((prev) => (prev === filteredGallery.length - 1 ? 0 : (prev as number) + 1));
    }
  };

  const currentItem: GalleryItem | undefined = activeImageIndex !== null ? filteredGallery[activeImageIndex] : undefined;

  return (
    <section className="py-20 bg-slate-50/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeading
          badgeText="Our Practice Showcase"
          title="Explore the clinic showcase"
          subtitle="Clinic and treatment images shown here are demo placeholders and should be replaced with clinic-approved photos before launch."
        />

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-12">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${
                selectedCategory === cat
                  ? 'bg-navy-900 text-white shadow-md'
                  : 'bg-white text-navy-700 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredGallery.map((item, idx) => (
            <button
              type="button"
              key={item.id}
              onClick={() => setActiveImageIndex(idx)}
              aria-label={`Expand ${item.title}`}
              className="group relative w-full text-left rounded-2xl overflow-hidden shadow-soft border border-slate-100 bg-slate-100 cursor-pointer aspect-[4/3] transform hover:-translate-y-1 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
            >
              <img
                src={item.image}
                alt={item.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                loading="lazy"
              />

              {/* Overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-t from-navy-950/80 via-navy-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-6 flex flex-col justify-end text-white">
                <span className="text-xs font-semibold text-brand-400 uppercase tracking-wider mb-1">
                  {item.category}
                </span>
                <h4 className="font-serif font-bold text-lg">{item.title}</h4>
                {item.caption && (
                  <p className="text-xs text-slate-300 line-clamp-2 mt-1">{item.caption}</p>
                )}
                <div className="mt-3 flex items-center space-x-1 text-xs font-semibold text-white/90">
                  <Maximize2 size={14} className="text-brand-400" />
                  <span>Click to expand</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Lightbox Modal */}
        {currentItem && (
          <LightboxModal
            isOpen={activeImageIndex !== null}
            imageSrc={currentItem.image}
            title={currentItem.title}
            caption={currentItem.caption}
            onClose={() => setActiveImageIndex(null)}
            onPrev={filteredGallery.length > 1 ? handlePrev : undefined}
            onNext={filteredGallery.length > 1 ? handleNext : undefined}
          />
        )}
      </div>
    </section>
  );
};
