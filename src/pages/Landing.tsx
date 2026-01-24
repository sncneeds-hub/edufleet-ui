import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { VehicleCard } from '@/components/VehicleCard';
import { JobCard } from '@/components/JobCard';
import { SupplierCard } from '@/components/SupplierCard';
import { Skeleton } from '@/components/ui/skeleton';
import { usePriorityListings } from '@/hooks/useApi';
import { 
  ArrowRight, MapPin, Search, Truck, Briefcase, 
  Building2, GraduationCap, Users, Megaphone, 
  BookOpen, Calculator, Calendar
} from 'lucide-react';
import { api } from '@/api';
import { AdSlot } from '@/components/ads/AdSlot';
import { PricingSection } from '@/components/PricingSection';
import { useAuth } from '@/context/AuthContext';

export function Landing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isTeacher = user?.role === 'teacher';
  const { listings: priorityListings = [], loading: priorityLoading } = usePriorityListings();
  
  // Handle hash scroll
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === '#pricing') {
      const element = document.getElementById('pricing');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [window.location.hash]);

  // State for jobs and suppliers from API
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [featuredSuppliers, setFeaturedSuppliers] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [suppliersLoading, setSuppliersLoading] = useState(true);

  // Search state
  const [location, setLocation] = useState('Mumbai');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch featured jobs and suppliers on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch top 4 jobs
        const jobsResponse = await api.jobs.getFeaturedJobs(4);
        setFeaturedJobs(jobsResponse.data ?? []);
      } catch (error) {
        console.error('Failed to load jobs:', error);
        setFeaturedJobs([]);
      } finally {
        setJobsLoading(false);
      }

      try {
        // Fetch top 4 suppliers
        const suppliersResponse = await api.suppliers.getSuppliers({ pageSize: 4, page: 1 });
        setFeaturedSuppliers(suppliersResponse.data?.items ?? []);
      } catch (error) {
        console.error('Failed to load suppliers:', error);
        setFeaturedSuppliers([]);
      } finally {
        setSuppliersLoading(false);
      }
    }

    fetchData();
  }, []);

  const handleSearch = () => {
    // Basic routing logic based on search
    if (searchQuery.toLowerCase().includes('job')) {
      navigate('/jobs');
    } else if (searchQuery.toLowerCase().includes('supplier')) {
      navigate('/suppliers');
    } else {
      navigate('/browse');
    }
  };

  const quickLinks = [
    { icon: Truck, label: 'School Buses', path: '/browse', color: 'text-blue-600', bg: 'bg-blue-50' },
    { icon: Briefcase, label: 'Teaching Jobs', path: '/jobs', color: 'text-orange-600', bg: 'bg-orange-50' },
    { icon: Building2, label: 'Suppliers', path: '/suppliers', color: 'text-green-600', bg: 'bg-green-50' },
    { icon: Users, label: 'Staff Hiring', path: '/jobs', color: 'text-purple-600', bg: 'bg-purple-50' },
    { icon: GraduationCap, label: 'Institutes', path: '/signup', color: 'text-red-600', bg: 'bg-red-50' },
    { icon: Megaphone, label: 'Advertise', path: '/signup', color: 'text-yellow-600', bg: 'bg-yellow-50' },
    { icon: BookOpen, label: 'Books', path: '/suppliers', color: 'text-teal-600', bg: 'bg-teal-50' },
    { icon: Calendar, label: 'Events', path: '/browse', color: 'text-indigo-600', bg: 'bg-indigo-50' }, // Placeholder
  ];

  return (
    <div className="min-h-screen bg-background font-sans noise-bg relative">
      
      {/* Hero Section - Professional Premium Design */}
      <section className="relative pt-28 pb-40 md:pt-44 md:pb-60 overflow-hidden">
        {/* Professional Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://v3b.fal.media/files/b/0a8b3c54/2hCADZMTxkHVX4wRB75ZE.png" 
            alt="Educational Marketplace" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-secondary/70 backdrop-blur-[2px]"></div>
        </div>

        {/* Premium Background Elements */}
        <div className="absolute inset-0 opacity-[0.1] z-[1]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_0.5px,transparent_0.5px)] [background-size:24px_24px]"></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-[1]">
          <div className="absolute top-10 -left-20 w-[500px] h-[500px] bg-secondary/30 rounded-full blur-[120px] animate-float"></div>
          <div className="absolute bottom-10 -right-20 w-[600px] h-[600px] bg-accent/20 rounded-full blur-[140px] animate-float delay-1000"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 lg:px-6 text-center">
          {/* Premium Trust Badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-6 py-2.5 mb-10 animate-in-fade shadow-xl">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_12px_rgba(34,197,94,0.8)]"></div>
            <span className="text-white/95 text-sm font-semibold tracking-wide">Trusted by 5,000+ Educational Institutes</span>
          </div>

          {/* Professional Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-8xl font-display font-bold text-white mb-8 tracking-tighter leading-[1] animate-in-slide-up">
            India's Leading
            <br className="md:hidden" />
            <span className="text-accent italic"> Education </span>
            <br />
            <span className="relative inline-block">
              Marketplace
              <span className="absolute -bottom-3 left-0 w-full h-1.5 bg-gradient-to-r from-accent via-accent-light to-transparent rounded-full shadow-glow"></span>
            </span>
          </h1>
          
          <p className="text-white/90 mb-16 text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto font-medium leading-relaxed animate-in-slide-up delay-100">
            Connect with <span className="font-bold text-white border-b-2 border-accent/50 pb-0.5">Vehicles</span>, <span className="font-bold text-white border-b-2 border-accent/50 pb-0.5">Jobs</span>, <span className="font-bold text-white border-b-2 border-accent/50 pb-0.5">Suppliers</span> & <span className="font-bold text-white border-b-2 border-accent/50 pb-0.5">Teachers</span>
            <br className="hidden md:block" />
            <span className="text-white/80 mt-2 block">The Definitive Resource for Modern Educational Infrastructure</span>
          </p>

          {/* Professional Search Box */}
          <div className="max-w-5xl mx-auto bg-white/95 backdrop-blur-sm rounded-2xl shadow-[0_30px_100px_rgba(0,0,0,0.4)] p-3 flex flex-col md:flex-row gap-2 animate-in-scale delay-200 border border-white/20 ring-1 ring-black/5">
            {/* Location Input */}
            <div className="relative md:w-[28%]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70">
                <MapPin className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-4 outline-none text-foreground font-semibold bg-transparent placeholder:text-muted-foreground rounded-xl focus:bg-muted/50 transition-colors"
                placeholder="Mumbai, India"
              />
            </div>
            
            {/* Vertical Divider */}
            <div className="hidden md:block w-px bg-border/60 self-stretch my-2"></div>
            
            {/* Main Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/70">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-4 outline-none text-foreground font-semibold bg-transparent placeholder:text-muted-foreground rounded-xl focus:bg-muted/50 transition-colors"
                placeholder="Try: School Bus, Math Teacher, Lab Equipment..."
              />
            </div>

            {/* Search Button */}
            <div className="md:w-44 flex items-center">
              <Button 
                onClick={handleSearch}
                variant="accent"
                size="lg"
                className="w-full font-bold text-base rounded-xl flex items-center justify-center gap-2 min-h-[58px] shadow-lg hover:shadow-accent/30 transition-all active:scale-95"
              >
                Search
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Professional Popular Searches */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 animate-in-fade delay-300">
            <span className="text-white/80 text-sm font-semibold">Popular:</span>
            {['School Buses', 'Teaching Jobs', 'Lab Suppliers', 'Textbooks'].map((term, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(term);
                  handleSearch();
                }}
                className="px-5 py-2 bg-white/15 hover:bg-white/25 backdrop-blur-sm border border-white/30 rounded-full text-white text-sm font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Professional Quick Links Card */}
          <div className="max-w-6xl mx-auto mt-24 md:mt-28 animate-in-slide-up delay-400">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-10 md:p-12 relative hover:shadow-[0_30px_100px_rgba(0,0,0,0.2)] transition-all duration-300">
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary via-primary-light to-secondary px-10 py-3.5 rounded-full shadow-xl">
                <span className="text-sm font-bold text-white tracking-wide uppercase">Explore Everything</span>
              </div>
              <div className="grid grid-cols-4 md:grid-cols-8 gap-y-10 gap-x-4 md:gap-x-6">
                {quickLinks.map((link, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => navigate(link.path)}
                    className="flex flex-col items-center gap-3 cursor-pointer group"
                  >
                    <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl ${link.bg} flex items-center justify-center transition-all duration-300 group-hover:-translate-y-3 group-hover:shadow-xl border-2 border-transparent group-hover:border-white shadow-sm`}>
                      <link.icon className={`w-8 h-8 md:w-10 md:h-10 ${link.color} transition-transform duration-300 group-hover:scale-110`} />
                    </div>
                    <span className="text-xs md:text-sm font-semibold text-gray-700 text-center group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {link.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Top Banner Ad (Below Hero) */}
      <div className="container mx-auto px-4 py-8">
        <AdSlot placement="LP_TOP_BANNER" variant="banner" />
      </div>

          {/* Feature Section 1: Vehicles - Hidden for Teachers */}
          {!isTeacher && (
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="container mx-auto px-4 py-16"
            >
              <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-5">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Truck className="w-8 h-8 text-primary" />
                    Premium Vehicles
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium">Verified transport options for your institute</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/browse')} 
                  className="rounded-full border-primary/20 text-primary hover:bg-primary/5 px-6"
                >
                  View All Vehicles
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {priorityLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-full h-[380px] rounded-2xl" />
                  ))
                ) : priorityListings.length > 0 ? (
                  priorityListings.slice(0, 4).map((vehicle, idx) => (
                    <motion.div 
                      key={vehicle.id || (vehicle as any)._id} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="h-full"
                    >
                      <VehicleCard vehicle={vehicle} />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center col-span-full py-12 bg-muted/30 rounded-2xl">No featured listings available</p>
                )}
              </div>
            </motion.section>
          )}

          {/* Feature Section 2: Jobs */}
          <motion.section 
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="bg-slate-50 py-10"
          >
            <div className="container mx-auto px-4">
              <div className="flex items-center justify-between mb-10 border-b border-gray-200 pb-5">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Briefcase className="w-8 h-8 text-orange-600" />
                    Hot Jobs
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium">Exciting career opportunities in top institutes</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/jobs')} 
                  className="rounded-full border-orange-200 text-orange-600 hover:bg-orange-50 px-6"
                >
                  Explore Jobs
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(192px,1fr))] gap-6">
                {jobsLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-[192px] h-[192px] rounded-lg" />
                  ))
                ) : featuredJobs.length > 0 ? (
                  featuredJobs.map((job, idx) => (
                    <motion.div 
                      key={job.id || (job as any)._id} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                      <JobCard 
                        job={job} 
                        className="shadow-sm hover:shadow-md transition-all bg-white"
                      />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center col-span-full py-12 bg-white/50 rounded-2xl border-2 border-dashed border-gray-200">No jobs available</p>
                )}
              </div>
            </div>
          </motion.section>

          {/* Feature Section 3: Suppliers - Hidden for Teachers */}
          {!isTeacher && (
            <motion.section 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="container mx-auto px-4 py-10"
            >
              <div className="flex items-center justify-between mb-10 border-b border-gray-100 pb-5">
                <div className="flex flex-col gap-1">
                  <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                    <Building2 className="w-8 h-8 text-green-600" />
                    Top Suppliers
                  </h2>
                  <p className="text-muted-foreground text-sm font-medium">Reliable vendors for all your institute needs</p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/suppliers')} 
                  className="rounded-full border-green-200 text-green-600 hover:bg-green-50 px-6"
                >
                  Find Suppliers
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid grid-cols-[repeat(auto-fill,minmax(192px,1fr))] gap-6">
                {suppliersLoading ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="w-[192px] h-[192px] rounded-lg" />
                  ))
                ) : featuredSuppliers.length > 0 ? (
                  featuredSuppliers.map((supplier, idx) => (
                    <motion.div 
                      key={supplier.id || (supplier as any)._id} 
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                    >
                      <SupplierCard supplier={supplier} />
                    </motion.div>
                  ))
                ) : (
                  <p className="text-muted-foreground text-center col-span-full py-12 bg-muted/30 rounded-2xl">No suppliers available</p>
                )}
              </div>
            </motion.section>
          )}

      {/* Inline Ad */}
      <div className="container mx-auto px-4 pb-12">
        <AdSlot placement="LP_INLINE_1" variant="banner" />
      </div>

      {/* Pricing Section */}
      <PricingSection />

      {/* CTA Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">List your Business on EduFleet</h2>
          <p className="text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Reach thousands of educational institutes and students. Join India's fastest growing education marketplace.
          </p>
          <Button 
            size="lg" 
            variant="secondary" 
            className="font-bold px-8 h-12"
            onClick={() => navigate('/signup')}
          >
            Start Selling Today
          </Button>
        </div>
      </section>
    </div>
  );
}
