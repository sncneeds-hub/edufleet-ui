import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Briefcase, Plus, X } from 'lucide-react';
import { toast } from 'sonner';

export function JobListingForm() {
  const [formData, setFormData] = useState({
    title: '',
    department: '',
    location: '',
    type: 'full-time',
    experience: '',
    salaryMin: '',
    salaryMax: '',
    description: '',
    deadline: '',
  });

  const [requirements, setRequirements] = useState<string[]>(['']);
  const [responsibilities, setResponsibilities] = useState<string[]>(['']);
  const [benefits, setBenefits] = useState<string[]>(['']);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'salaryMin' || name === 'salaryMax' ? parseFloat(value) || value : value
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

    // Filter out empty items
    const filteredRequirements = requirements.filter(r => r.trim() !== '');
    const filteredResponsibilities = responsibilities.filter(r => r.trim() !== '');
    const filteredBenefits = benefits.filter(b => b.trim() !== '');

    if (filteredRequirements.length === 0) {
      toast.error('Please add at least one requirement');
      return;
    }

    if (filteredResponsibilities.length === 0) {
      toast.error('Please add at least one responsibility');
      return;
    }

    toast.success('Job listing created successfully! (Mock)');
    console.log('Job listing data:', {
      ...formData,
      requirements: filteredRequirements,
      responsibilities: filteredResponsibilities,
      benefits: filteredBenefits,
    });
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Create New Job Opening</h2>
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
                    placeholder="e.g., School Bus Driver"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Department *</label>
                    <input
                      type="text"
                      name="department"
                      placeholder="e.g., Transport"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Location *</label>
                    <input
                      type="text"
                      name="location"
                      placeholder="e.g., Delhi, India"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Job Type *</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="full-time">Full Time</option>
                      <option value="part-time">Part Time</option>
                      <option value="contract">Contract</option>
                      <option value="internship">Internship</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-2 block">Experience Required *</label>
                    <input
                      type="text"
                      name="experience"
                      placeholder="e.g., 3-5 years"
                      value={formData.experience}
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
                  <label className="text-sm font-medium mb-2 block">Application Deadline *</label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    required
                  />
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
                      placeholder="e.g., Valid commercial driving license"
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
                      placeholder="e.g., Safely transport students to and from school"
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
              <Button type="submit" className="w-full">
                Create Job Listing
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
                    <Briefcase className="w-8 h-8 text-primary mx-auto mb-2" />
                    <h4 className="font-bold line-clamp-2">{formData.title}</h4>
                  </div>
                  {formData.department && (
                    <p className="text-sm text-muted">{formData.department}</p>
                  )}
                  {formData.location && (
                    <p className="text-sm text-muted">{formData.location}</p>
                  )}
                  {(formData.salaryMin && formData.salaryMax) && (
                    <div className="text-lg font-bold text-primary">
                      ₹{parseInt(formData.salaryMin).toLocaleString()} - ₹{parseInt(formData.salaryMax).toLocaleString()}/mo
                    </div>
                  )}
                  {formData.type && (
                    <span className={`inline-block text-xs px-2 py-1 rounded font-medium ${
                      formData.type === 'full-time' ? 'bg-primary/10 text-primary' : 
                      formData.type === 'part-time' ? 'bg-secondary/10 text-secondary' : 
                      'bg-accent/10 text-accent'
                    }`}>
                      {formData.type.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    </span>
                  )}
                </>
              ) : (
                <div className="text-center text-muted py-8">
                  Fill form to see preview
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
