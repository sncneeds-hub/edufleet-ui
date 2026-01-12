import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Search, MapPin, BookOpen, Briefcase, Mail, Phone, GraduationCap, Award } from 'lucide-react';
import { toast } from 'sonner';
import { getTeachers, type TeacherFilters, type Teacher } from '@/api/services/teacherService';

export function InstituteTeacherSearch() {
  const { user } = useAuth();
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState('all');
  const [uniqueSubjects, setUniqueSubjects] = useState<string[]>([]);
  const [uniqueLocations, setUniqueLocations] = useState<string[]>([]);
  
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [isConnectDialogOpen, setIsConnectDialogOpen] = useState(false);

  // Fetch teachers on mount
  useEffect(() => {
    const fetchTeachers = async () => {
      try {
        setLoading(true);
        const response = await getTeachers({ role: 'teacher' } as TeacherFilters);
        
        if (response.success && response.data) {
          const teachersList = Array.isArray(response.data) 
            ? response.data 
            : response.data.items || [];
          
          setTeachers(teachersList);
          
          // Extract unique subjects and locations
          const subjects = new Set<string>();
          const locations = new Set<string>();
          
          teachersList.forEach((teacher) => {
            if (teacher.subjects) {
              teacher.subjects.forEach(s => subjects.add(s));
            }
            if (teacher.location) {
              locations.add(teacher.location);
            }
          });
          
          setUniqueSubjects(Array.from(subjects).sort());
          setUniqueLocations(Array.from(locations).sort());
        }
      } catch (error) {
        console.error('Failed to fetch teachers:', error);
        toast.error('Failed to load teachers');
      } finally {
        setLoading(false);
      }
    };

    fetchTeachers();
  }, []);

  // Apply filters
  useEffect(() => {
    let filtered = teachers;

    // Only show teachers with searchability enabled
    filtered = filtered.filter((teacher) => teacher.instituteSearchability);

    // Search by name or email
    if (searchTerm) {
      filtered = filtered.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          teacher.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by location
    if (locationFilter && locationFilter !== 'all') {
      filtered = filtered.filter((teacher) =>
        teacher.location?.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    // Filter by subject
    if (subjectFilter && subjectFilter !== 'all') {
      filtered = filtered.filter((teacher) =>
        teacher.subjects?.includes(subjectFilter)
      );
    }

    // Filter by availability
    if (availabilityFilter === 'available') {
      filtered = filtered.filter((teacher) => teacher.isAvailable);
    } else if (availabilityFilter === 'unavailable') {
      filtered = filtered.filter((teacher) => !teacher.isAvailable);
    }

    setFilteredTeachers(filtered);
  }, [teachers, searchTerm, locationFilter, subjectFilter, availabilityFilter]);

  if (!user || user.role !== 'institute') {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4">
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="text-muted-foreground mb-6">
              Only institutes can search for teachers. Please log in with an institute account.
            </p>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Search Teachers</h1>
          <p className="text-muted-foreground">
            Find and connect with qualified teachers who have enabled searchability
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-80 shrink-0">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Filter Teachers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Search by name/email */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      placeholder="Name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* Location filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Select value={locationFilter} onValueChange={setLocationFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Locations" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Locations</SelectItem>
                      {uniqueLocations.map((location) => (
                        <SelectItem key={location} value={location}>
                          {location}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Subject filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Subject</label>
                  <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Subjects" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Subjects</SelectItem>
                      {uniqueSubjects.map((subject) => (
                        <SelectItem key={subject} value={subject}>
                          {subject}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Availability filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Availability</label>
                  <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="unavailable">Unavailable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setSearchTerm('');
                    setLocationFilter('');
                    setSubjectFilter('');
                    setAvailabilityFilter('all');
                  }}
                >
                  Reset Filters
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content (Results) */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                {[...Array(10)].map((_, i) => (
                  <Skeleton key={i} className="w-full aspect-square rounded-xl" />
                ))}
              </div>
            ) : filteredTeachers.length > 0 ? (
              <>
                <div className="mb-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Showing {filteredTeachers.length} results
                  </p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-4">
                  {filteredTeachers.map((teacher) => (
                    <Card 
                      key={teacher._id || teacher.id} 
                      className="group relative overflow-hidden hover:shadow-xl transition-all duration-300 border-border/50 w-full aspect-square flex flex-col items-center justify-center p-3 text-center bg-card hover:bg-accent/5"
                    >
                      {/* Avatar */}
                      <Avatar className="w-20 h-20 mb-3 ring-2 ring-primary/10 group-hover:ring-primary/30 transition-all">
                        <AvatarImage src={teacher.avatar} alt={teacher.name} />
                        <AvatarFallback className="text-xl">{teacher.name.charAt(0)}</AvatarFallback>
                      </Avatar>

                      {/* Basic Info */}
                      <div className="space-y-1 w-full px-2">
                        <h3 className="text-base font-bold text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                          {teacher.name}
                        </h3>
                        <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
                          {teacher.subjects?.slice(0, 2).join(', ')}
                        </p>
                      </div>

                      {/* Details on Hover or Overlay */}
                      <div className="mt-2 flex items-center justify-center gap-1">
                        <Badge variant={teacher.isAvailable ? "default" : "secondary"} className="text-[10px] px-1.5 h-5">
                          {teacher.isAvailable ? "Available" : "Busy"}
                        </Badge>
                        {teacher.experience !== undefined && (
                          <Badge variant="outline" className="text-[10px] px-1.5 h-5">
                            {teacher.experience}y exp
                          </Badge>
                        )}
                      </div>

                      {/* Footer Actions Overlay */}
                      <div className="absolute inset-x-0 bottom-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform bg-background/95 backdrop-blur-sm border-t flex gap-2 z-10">
                        <Button 
                          variant="default" 
                          size="sm" 
                          className="flex-1 text-xs h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTeacher(teacher);
                            setIsConnectDialogOpen(true);
                          }}
                        >
                          View Profile
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              </>
            ) : (
              <Card className="p-12 text-center border-dashed">
                <div className="mb-4">
                  <BookOpen className="w-16 h-16 mx-auto text-muted-foreground opacity-30" />
                </div>
                <h3 className="text-xl font-semibold mb-2">No Teachers Found</h3>
                <p className="text-muted-foreground mb-6">
                  Adjust your search criteria or reset filters to see more results.
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setLocationFilter('');
                    setSubjectFilter('');
                    setAvailabilityFilter('all');
                  }}
                >
                  Clear All Filters
                </Button>
              </Card>
            )}
          </main>
        </div>
      </div>

      {/* Teacher Details/Connect Dialog */}
      <Dialog open={isConnectDialogOpen} onOpenChange={setIsConnectDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          {selectedTeacher ? (
            <>
              <DialogHeader>
                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-2">
                  <Avatar className="w-20 h-20 ring-2 ring-primary/10">
                    <AvatarImage src={selectedTeacher.avatar} alt={selectedTeacher.name} />
                    <AvatarFallback className="text-xl">{selectedTeacher.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <DialogTitle className="text-2xl">{selectedTeacher.name}</DialogTitle>
                    <DialogDescription className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {selectedTeacher.location || 'Remote'}
                    </DialogDescription>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant={selectedTeacher.isAvailable ? "default" : "secondary"}>
                        {selectedTeacher.isAvailable ? "Available for Hire" : "Currently Busy"}
                      </Badge>
                      {selectedTeacher.experience !== undefined && (
                        <Badge variant="outline">
                          {selectedTeacher.experience} Years Experience
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </DialogHeader>
              
              <div className="space-y-6 py-4">
                {/* Contact Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Mail className="w-4 h-4 text-primary" />
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs text-muted-foreground font-medium">Email</p>
                      <p className="text-sm font-medium truncate" title={selectedTeacher.email}>
                        {selectedTeacher.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground font-medium">Phone</p>
                      <p className="text-sm font-medium">
                        {selectedTeacher.phone || 'Not provided'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Bio */}
                {selectedTeacher.bio && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-semibold flex items-center gap-2">
                      <Briefcase className="w-4 h-4" /> About
                    </h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {selectedTeacher.bio}
                    </p>
                  </div>
                )}

                {/* Subjects & Qualifications */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {selectedTeacher.subjects && selectedTeacher.subjects.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Subjects
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {selectedTeacher.subjects.map((subject) => (
                          <Badge key={subject} variant="secondary" className="text-xs font-normal">
                            {subject}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTeacher.qualifications && selectedTeacher.qualifications.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" /> Qualifications
                      </h4>
                      <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                        {selectedTeacher.qualifications.map((qual) => (
                          <li key={qual}>{qual}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <DialogFooter className=" gap-2 border-t pt-4">

                <Button onClick={() => setIsConnectDialogOpen(false)}>
                
                 Close
                </Button>
              </DialogFooter>
            </>
          ) : (
             <div className="p-8 text-center text-muted-foreground">
               No teacher data available.
             </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
