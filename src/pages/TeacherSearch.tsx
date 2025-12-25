import { useState, useMemo } from 'react';
import { useTeachers } from '@/hooks/useApi';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Search, 
  MapPin, 
  Award, 
  BookOpen, 
  Briefcase, 
  Mail, 
  Phone,
  Calendar,
  DollarSign,
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AdSlot } from '@/components/ads/AdSlot';

export function TeacherSearch() {
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [locationFilter, setLocationFilter] = useState<string>('all');
  const [experienceFilter, setExperienceFilter] = useState<string>('all');
  const [availabilityFilter, setAvailabilityFilter] = useState<string>('all');
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [showContactDialog, setShowContactDialog] = useState(false);
  const [interviewData, setInterviewData] = useState({
    date: '',
    time: '',
    message: '',
  });

  // Fetch teachers from API
  const { teachers: allTeachers, loading } = useTeachers();

  // Client-side filtering
  const filteredTeachers = useMemo(() => {
    return allTeachers.filter((teacher) => {
      const matchesSearch = 
        teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        teacher.subjects.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())) ||
        teacher.qualifications.some(q => q.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesSubject = subjectFilter === 'all' || teacher.subjects.some(s => 
        s.toLowerCase().includes(subjectFilter.toLowerCase())
      );
      
      const matchesLocation = locationFilter === 'all' || teacher.location.includes(locationFilter);
      
      const matchesExperience = 
        experienceFilter === 'all' ||
        (experienceFilter === '0-2' && teacher.experience <= 2) ||
        (experienceFilter === '3-5' && teacher.experience >= 3 && teacher.experience <= 5) ||
        (experienceFilter === '6-10' && teacher.experience >= 6 && teacher.experience <= 10) ||
        (experienceFilter === '10+' && teacher.experience > 10);
      
      const matchesAvailability = 
        availabilityFilter === 'all' || 
        (availabilityFilter === 'available' && teacher.isAvailable) ||
        (availabilityFilter === 'unavailable' && !teacher.isAvailable);

      return matchesSearch && matchesSubject && matchesLocation && matchesExperience && matchesAvailability;
    });
  }, [allTeachers, searchTerm, subjectFilter, locationFilter, experienceFilter, availabilityFilter]);

  const handleContact = (teacher: any) => {
    setSelectedTeacher(teacher);
    setShowContactDialog(true);
  };

  const sendInterviewInvitation = () => {
    if (!interviewData.date || !interviewData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success(`Interview invitation sent to ${selectedTeacher.name}`);
    setShowContactDialog(false);
    setInterviewData({ date: '', time: '', message: '' });
    setSelectedTeacher(null);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Top Ad */}
        <div className="mb-6">
          <AdSlot placement="LP_TOP_BANNER" variant="banner" />
        </div>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Search Teachers</h1>
          <p className="text-muted-foreground">
            Find qualified teachers for your educational institute
          </p>
        </div>

        {/* Search and Filters */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by name, subject, or qualification..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <Select value={subjectFilter} onValueChange={setSubjectFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    <SelectItem value="mathematics">Mathematics</SelectItem>
                    <SelectItem value="english">English</SelectItem>
                    <SelectItem value="science">Science</SelectItem>
                    <SelectItem value="computer">Computer Science</SelectItem>
                    <SelectItem value="history">History</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Locations</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={experienceFilter} onValueChange={setExperienceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Experience" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Experience</SelectItem>
                    <SelectItem value="0-2">0-2 years</SelectItem>
                    <SelectItem value="3-5">3-5 years</SelectItem>
                    <SelectItem value="6-10">6-10 years</SelectItem>
                    <SelectItem value="10+">10+ years</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={availabilityFilter} onValueChange={setAvailabilityFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Availability" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setSubjectFilter('all');
                    setLocationFilter('all');
                    setExperienceFilter('all');
                    setAvailabilityFilter('all');
                  }}
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            {loading ? 'Loading teachers...' : `Showing ${filteredTeachers.length} of ${allTeachers.length} teachers`}
          </p>
        </div>

        {/* Teacher Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">Loading teachers...</p>
              </CardContent>
            </Card>
          ) : filteredTeachers.length === 0 ? (
            <Card className="col-span-full">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  No teachers found. Try adjusting your filters.
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredTeachers.map((teacher) => (
              <Card key={teacher.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <Avatar className="h-16 w-16">
                      <AvatarImage src={teacher.avatar} />
                      <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <Badge variant={teacher.isAvailable ? 'default' : 'secondary'}>
                      {teacher.isAvailable ? 'Available' : 'Unavailable'}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl">{teacher.name}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <MapPin className="h-3 w-3" />
                    {teacher.location}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Experience */}
                  <div className="flex items-center gap-2 text-sm">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{teacher.experience} years of experience</span>
                  </div>

                  {/* Expected Salary */}
                  {teacher.expectedSalary && (
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>
                        {teacher.expectedSalary.currency}{teacher.expectedSalary.min.toLocaleString()} - {teacher.expectedSalary.currency}{teacher.expectedSalary.max.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Qualifications */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <Award className="h-3 w-3" />
                      Qualifications
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {teacher.qualifications.map((qual) => (
                        <Badge key={qual} variant="secondary" className="text-xs">
                          {qual}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Subjects */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      Subjects
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subj) => (
                        <Badge key={subj} variant="outline" className="text-xs">
                          {subj}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Bio */}
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {teacher.bio}
                  </p>

                  {/* Contact Button */}
                  <Button
                    className="w-full"
                    onClick={() => handleContact(teacher)}
                    disabled={!teacher.isAvailable}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Contact for Interview
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Contact Dialog */}
        <Dialog open={showContactDialog} onOpenChange={setShowContactDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Send Interview Invitation</DialogTitle>
              <DialogDescription>
                Send interview invitation to {selectedTeacher?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              {/* Teacher Contact Info */}
              {selectedTeacher && (
                <div className="p-3 bg-muted rounded space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedTeacher.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span>{selectedTeacher.phone}</span>
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="date">Proposed Interview Date *</Label>
                <Input
                  id="date"
                  type="date"
                  value={interviewData.date}
                  onChange={(e) => setInterviewData({ ...interviewData, date: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="time">Proposed Time *</Label>
                <Input
                  id="time"
                  type="time"
                  value={interviewData.time}
                  onChange={(e) => setInterviewData({ ...interviewData, time: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="message">Message (optional)</Label>
                <Input
                  id="message"
                  placeholder="Additional information..."
                  value={interviewData.message}
                  onChange={(e) => setInterviewData({ ...interviewData, message: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setShowContactDialog(false);
                    setSelectedTeacher(null);
                    setInterviewData({ date: '', time: '', message: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button 
                  className="flex-1"
                  onClick={sendInterviewInvitation}
                >
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
