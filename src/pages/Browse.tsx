import { useState, useMemo } from 'react';
import { VehicleCard } from '@/components/VehicleCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Sliders, Loader2 } from 'lucide-react';
import { useVehicles } from '@/hooks/useApi';
import type { Vehicle } from '@/api/types';
import { AdSlot } from '@/components/ads/AdSlot';

const ALL_FILTER = '__all__';

export function Browse() {
  const [activeTab, setActiveTab] = useState('vehicles');
  
  // Vehicle filters
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>(ALL_FILTER);
  const [manufacturerFilter, setManufacturerFilter] = useState<string>(ALL_FILTER);
  const [yearFilter, setYearFilter] = useState<string>(ALL_FILTER);
  const [conditionFilter, setConditionFilter] = useState<string>(ALL_FILTER);

  // Fetch vehicles
  const { vehicles: allVehicles, loading: vehiclesLoading, error: vehiclesError } = useVehicles({
    status: 'approved',
  });

  // Extract unique vehicle filter values
  const manufacturers = useMemo(
    () => Array.from(new Set(allVehicles.map(v => v.manufacturer))),
    [allVehicles]
  );
  const years = useMemo(
    () => Array.from(new Set(allVehicles.map(v => v.year))).sort((a, b) => b - a),
    [allVehicles]
  );
  const conditions = useMemo(
    () => Array.from(new Set(allVehicles.map(v => v.condition))),
    [allVehicles]
  );
  const types = useMemo(
    () => Array.from(new Set(allVehicles.map(v => v.type))),
    [allVehicles]
  );

  // Filter vehicles
  const filteredVehicles = useMemo(() => {
    return allVehicles.filter((vehicle: Vehicle) => {
      const matchesSearch =
        vehicle.title.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
        vehicle.description.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
        vehicle.manufacturer.toLowerCase().includes(vehicleSearchTerm.toLowerCase());

      const matchesType = typeFilter === ALL_FILTER || vehicle.type === typeFilter;
      const matchesManufacturer = manufacturerFilter === ALL_FILTER || vehicle.manufacturer === manufacturerFilter;
      const matchesYear = yearFilter === ALL_FILTER || vehicle.year.toString() === yearFilter;
      const matchesCondition = conditionFilter === ALL_FILTER || vehicle.condition === conditionFilter;

      return matchesSearch && matchesType && matchesManufacturer && matchesYear && matchesCondition;
    });
  }, [allVehicles, vehicleSearchTerm, typeFilter, manufacturerFilter, yearFilter, conditionFilter]);

  const vehicleHasActiveFilters = typeFilter !== ALL_FILTER || manufacturerFilter !== ALL_FILTER || yearFilter !== ALL_FILTER || conditionFilter !== ALL_FILTER;

  const handleClearVehicleFilters = () => {
    setVehicleSearchTerm('');
    setTypeFilter(ALL_FILTER);
    setManufacturerFilter(ALL_FILTER);
    setYearFilter(ALL_FILTER);
    setConditionFilter(ALL_FILTER);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-gradient-primary text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Vehicles</h1>
          <p className="text-lg text-white/85 max-w-2xl font-light">
            Discover verified used transport vehicles from educational institutions.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Vehicles Sidebar */}
              <aside className="w-full lg:w-1/4 space-y-6">
                {/* Search */}
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                    <Search className="text-primary w-4 h-4" />
                  </div>
                  <Input
                    placeholder="Search vehicles..."
                    value={vehicleSearchTerm}
                    onChange={(e) => setVehicleSearchTerm(e.target.value)}
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
                    {vehicleHasActiveFilters && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleClearVehicleFilters}
                        className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        Clear
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Vehicle Type</label>
                      <Select value={typeFilter} onValueChange={setTypeFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_FILTER}>All Types</SelectItem>
                          {types.map((type) => (
                            <SelectItem key={type} value={type}>
                              {type.replace('-', ' ').charAt(0).toUpperCase() + type.replace('-', ' ').slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Manufacturer</label>
                      <Select value={manufacturerFilter} onValueChange={setManufacturerFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Manufacturers" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_FILTER}>All Manufacturers</SelectItem>
                          {manufacturers.map((mfg) => (
                            <SelectItem key={mfg} value={mfg}>
                              {mfg}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Year</label>
                      <Select value={yearFilter} onValueChange={setYearFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Years" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_FILTER}>All Years</SelectItem>
                          {years.map((year) => (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-muted-foreground">Condition</label>
                      <Select value={conditionFilter} onValueChange={setConditionFilter}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Conditions" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_FILTER}>All Conditions</SelectItem>
                          {conditions.map((cond) => (
                            <SelectItem key={cond} value={cond}>
                              {cond.charAt(0).toUpperCase() + cond.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Sidebar Ad */}
                <AdSlot placement="LIST_SIDEBAR" variant="sidebar" />
              </aside>

              {/* Vehicles Main Content */}
              <div className="flex-1">
                {/* Results Header */}
                <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div>
                    <p className="text-lg text-foreground font-semibold">
                      Found <span className="text-primary font-bold">{filteredVehicles.length}</span> {filteredVehicles.length === 1 ? 'vehicle' : 'vehicles'}
                    </p>
                    {vehicleHasActiveFilters && (
                      <p className="text-sm text-muted-foreground">Filtered results</p>
                    )}
                  </div>
                </div>

                {/* Loading State */}
                {vehiclesLoading ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
                    <p className="text-lg text-muted-foreground">Loading vehicles...</p>
                  </div>
                ) : vehiclesError ? (
                  <div className="text-center py-20 bg-destructive/5 rounded-xl border border-destructive/20">
                    <p className="text-xl text-destructive font-bold mb-2">Error Loading Vehicles</p>
                    <p className="text-muted-foreground mb-6">{vehiclesError}</p>
                    <Button onClick={() => window.location.reload()}>Retry</Button>
                  </div>
                ) : filteredVehicles.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {filteredVehicles.map((vehicle, index) => (
                      <div key={vehicle.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                        <VehicleCard vehicle={vehicle} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-16 bg-muted/30 rounded-xl border border-dashed border-border">
                    <Search className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                    <p className="text-xl text-foreground font-bold mb-2">No vehicles found</p>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      Try adjusting your filters or search terms
                    </p>
                    <Button variant="outline" onClick={handleClearVehicleFilters}>
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            </div>
      </div>
    </div>
  );
}
