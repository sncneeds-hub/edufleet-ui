import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { blink } from '@/lib/blink';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Loader2, Building2, Mail, Phone, MapPin, FileText, Save, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DashboardLayout } from '@/components/layout/DashboardLayout';

const instituteSchema = z.object({
  name: z.string().min(3, 'Institute name must be at least 3 characters'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits'),
  description: z.string().optional(),
});

type InstituteFormData = z.infer<typeof instituteSchema>;

interface InstituteDB {
  id: string;
  userId: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function InstituteProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [institute, setInstitute] = useState<InstituteDB | null>(null);
  const [isNewProfile, setIsNewProfile] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<InstituteFormData>({
    resolver: zodResolver(instituteSchema),
  });

  const loadInstituteProfile = useCallback(async () => {
    try {
      const user = await blink.auth.me();
      
      const institute = await api.institutes.getByUserId(user.id);

      if (institute) {
        setInstitute(institute);
        reset({
          name: institute.instituteName,
          registrationNumber: institute.registrationNumber,
          email: institute.instituteEmail,
          phone: institute.institutePhone,
          address: institute.instituteAddress,
          city: institute.city || '',
          state: institute.state || '',
          pincode: institute.pincode || '',
          description: institute.description || '',
        });
        setIsNewProfile(false);
      } else {
        setIsNewProfile(true);
        // Pre-fill email from user
        reset({ email: user.email || '' });
      }
    } catch (error) {
      console.error('Error loading institute profile:', error);
      toast.error('Failed to load profile');
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    loadInstituteProfile();
  }, [loadInstituteProfile]);

  const onSubmit = async (data: InstituteFormData) => {
    setIsSubmitting(true);
    try {
      const user = await blink.auth.me();

      if (isNewProfile) {
        // Create new institute profile
        await api.institutes.create({
          instituteName: data.name,
          registrationNumber: data.registrationNumber,
          instituteEmail: data.email,
          institutePhone: data.phone,
          instituteAddress: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          description: data.description,
        });
        toast.success('Institute profile created! Awaiting admin approval.');
      } else if (institute) {
        // Update existing institute profile
        await api.institutes.update(institute.id, {
          instituteName: data.name,
          registrationNumber: data.registrationNumber,
          instituteEmail: data.email,
          institutePhone: data.phone,
          instituteAddress: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          description: data.description,
          // Reset approval status if it was approved
          approvalStatus: institute.approvalStatus === 'approved' ? 'pending' : institute.approvalStatus,
        });
        
        if (institute.approvalStatus === 'approved') {
          toast.success('Institute profile updated! Your updated profile is now pending admin re-review.');
        } else {
          toast.success('Institute profile updated successfully');
        }
      }

      // Reload profile
      await loadInstituteProfile();
    } catch (error) {
      console.error('Error saving institute profile:', error);
      toast.error('Failed to save profile');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved':
        return 'default';
      case 'pending':
        return 'secondary';
      case 'rejected':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="profile">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeTab="profile">
      <div className="container mx-auto px-4 max-w-4xl">
        <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Building2 className="h-6 w-6" />
                Institute Profile
              </CardTitle>
              <CardDescription>
                {isNewProfile
                  ? 'Create your institute profile to start posting vehicles'
                  : 'Manage your institute information'}
              </CardDescription>
            </div>
            {institute && (
              <Badge variant={getStatusBadgeVariant(institute.approvalStatus)}>
                {institute.approvalStatus.charAt(0).toUpperCase() + institute.approvalStatus.slice(1)}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {institute?.approvalStatus === 'rejected' && institute.rejectionReason && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Profile Rejected:</strong> {institute.rejectionReason}
              </AlertDescription>
            </Alert>
          )}

          {institute?.approvalStatus === 'pending' && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Your institute profile is pending admin approval. You can still update your information.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {institute?.approvalStatus === 'approved' && (
              <Alert className="mb-6 border-blue-500 bg-blue-50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Your institute is approved. Editing will move it back to pending status for admin re-review.
                </AlertDescription>
              </Alert>
            )}

            {/* Institute Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                <Building2 className="inline h-4 w-4 mr-1" />
                Institute Name *
              </Label>
              <Input
                id="name"
                placeholder="e.g., ABC Public School"
                {...register('name')}
              />
              {errors.name && (
                <p className="text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Registration Number */}
            <div className="space-y-2">
              <Label htmlFor="registrationNumber">
                <FileText className="inline h-4 w-4 mr-1" />
                Registration Number *
              </Label>
              <Input
                id="registrationNumber"
                placeholder="e.g., REG/2020/12345"
                {...register('registrationNumber')}
              />
              {errors.registrationNumber && (
                <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>
              )}
            </div>

            {/* Email and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">
                  <Mail className="inline h-4 w-4 mr-1" />
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="contact@school.edu"
                  {...register('email')}
                />
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">
                  <Phone className="inline h-4 w-4 mr-1" />
                  Phone *
                </Label>
                <Input
                  id="phone"
                  placeholder="+91 1234567890"
                  {...register('phone')}
                />
                {errors.phone && (
                  <p className="text-sm text-destructive">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">
                <MapPin className="inline h-4 w-4 mr-1" />
                Address *
              </Label>
              <Textarea
                id="address"
                rows={3}
                placeholder="Full address with street, area, landmarks..."
                {...register('address')}
              />
              {errors.address && (
                <p className="text-sm text-destructive">{errors.address.message}</p>
              )}
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  placeholder="Mumbai"
                  {...register('city')}
                />
                {errors.city && (
                  <p className="text-sm text-destructive">{errors.city.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  placeholder="Maharashtra"
                  {...register('state')}
                />
                {errors.state && (
                  <p className="text-sm text-destructive">{errors.state.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode *</Label>
                <Input
                  id="pincode"
                  placeholder="400001"
                  {...register('pincode')}
                />
                {errors.pincode && (
                  <p className="text-sm text-destructive">{errors.pincode.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Brief description about your institute..."
                {...register('description')}
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    {isNewProfile ? 'Create Profile' : 'Update Profile'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/school/my-vehicles')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
