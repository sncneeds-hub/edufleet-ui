import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export function Landing() {
  const navigate = useNavigate();
  const { listings: priorityListings = [], loading: priorityLoading } = usePriorityListings();
  
  // State for jobs and suppliers from API
  const [featuredJobs, setFeaturedJobs] = useState<any[]>([]);
  const [featuredSuppliers, setFeaturedSuppliers] = useState<any[]>([]);
  const [jobsLoading, setJobsLoading] = useState(true);
  const [suppliersLoading, setSuppliersLoading] = useState(true);

  // Search state
  const [location, setLocation] = useState('Mumbai'); // Mock default
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch featured jobs and suppliers on mount
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch top 4 jobs
        const jobsResponse = await api.jobs.getFeaturedJobs(4);
        setFeaturedJobs(jobsResponse.data);
      } catch (error) {
        console.error('Failed to load jobs:', error);
      } finally {
        setJobsLoading(false);
      }

      try {
        // Fetch top 4 suppliers
        const suppliersResponse = await api.suppliers.getSuppliers({ pageSize: 4, page: 1 });
        setFeaturedSuppliers(suppliersResponse.data.items);
      } catch (error) {
        console.error('Failed to load suppliers:', error);
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
    <div className="min-h-screen bg-background font-sans">
      
      {/* Hero Section - Enhanced Modern Design */}
      <section className="relative pt-24 pb-36 md:pt-40 md:pb-56 bg-gradient-primary overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]"></div>
          <div className="absolute top-0 -left-4 w-72 h-72 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 -right-4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 text-center">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-6 py-2 mb-8 animate-in-fade">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-white/90 text-sm font-medium">Trusted by 5,000+ Educational Institutes</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight drop-shadow-2xl font-display animate-in-slide-up leading-tight">
            India's Leading <span className="text-accent">Education</span>
            <br className="hidden md:block" />
            <span className="text-gradient bg-gradient-to-r from-white to-white/70 bg-clip-text">Marketplace</span>
          </h1>
          
          <p className="text-white/90 mb-12 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed animate-in-slide-up delay-100">
            Connect with <span className="font-bold text-white">Vehicles</span>, <span className="font-bold text-white">Jobs</span>, <span className="font-bold text-white">Suppliers</span> & <span className="font-bold text-white">Teachers</span>
            <br className="hidden md:block" />
            All in One Platform for Educational Institutes
          </p>

          {/* Enhanced Search Box with Animation */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-[0_20px_70px_rgba(0,0,0,0.3)] p-3 flex flex-col md:flex-row gap-2 md:gap-0 md:divide-x divide-gray-200 animate-in-scale delay-200 hover:shadow-[0_25px_90px_rgba(0,0,0,0.35)] transition-all duration-300">
            {/* Location Input */}
            <div className="relative md:w-[30%]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-4 outline-none text-gray-700 font-medium bg-transparent placeholder:text-gray-400 rounded-xl focus:bg-gray-50/50 transition-colors"
                placeholder="Mumbai, India"
              />
            </div>
            
            {/* Main Search Input */}
            <div className="relative flex-1">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="w-full pl-12 pr-4 py-4 outline-none text-gray-700 font-medium bg-transparent placeholder:text-gray-400 rounded-xl focus:bg-gray-50/50 transition-colors"
                placeholder="Try: School Bus, Math Teacher, Lab Equipment..."
              />
            </div>

            {/* Search Button */}
            <div className="p-1 md:w-36 flex items-center">
              <Button 
                onClick={handleSearch}
                className="w-full h-full bg-accent hover:bg-accent/90 text-white font-bold text-base md:text-lg rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2 min-h-[52px]"
              >
                Search
                <ArrowRight className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Popular Searches */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3 animate-in-fade delay-300">
            <span className="text-white/70 text-sm font-medium">Popular:</span>
            {['School Buses', 'Teaching Jobs', 'Lab Suppliers', 'Textbooks'].map((term, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setSearchQuery(term);
                  handleSearch();
                }}
                className="px-4 py-1.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-full text-white text-sm font-medium transition-all duration-200 hover:scale-105"
              >
                {term}
              </button>
            ))}
          </div>

          {/* Quick Links Grid - Enhanced Floating Card */}
          <div className="max-w-6xl mx-auto mt-20 md:mt-24 animate-in-slide-up delay-400">
            <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-gray-100 p-8 md:p-10 relative hover:shadow-[0_25px_80px_rgba(0,0,0,0.2)] transition-all duration-300">
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-primary to-secondary px-8 py-3 rounded-full shadow-lg text-sm font-bold text-white tracking-wide uppercase">
                Explore Everything
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

      {/* Feature Section 1: Vehicles */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Truck className="w-6 h-6 text-primary" />
            Premium Vehicles
          </h2>
          <Button variant="link" onClick={() => navigate('/browse')} className="text-primary">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {priorityLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-[350px] rounded-lg" />
            ))
          ) : priorityListings.length > 0 ? (
            priorityListings.slice(0, 4).map((vehicle) => (
              <div key={vehicle.id} className="h-full">
                <VehicleCard vehicle={vehicle} />
              </div>
            ))
          ) : (
            <p className="text-muted-foreground text-center col-span-full py-8">No featured listings available</p>
          )}
        </div>
      </section>

      {/* Feature Section 2: Jobs */}
      <section className="bg-slate-50 py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-orange-600" />
              Hot Jobs
            </h2>
            <Button variant="link" onClick={() => navigate('/jobs')} className="text-orange-600">
              View All
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {jobsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="w-full h-[180px] rounded-lg" />
              ))
            ) : (
              featuredJobs.map((job) => (
                <div key={job.id} className="h-full">
                  <JobCard 
                    job={job} 
                    style={{ width: '100%', height: '100%' }} 
                    className="w-full h-full shadow-sm hover:shadow-md transition-shadow bg-white"
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Feature Section 3: Suppliers */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <Building2 className="w-6 h-6 text-green-600" />
            Top Suppliers
          </h2>
          <Button variant="link" onClick={() => navigate('/suppliers')} className="text-green-600">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {suppliersLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="w-full h-48 rounded-lg" />
            ))
          ) : (
            featuredSuppliers.map((supplier) => (
              <SupplierCard key={supplier.id} supplier={supplier} />
            ))
          )}
        </div>
      </section>

      {/* Inline Ad */}
      <div className="container mx-auto px-4 pb-12">
        <AdSlot placement="LP_INLINE_1" variant="banner" />
      </div>

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
