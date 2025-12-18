import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Building2, Mail, Phone, Globe, MapPin } from 'lucide-react';
import { categoryLabels } from '@/mock/supplierData';
import type { CreateSupplierDto } from '@/api/types';

interface SupplierFormProps {
  onSubmit: (data: CreateSupplierDto) => void;
  isLoading?: boolean;
}

export function SupplierForm({ onSubmit, isLoading }: SupplierFormProps) {
  const [formData, setFormData] = useState<CreateSupplierDto>({
    name: '',
    category: 'edutech',
    description: '',
    services: [],
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      pincode: '',
      country: 'India'
    },
    certifications: [],
    yearsInBusiness: undefined,
    clientCount: undefined
  });

  const [currentService, setCurrentService] = useState('');
  const [currentCertification, setCurrentCertification] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addService = () => {
    if (currentService.trim() && !formData.services.includes(currentService.trim())) {
      setFormData(prev => ({
        ...prev,
        services: [...prev.services, currentService.trim()]
      }));
      setCurrentService('');
    }
  };

  const removeService = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services: prev.services.filter(s => s !== service)
    }));
  };

  const addCertification = () => {
    if (currentCertification.trim() && !formData.certifications?.includes(currentCertification.trim())) {
      setFormData(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), currentCertification.trim()]
      }));
      setCurrentCertification('');
    }
  };

  const removeCertification = (cert: string) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications?.filter(c => c !== cert)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-primary" />
          Basic Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter company name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, category: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe the company and its offerings"
              rows={3}
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Services Offered</h3>
        
        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={currentService}
              onChange={e => setCurrentService(e.target.value)}
              placeholder="Enter a service"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addService())}
            />
            <Button type="button" onClick={addService} variant="secondary">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {formData.services.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.services.map(service => (
                <Badge key={service} variant="secondary" className="gap-1">
                  {service}
                  <button
                    type="button"
                    onClick={() => removeService(service)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-primary" />
          Contact Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="contactPerson">Contact Person *</Label>
            <Input
              id="contactPerson"
              value={formData.contactPerson}
              onChange={e => setFormData(prev => ({ ...prev, contactPerson: e.target.value }))}
              placeholder="Full name"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contact@company.com"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone *</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+91 98765 43210"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              type="url"
              value={formData.website}
              onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
              placeholder="https://company.com"
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Address
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="street">Street Address *</Label>
            <Input
              id="street"
              value={formData.address.street}
              onChange={e => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, street: e.target.value }
              }))}
              placeholder="Building, Street"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="city">City *</Label>
            <Input
              id="city"
              value={formData.address.city}
              onChange={e => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, city: e.target.value }
              }))}
              placeholder="City"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="state">State *</Label>
            <Input
              id="state"
              value={formData.address.state}
              onChange={e => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, state: e.target.value }
              }))}
              placeholder="State"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="pincode">Pincode *</Label>
            <Input
              id="pincode"
              value={formData.address.pincode}
              onChange={e => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, pincode: e.target.value }
              }))}
              placeholder="123456"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country">Country *</Label>
            <Input
              id="country"
              value={formData.address.country}
              onChange={e => setFormData(prev => ({
                ...prev,
                address: { ...prev.address, country: e.target.value }
              }))}
              placeholder="India"
              required
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Additional Information</h3>
        
        <div className="space-y-4">
          <div className="space-y-3">
            <Label>Certifications</Label>
            <div className="flex gap-2">
              <Input
                value={currentCertification}
                onChange={e => setCurrentCertification(e.target.value)}
                placeholder="e.g., ISO 9001:2015"
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addCertification())}
              />
              <Button type="button" onClick={addCertification} variant="secondary">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            {formData.certifications && formData.certifications.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.certifications.map(cert => (
                  <Badge key={cert} variant="outline" className="gap-1">
                    {cert}
                    <button
                      type="button"
                      onClick={() => removeCertification(cert)}
                      className="ml-1 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="yearsInBusiness">Years in Business</Label>
              <Input
                id="yearsInBusiness"
                type="number"
                min="0"
                value={formData.yearsInBusiness || ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  yearsInBusiness: e.target.value ? parseInt(e.target.value) : undefined
                }))}
                placeholder="5"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="clientCount">Number of Clients</Label>
              <Input
                id="clientCount"
                type="number"
                min="0"
                value={formData.clientCount || ''}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  clientCount: e.target.value ? parseInt(e.target.value) : undefined
                }))}
                placeholder="100"
              />
            </div>
          </div>
        </div>
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" disabled={isLoading || formData.services.length === 0}>
          {isLoading ? 'Saving...' : 'Add Supplier'}
        </Button>
      </div>
    </form>
  );
}
