import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { AdSlot } from '@/components/ads/AdSlot';

export function TeacherSignup() {
  const navigate = useNavigate();
  const { signupTeacher } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    location: '',
    experience: '',
    bio: '',
  });
  const [qualifications, setQualifications] = useState<string[]>([]);
  const [currentQualification, setCurrentQualification] = useState('');
  const [subjects, setSubjects] = useState<string[]>([]);
  const [currentSubject, setCurrentSubject] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const addQualification = () => {
    if (currentQualification.trim() && !qualifications.includes(currentQualification.trim())) {
      setQualifications([...qualifications, currentQualification.trim()]);
      setCurrentQualification('');
    }
  };

  const removeQualification = (qual: string) => {
    setQualifications(qualifications.filter(q => q !== qual));
  };

  const addSubject = () => {
    if (currentSubject.trim() && !subjects.includes(currentSubject.trim())) {
      setSubjects([...subjects, currentSubject.trim()]);
      setCurrentSubject('');
    }
  };

  const removeSubject = (subj: string) => {
    setSubjects(subjects.filter(s => s !== subj));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.phone || !formData.location) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (qualifications.length === 0) {
      toast.error('Please add at least one qualification');
      return;
    }

    if (subjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }

    signupTeacher({
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      qualifications,
      experience: parseInt(formData.experience) || 0,
      subjects,
      bio: formData.bio,
      location: formData.location,
    });

    toast.success('Teacher account created successfully!');
    navigate('/teacher/dashboard');
  };

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-2xl mx-auto px-4">
        {/* Top Ad */}
        <div className="mb-6">
          <AdSlot placement="LP_TOP_BANNER" variant="banner" />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-3xl">Create Teacher Profile</CardTitle>
            <CardDescription>
              Join EduFleet Exchange and find your next teaching opportunity
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                
                <div>
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="password">Password *</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    name="location"
                    placeholder="e.g., Delhi, India"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Professional Information</h3>
                
                <div>
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    name="experience"
                    type="number"
                    min="0"
                    value={formData.experience}
                    onChange={handleInputChange}
                  />
                </div>

                <div>
                  <Label htmlFor="qualifications">Qualifications *</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="qualifications"
                      value={currentQualification}
                      onChange={(e) => setCurrentQualification(e.target.value)}
                      placeholder="e.g., B.Ed, M.A."
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addQualification();
                        }
                      }}
                    />
                    <Button type="button" onClick={addQualification}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {qualifications.map((qual) => (
                      <Badge key={qual} variant="secondary" className="text-sm">
                        {qual}
                        <button
                          type="button"
                          onClick={() => removeQualification(qual)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="subjects">Subjects *</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      id="subjects"
                      value={currentSubject}
                      onChange={(e) => setCurrentSubject(e.target.value)}
                      placeholder="e.g., Mathematics, English"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSubject();
                        }
                      }}
                    />
                    <Button type="button" onClick={addSubject}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {subjects.map((subj) => (
                      <Badge key={subj} variant="secondary" className="text-sm">
                        {subj}
                        <button
                          type="button"
                          onClick={() => removeSubject(subj)}
                          className="ml-2 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" className="flex-1">
                  Create Profile
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/login')}>
                  Already have an account?
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
