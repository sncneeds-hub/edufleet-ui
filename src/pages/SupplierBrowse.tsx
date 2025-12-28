import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { SupplierCard } from '@/components/SupplierCard';
import { Card } from '@/components/ui/card';
import { Search, Building2, Filter, Sliders, CheckCircle, Calendar, Users, Award, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { getSuppliers } from '@/api/services/supplierService';
import { Supplier, SupplierFilters } from '@/api/types';
import { categoryLabels } from '@/constants/categories';
import { Spinner } from '@/components/ui/spinner';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AdSlot } from '@/components/ads/AdSlot';

export function SupplierBrowse() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<SupplierFilters>({
    searchTerm: '',
    category: '',
    isVerified: undefined
  });
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer if exists
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    
    // Set new timer for debounced search
    const timer = setTimeout(() => {
      loadSuppliers();
    }, 300);
    
    setDebounceTimer(timer);
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [filters]);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      const response = await getSuppliers({ ...filters, status: 'approved' });
      // Handle both paginated and array responses
      if (response.data && Array.isArray(response.data.items)) {
        setSuppliers(response.data.items);
      } else if (Array.isArray(response.data)) {
        setSuppliers(response.data);
      } else {
        setSuppliers([]);
      }
    } catch (error) {
      toast.error('Failed to load suppliers');
      console.error(error);
      setSuppliers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters(prev => ({ ...prev, searchTerm: value }));
  };

  const handleCategoryChange = (value: string) => {
    setFilters(prev => ({ ...prev, category: value === 'all' ? '' : value }));
  };

  const handleVerifiedFilter = (value: string) => {
    setFilters(prev => ({
      ...prev,
      isVerified: value === 'all' ? undefined : value === 'verified'
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      searchTerm: '',
      category: '',
      isVerified: undefined
    });
  };

  const hasActiveFilters = filters.searchTerm || filters.category || filters.isVerified !== undefined;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 flex items-center gap-3">
            <Building2 className="w-10 h-10 md:w-12 md:h-12" />
            Suppliers Directory
          </h1>
          <p className="text-lg text-white/85 max-w-2xl font-light">
            Connect with verified education-related suppliers and service providers for your institution.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-8">
        {/* Top Ad */}
        <div className="mb-8">
          <AdSlot placement="LP_TOP_BANNER" variant="banner" />
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4 space-y-6">
            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                <Search className="text-primary w-4 h-4" />
              </div>
              <Input
                placeholder="Search suppliers..."
                value={filters.searchTerm}
                onChange={e => handleSearch(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            {/* Filters Card */}
            <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-primary" />
                  <h3 className="font-bold text-foreground">Filters</h3>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Category</label>
                  <Select value={filters.category || 'all'} onValueChange={handleCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {Object.entries(categoryLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Verification</label>
                  <Select
                    value={
                      filters.isVerified === undefined
                        ? 'all'
                        : filters.isVerified
                        ? 'verified'
                        : 'unverified'
                    }
                    onValueChange={handleVerifiedFilter}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="All Suppliers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Suppliers</SelectItem>
                      <SelectItem value="verified">Verified Only</SelectItem>
                      <SelectItem value="unverified">Unverified</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Sidebar Ad */}
            <AdSlot placement="LIST_SIDEBAR" variant="sidebar" />
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <p className="text-lg text-foreground font-semibold">
                  Found <span className="text-primary font-bold">{suppliers.length}</span> {suppliers.length === 1 ? 'supplier' : 'suppliers'}
                </p>
                {hasActiveFilters && (
                  <p className="text-sm text-muted-foreground">Filtered results</p>
                )}
              </div>
              <div className="text-xs text-muted-foreground bg-muted px-3 py-1 rounded-full">
                Showing verified and trusted suppliers
              </div>
            </div>

            {/* Loading & Results */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <Spinner size="lg" />
              </div>
            ) : suppliers.length === 0 ? (
              <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
                <Filter className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No suppliers found</h3>
                <p className="text-muted-foreground mb-6">Try adjusting your filters</p>
                <Button variant="outline" onClick={handleClearFilters}>
                  Clear Filters
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {suppliers.map((supplier, index) => (
                    <div key={supplier.id || (supplier as any)._id} className="animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                      <SupplierCard
                        supplier={supplier}
                        onViewDetails={() => setSelectedSupplier(supplier)}
                      />
                    </div>
                  ))}
                </div>
                
                {/* Inline Ad after results */}
                <div className="mt-8">
                   <AdSlot placement="LP_INLINE_1" variant="banner" />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Supplier Details Dialog */}
      <Dialog open={!!selectedSupplier} onOpenChange={() => setSelectedSupplier(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedSupplier && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-3">
                  {selectedSupplier.logo ? (
                    <img
                      src={selectedSupplier.logo}
                      alt={selectedSupplier.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {selectedSupplier.name}
                      {selectedSupplier.isVerified && (
                        <CheckCircle className="w-5 h-5 text-green-500" title="Verified" />
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs mt-1">
                      {categoryLabels[selectedSupplier.category] || selectedSupplier.category}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6 mt-4">
                {/* Stats */}
                <div className="flex items-center gap-6 text-sm">
                  {selectedSupplier.yearsInBusiness && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedSupplier.yearsInBusiness} years in business</span>
                    </div>
                  )}
                  {selectedSupplier.clientCount && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedSupplier.clientCount}+ clients</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold mb-2">About</h4>
                  <p className="text-sm text-muted-foreground">{selectedSupplier.description}</p>
                </div>

                {/* Services */}
                {selectedSupplier.services && selectedSupplier.services.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Services Offered</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplier.services.map((service, idx) => (
                        <Badge key={idx} variant="secondary">
                          {service}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Certifications */}
                {selectedSupplier.certifications && selectedSupplier.certifications.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-primary" />
                      Certifications
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedSupplier.certifications.map((cert, idx) => (
                        <Badge key={idx} variant="outline">
                          {cert}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact Information */}
                <div>
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Contact Person</p>
                      <p className="text-sm font-medium">{selectedSupplier.contactPerson}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={`mailto:${selectedSupplier.email}`}
                        className="hover:text-primary smooth-transition"
                      >
                        {selectedSupplier.email}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <a
                        href={`tel:${selectedSupplier.phone}`}
                        className="hover:text-primary smooth-transition"
                      >
                        {selectedSupplier.phone}
                      </a>
                    </div>
                    {selectedSupplier.website && (
                      <div className="flex items-center gap-2 text-sm">
                        <Globe className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                        <a
                          href={selectedSupplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:text-primary smooth-transition"
                        >
                          {selectedSupplier.website}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Address
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {selectedSupplier.address.street}
                    <br />
                    {selectedSupplier.address.city}, {selectedSupplier.address.state}{' '}
                    {selectedSupplier.address.pincode}
                    <br />
                    {selectedSupplier.address.country}
                  </p>
                </div>

                {/* Contact Actions */}
                <div className="flex gap-3 pt-4 border-t border-border">
                  <Button className="flex-1" asChild>
                    <a href={`mailto:${selectedSupplier.email}`}>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </a>
                  </Button>
                  <Button variant="outline" className="flex-1" asChild>
                    <a href={`tel:${selectedSupplier.phone}`}>
                      <Phone className="w-4 h-4 mr-2" />
                      Call Now
                    </a>
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
