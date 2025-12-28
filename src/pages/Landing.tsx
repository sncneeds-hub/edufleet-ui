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
    <div className="min-h-screen bg-background font-sans">
      
      {/* Hero Section - Professional Premium Design */}
      <section className="relative pt-28 pb-40 md:pt-44 md:pb-60 bg-gradient-hero overflow-hidden">
        {/* Premium Background Elements */}
        <div className="absolute inset-0 opacity-[0.07]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,#ffffff_0.5px,transparent_0.5px)] [background-size:24px_24px]"></div>
        </div>
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
          <div className="absolute top-10 -left-20 w-[500px] h-[500px] bg-secondary/20 rounded-full blur-[120px] animate-float"></div>
          <div className="absolute bottom-10 -right-20 w-[600px] h-[600px] bg-accent/15 rounded-full blur-[140px] animate-float delay-1000"></div>
        </div>
        
        <div className="container relative z-10 mx-auto px-4 lg:px-6 text-center">
          {/* Premium Trust Badge */}
          <div className="inline-flex items-center gap-2.5 bg-white/15 backdrop-blur-md border border-white/25 rounded-full px-6 py-2.5 mb-10 animate-in-fade shadow-lg">
            <div className="w-2 h-2 bg-success rounded-full animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
            <span className="text-white/95 text-sm font-semibold">Trusted by 5,000+ Educational Institutes</span>
          </div>

          {/* Professional Main Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-7 tracking-tight leading-[1.1] animate-in-slide-up">
            India's Leading
            <br className="md:hidden" />
            <span className="text-accent"> Education </span>
            <br />
            <span className="relative inline-block">
              Marketplace
              <span className="absolute -bottom-2 left-0 w-full h-1 bg-gradient-to-r from-accent via-accent-light to-transparent rounded-full"></span>
            </span>
          </h1>
          
          <p className="text-white/90 mb-14 text-lg md:text-xl lg:text-2xl max-w-4xl mx-auto font-medium leading-relaxed animate-in-slide-up delay-100">
            Connect with <span className="font-bold text-white">Vehicles</span>, <span className="font-bold text-white">Jobs</span>, <span className="font-bold text-white">Suppliers</span> & <span className="font-bold text-white">Teachers</span>
            <br className="hidden md:block" />
            <span className="text-white/80">All in One Platform for Educational Institutes</span>
          </p>

          {/* Professional Search Box */}
          <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-2xl p-2.5 flex flex-col md:flex-row gap-2 animate-in-scale delay-200 hover:shadow-[0_30px_90px_rgba(0,0,0,0.25)] transition-all duration-300 border border-gray-100">
            {/* Location Input */}
            <div className="relative md:w-[28%]">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary">
                <MapPin className="w-5 h-5" />
              </div>
              <input 
                type="text" 
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full pl-12 pr-4 py-4 outline-none text-foreground font-medium bg-transparent placeholder:text-muted-foreground rounded-xl focus:bg-muted/30 transition-colors"
                placeholder="Mumbai, India"
              />
            </div>
            
            {/* Vertical Divider */}
            <div className="hidden md:block w-px bg-border self-stretch my-2"></div>
            
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
                className="w-full pl-12 pr-4 py-4 outline-none text-foreground font-medium bg-transparent placeholder:text-muted-foreground rounded-xl focus:bg-muted/30 transition-colors"
                placeholder="Try: School Bus, Math Teacher, Lab Equipment..."
              />
            </div>

            {/* Search Button */}
            <div className="md:w-40 flex items-center">
              <Button 
                onClick={handleSearch}
                variant="accent"
                size="lg"
                className="w-full font-bold text-base rounded-xl flex items-center justify-center gap-2 min-h-[56px]"
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
              <div key={vehicle.id || (vehicle as any)._id} className="h-full">
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
            ) : featuredJobs.length > 0 ? (
              featuredJobs.map((job) => (
                <div key={job.id || (job as any)._id} className="h-full">
                  <JobCard 
                    job={job} 
                    style={{ width: '100%', height: '100%' }} 
                    className="w-full h-full shadow-sm hover:shadow-md transition-shadow bg-white"
                  />
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center col-span-full py-8">No jobs available</p>
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
          ) : featuredSuppliers.length > 0 ? (
            featuredSuppliers.map((supplier) => (
              <SupplierCard key={supplier.id || (supplier as any)._id} supplier={supplier} />
            ))
          ) : (
            <p className="text-muted-foreground text-center col-span-full py-8">No suppliers available</p>
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
