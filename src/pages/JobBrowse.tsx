import { useState } from 'react';
import { JobCard } from '@/components/JobCard';
import { useJobs } from '@/hooks/useApi';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Filter, Briefcase } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { AdSlot } from '@/components/ads/AdSlot';
import { mockJobs } from '@/mock/jobData'; // Import mockJobs for static filter options
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export function JobBrowse() {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  
  // Use server-side filtering
  const { jobs, loading } = useJobs({
    searchTerm,
    type: typeFilter !== 'all' ? typeFilter : undefined,
    department: departmentFilter !== 'all' ? departmentFilter : undefined,
    pageSize: 100 // Fetch more items since we don't have pagination UI yet
  });

  // Calculate unique departments from all available data (static)
  const uniqueDepartments = Array.from(new Set(mockJobs.map(j => j.department)));

  const handleClearFilters = () => {
    setSearchTerm('');
    setTypeFilter('all');
    setDepartmentFilter('all');
  };

  const hasActiveFilters = searchTerm !== '' || typeFilter !== 'all' || departmentFilter !== 'all';

  if (loading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="w-64 h-10 mb-8" />
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/4">
              <Skeleton className="h-64 mb-4" />
              <Skeleton className="h-64" />
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Browse Job Openings</h1>
          <p className="text-muted">Discover career opportunities at educational institutes</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full lg:w-1/4 space-y-6">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted w-4 h-4" />
              <Input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            {/* Filters */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-primary" />
                  <h3 className="font-bold">Filters</h3>
                </div>
                {hasActiveFilters && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearFilters}
                    className="h-8 text-xs text-destructive hover:bg-destructive/10"
                  >
                    Clear
                  </Button>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Job Type</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="full-time">Full Time</SelectItem>
                      <SelectItem value="part-time">Part Time</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="internship">Internship</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Department</label>
                  <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Departments" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Departments</SelectItem>
                      {uniqueDepartments.map(dept => (
                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>

            {/* Sidebar Ad */}
            <AdSlot placement="LIST_SIDEBAR" variant="sidebar" />
          </aside>

            {/* Results */}
          <div className="flex-1">
            <div className="mb-6">
              <p className="text-muted">
                Showing <span className="font-semibold text-foreground">{jobs.length}</span> job{jobs.length !== 1 ? 's' : ''}
              </p>
            </div>

            {jobs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {jobs.map((job, index) => (
                  <div key={job.id} className="animate-scale-in" style={{ animationDelay: `${index * 0.05}s` }}>
                    <JobCard job={job} />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center border-dashed">
                <Briefcase className="w-12 h-12 text-muted mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No jobs found</h3>
                <p className="text-muted mb-4">Try adjusting your search or filters</p>
                <Button
                  variant="outline"
                  onClick={handleClearFilters}
                >
                  Clear Filters
                </Button>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
