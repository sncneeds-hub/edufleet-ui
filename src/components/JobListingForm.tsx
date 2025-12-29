import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { createJob } from '@/api/services/jobService';
import { useAuth } from '@/context/AuthContext';
import { checkJobPostLimit } from '@/api/services/subscriptionEnforcement';
import { Alert } from '@/components/ui/alert';

export function JobListingForm() {
  const { user, refreshSubscription } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [jobLimitResult, setJobLimitResult] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    city: '',
    state: '',
    employmentType: 'full-time' as 'full-time' | 'part-time' | 'contract' | 'temporary',
    experienceMin: '',
    experienceMax: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    deadline: '',
  });

  const [requirements, setRequirements] = useState<string[]>(['']);
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [benefits, setBenefits] = useState<string[]>(['']);
  const [subjects, setSubjects] = useState<string[]>(['']);
  const [qualifications, setQualifications] = useState<string[]>(['']);

  useEffect(() => {
    const checkLimit = async () => {
      if (!user?.id) {
        setCheckingLimit(false);
        return;
      }
      try {
        const result = await checkJobPostLimit();
        setJobLimitResult(result.data);
      } catch (err) {
        console.error('Job limit check error:', err);
      } finally {
        setCheckingLimit(false);
      }
    };
    checkLimit();
  }, [user?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleArrayChange = (
    index: number,
    value: string,
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    const newArray = [...array];
    newArray[index] = value;
    setter(newArray);
  };

  const addArrayItem = (
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    setter([...array, '']);
  };

  const removeArrayItem = (
    index: number,
    array: string[],
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (array.length > 1) {
      const newArray = array.filter((_, i) => i !== index);
      setter(newArray);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Check limit before submission
    if (jobLimitResult && !jobLimitResult.allowed) {
      toast.error(jobLimitResult.message || 'Job post limit reached');
      return;
    }

    // Validate required fields
    if (!formData.title.trim()) {
      toast.error('Please enter job title');
      return;
    }
    if (!formData.city.trim()) {
      toast.error('Please enter city');
      return;
    }
    if (!formData.state.trim()) {
      toast.error('Please enter state');
      return;
    }
    if (!formData.employmentType) {
      toast.error('Please select employment type');
      return;
    }
    if (!formData.experienceMin || !formData.experienceMax) {
      toast.error('Please enter experience range');
      return;
    }
    const expMin = parseInt(formData.experienceMin);
    const expMax = parseInt(formData.experienceMax);
    if (isNaN(expMin) || isNaN(expMax) || expMin < 0 || expMax < 0) {
      toast.error('Please enter valid experience range');
      return;
    }
    if (expMin > expMax) {
      toast.error('Maximum experience must be greater than minimum');
      return;
    }
    if (!formData.salaryMin || !formData.salaryMax) {
      toast.error('Please enter salary range');
      return;
    }
    const salMin = parseInt(formData.salaryMin);
    const salMax = parseInt(formData.salaryMax);
    if (isNaN(salMin) || isNaN(salMax) || salMin < 0 || salMax < 0) {
      toast.error('Please enter valid salary range');
      return;
    }
    if (salMin > salMax) {
      toast.error('Maximum salary must be greater than minimum');
      return;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter job description');
      return;
    }

    // Filter out empty items
    const filteredRequirements = requirements.filter(r => r.trim() !== '');
    const filteredResponsibilities = responsibilities.filter(r => r.trim() !== '');
    const filteredBenefits = benefits.filter(b => b.trim() !== '');
    const filteredSubjects = subjects.filter(s => s.trim() !== '');
    const filteredQualifications = qualifications.filter(q => q.trim() !== '');

    if (filteredSubjects.length === 0) {
      toast.error('Please add at least one subject');
      return;
    }

    if (filteredQualifications.length === 0) {
      toast.error('Please add at least one qualification');
      return;
    }

    if (filteredRequirements.length === 0) {
      toast.error('Please add at least one requirement');
      return;
    }

    if (filteredResponsibilities.length === 0) {
      toast.error('Please add at least one responsibility');
      return;
    }

    setIsSubmitting(true);
    try {
      // Parse numeric values (already validated above)
      const experienceMin = parseInt(formData.experienceMin);
      const experienceMax = parseInt(formData.experienceMax);
      const salaryMin = parseInt(formData.salaryMin);
      const salaryMax = parseInt(formData.salaryMax);

      // Transform data to match backend schema
      const jobData = {
        title: formData.title.trim(),
        location: {
          city: formData.city.trim(),
          state: formData.state.trim(),
          country: 'India',
        },
        employmentType: formData.employmentType,
        experience: {
          min: experienceMin,
          max: experienceMax,
        },
        salary: {
          min: salaryMin,
          max: salaryMax,
          currency: 'INR',
        },
        description: formData.description.trim(),
        applicationDeadline: formData.deadline ? new Date(formData.deadline).toISOString() : undefined,
        requirements: filteredRequirements,
        responsibilities: filteredResponsibilities,
        benefits: filteredBenefits,
        subjects: filteredSubjects,
        qualification: filteredQualifications,
      };

      console.log('Submitting job data:', jobData); // Debug log
      const response = await createJob(jobData);
      
      if (response.success || response.data) {
        toast.success('Job listing created successfully!');
        await refreshSubscription();
        
        // Reset form
        setFormData({
          title: '',
          city: '',
          state: '',
          employmentType: 'full-time',
          experienceMin: '',
          experienceMax: '',
          salaryMin: '',
          salaryMax: '',
          description: '',
          deadline: '',
        });
        setRequirements(['']);
        setResponsibilities(['']);
        setBenefits(['']);
        setSubjects(['']);
        setQualifications(['']);
      }
    } catch (error: any) {
      console.error('Job creation error:', error);
      
      // Extract detailed error message
      let errorMsg = 'Failed to create job listing';
      if (error?.error) {
        errorMsg = error.error;
      } else if (error?.message) {
        errorMsg = error.message;
      } else if (error?.response?.data?.error) {
        errorMsg = error.response.data.error;
      }
      
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create New Job Opening</h2>

      {/* Job Limit Alert */}
      {checkingLimit ? (
        <Alert className="mb-6">
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <p className="text-sm">Checking job post limits...</p>
        </Alert>
      ) : jobLimitResult && !jobLimitResult.allowed ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <div className="ml-4">
            <p className="font-semibold">Job Post Limit Reached</p>
            <p className="text-sm mt-1">
              {jobLimitResult.message || 'You have reached your job post limit. Upgrade your plan to post more jobs.'}
            </p>
          </div>
        </Alert>
      ) : jobLimitResult && jobLimitResult.remaining <= 1 ? (
        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <div className="ml-4">
            <p className="font-semibold text-amber-900">Low Job Post Quota</p>
            <p className="text-sm mt-1 text-amber-800">
              You have only {jobLimitResult.remaining} job post{jobLimitResult.remaining !== 1 ? 's' : ''} remaining in your plan.
            </p>
          </div>
        </Alert>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <Card className="lg:col-span-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-border pb-6">
              <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Basic Information
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Job Title *</label>
                  <input
                    type="text"
                    name="title"
                    placeholder="e.g., Mathematics Teacher"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">City *</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="e.g., Mumbai"
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">State *</label>
                    <input
                      type="text"
                      name="state"
                      placeholder="e.g., Maharashtra"
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Employment Type *</label>
                    <select
                      name="employmentType"
                      value={formData.employmentType}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="temporary">Temporary</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Application Deadline</label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Min Experience (years) *</label>
                    <input
                      type="number"
                      name="experienceMin"
                      placeholder="0"
                      min="0"
                      value={formData.experienceMin}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Max Experience (years) *</label>
                    <input
                      type="number"
                      name="experienceMax"
                      placeholder="5"
                      min="0"
                      value={formData.experienceMax}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Minimum Salary (₹/month) *</label>
                    <input
                      type="number"
                      name="salaryMin"
                      placeholder="25000"
                      value={formData.salaryMin}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Maximum Salary (₹/month) *</label>
                    <input
                      type="number"
                      name="salaryMax"
                      placeholder="35000"
                      value={formData.salaryMax}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Job Description *</label>
                  <textarea
                    name="description"
                    placeholder="Describe the position in detail..."
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="border-b border-border pb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Subjects *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(subjects, setSubjects)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {subjects.map((subject, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Mathematics"
                      value={subject}
                      onChange={(e) => handleArrayChange(index, e.target.value, subjects, setSubjects)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {subjects.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem(index, subjects, setSubjects)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Qualifications */}
            <div className="border-b border-border pb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Qualifications *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(qualifications, setQualifications)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {qualifications.map((qual, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., B.Ed, M.Sc Mathematics"
                      value={qual}
                      onChange={(e) => handleArrayChange(index, e.target.value, qualifications, setQualifications)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {qualifications.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem(index, qualifications, setQualifications)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="border-b border-border pb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Requirements *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(requirements, setRequirements)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {requirements.map((req, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Strong communication skills"
                      value={req}
                      onChange={(e) => handleArrayChange(index, e.target.value, requirements, setRequirements)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {requirements.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem(index, requirements, setRequirements)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Responsibilities */}
            <div className="border-b border-border pb-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Responsibilities *</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(responsibilities, setResponsibilities)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {responsibilities.map((resp, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Prepare and deliver lessons"
                      value={resp}
                      onChange={(e) => handleArrayChange(index, e.target.value, responsibilities, setResponsibilities)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {responsibilities.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem(index, responsibilities, setResponsibilities)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Benefits */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-semibold text-foreground">Benefits (Optional)</h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(benefits, setBenefits)}
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add
                </Button>
              </div>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Health insurance"
                      value={benefit}
                      onChange={(e) => handleArrayChange(index, e.target.value, benefits, setBenefits)}
                      className="flex-1 px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    {benefits.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeArrayItem(index, benefits, setBenefits)}
                        className="text-red-600"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-border">
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Job Listing'
                )}
              </Button>
            </div>
          </form>
        </Card>

        {/* Preview */}
        <div>
          <h3 className="font-semibold mb-4">Preview</h3>
          <Card className="p-4 sticky top-20">
            <div className="space-y-3">
              {formData.title ? (
                <>
                  <div className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 p-4 rounded-lg text-center">
                    <h4 className="font-bold text-lg">{formData.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {formData.city && formData.state ? `${formData.city}, ${formData.state}` : 'Location not set'}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium capitalize">{formData.employmentType.replace('-', ' ')}</p>
                    </div>
                    <div className="bg-muted/50 p-2 rounded">
                      <span className="text-muted-foreground">Experience:</span>
                      <p className="font-medium">
                        {formData.experienceMin && formData.experienceMax 
                          ? `${formData.experienceMin}-${formData.experienceMax} years` 
                          : 'Not set'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-muted/50 p-2 rounded text-sm">
                    <span className="text-muted-foreground">Salary:</span>
                    <p className="font-medium">
                      {formData.salaryMin && formData.salaryMax 
                        ? `₹${parseInt(formData.salaryMin).toLocaleString()} - ₹${parseInt(formData.salaryMax).toLocaleString()}/month` 
                        : 'Not set'}
                    </p>
                  </div>

                  {subjects.filter(s => s.trim()).length > 0 && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Subjects:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {subjects.filter(s => s.trim()).map((s, i) => (
                          <span key={i} className="bg-primary/10 text-primary px-2 py-0.5 rounded text-xs">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {formData.description && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Description:</span>
                      <p className="mt-1 line-clamp-3">{formData.description}</p>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Briefcase className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Fill in the form to see preview</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
