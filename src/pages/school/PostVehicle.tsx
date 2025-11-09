import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { api } from '@/lib/api';
import { useFormDraft, FORM_KEYS } from '@/hooks/useStateRestoration';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Upload, X } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VEHICLE_FEATURES, stringifyFeatures } from '@/lib/vehicleFeatures';
import { processImagesForUpload, formatFileSize } from '@/lib/imageValidation';

const vehicleSchema = z.object({
  vehicleType: z.string().min(1, 'Vehicle type is required'),
  brand: z.string().min(1, 'Brand is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  seatingCapacity: z.number().min(1, 'Seating capacity is required'),
  mileage: z.number().min(0, 'Mileage must be positive'),
  fuelType: z.string().min(1, 'Fuel type is required'),
  price: z.number().min(0, 'Price must be positive'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  condition: z.string().min(1, 'Condition is required'),
});

type VehicleFormData = z.infer<typeof vehicleSchema>;

export default function PostVehicle() {
  const navigate = useNavigate();
  const { restoreFormData, saveDraft, clearDraft, hasDraft } = useFormDraft(FORM_KEYS.POST_VEHICLE);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [showRestorePrompt, setShowRestorePrompt] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [processingImages, setProcessingImages] = useState(false);
  const [imageProgress, setImageProgress] = useState<{[key: number]: number}>({});

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<VehicleFormData>({
    resolver: zodResolver(vehicleSchema),
  });

  // Check for saved draft on mount
  useEffect(() => {
    if (hasDraft()) {
      setShowRestorePrompt(true);
    }
  }, [hasDraft]);

  const vehicleType = watch('vehicleType');
  const fuelType = watch('fuelType');
  const condition = watch('condition');

  // Auto-save form draft every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const formData = {
        vehicleType,
        fuelType,
        condition,
      };
      saveDraft(formData);
    }, 30000);

    return () => clearInterval(interval);
  }, [vehicleType, fuelType, condition, saveDraft]);

  // Restore draft function
  const handleRestoreDraft = () => {
    const draft = restoreFormData();
    if (draft) {
      if (draft.vehicleType) setValue('vehicleType', draft.vehicleType);
      if (draft.fuelType) setValue('fuelType', draft.fuelType);
      if (draft.condition) setValue('condition', draft.condition);
      setShowRestorePrompt(false);
      toast.success('Draft restored');
    }
  };

  const handleDiscardDraft = () => {
    clearDraft();
    setShowRestorePrompt(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + images.length > 10) {
      toast.error('Maximum 10 images allowed');
      return;
    }

    setProcessingImages(true);
    try {
      // Process images with validation and compression
      const processedFiles = await processImagesForUpload(files, (fileIndex, progress) => {
        setImageProgress(prev => ({ ...prev, [fileIndex]: progress }));
      });

      setImages(prev => [...prev, ...processedFiles]);
      
      // Create previews
      processedFiles.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      setImageProgress({});
    } catch (error) {
      console.error('Image processing failed:', error);
    } finally {
      setProcessingImages(false);
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: VehicleFormData) => {
    if (images.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await api.auth.me();
      
      // Get institute ID from the user's metadata or institutes table
      const institute = await api.institutes.getByUserId(user.id);

      if (!institute) {
        toast.error('Institute profile not found. Please complete your profile first.');
        navigate('/school/profile');
        return;
      }

      if (institute.approvalStatus !== 'approved') {
        toast.error('Your institute must be approved before posting vehicles');
        return;
      }

      // Upload images
      setUploadingImages(true);
      const imageUrls: string[] = [];
      
      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        const extension = file.name.split('.').pop();
        const { publicUrl } = await blink.storage.upload(
          file,
          `vehicles/${Date.now()}-${i}.${extension}`,
          { upsert: true }
        );
        imageUrls.push(publicUrl);
      }
      setUploadingImages(false);

      // Create vehicle listing
      await api.vehicles.create({
        instituteId: institute.id,
        instituteName: institute.instituteName,
        vehicleType: data.vehicleType,
        brand: data.brand,
        vehicleModel: data.model,
        year: data.year,
        registrationNumber: data.registrationNumber,
        seatingCapacity: data.seatingCapacity,
        mileage: data.mileage,
        fuelType: data.fuelType,
        price: data.price,
        description: data.description,
        condition: data.condition,
        features: stringifyFeatures(selectedFeatures),
        images: JSON.stringify(imageUrls),
      });

      toast.success('Vehicle posted successfully! Awaiting admin approval.');
      clearDraft(); // Clear saved draft after successful submission
      navigate('/school/my-vehicles');
    } catch (error) {
      console.error('Error posting vehicle:', error);
      toast.error('Failed to post vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Restore Draft Prompt */}
        {showRestorePrompt && (
          <Card className="mb-6 border-amber-500 bg-amber-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-amber-900">You have a saved draft</p>
                  <p className="text-sm text-amber-800">Would you like to restore your previous form?</p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRestoreDraft}
                  >
                    Restore
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={handleDiscardDraft}
                  >
                    Start Fresh
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Post a Vehicle</CardTitle>
          <CardDescription>
            List your school vehicle for sale. All listings require admin approval. Your progress is auto-saved every 30 seconds.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Vehicle Images */}
            <div className="space-y-2">
              <Label>Vehicle Images (Max 10)</Label>
              <p className="text-sm text-muted-foreground">
                Upload high-quality images (JPEG, PNG, WebP). Max 5MB per image. Images will be automatically compressed.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {imagePreview.map((preview, index) => (
                  <div key={index} className="relative aspect-video bg-muted rounded-lg overflow-hidden">
                    <img src={preview} alt={`Preview ${index + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {formatFileSize(images[index]?.size || 0)}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                {images.length < 10 && (
                  <label className={`aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${processingImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {processingImages ? (
                      <>
                        <Loader2 className="w-8 h-8 text-muted-foreground mb-2 animate-spin" />
                        <span className="text-sm text-muted-foreground">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground">Upload Image</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      multiple
                      onChange={handleImageUpload}
                      disabled={processingImages}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>

            {/* Vehicle Type */}
            <div className="space-y-2">
              <Label htmlFor="vehicleType">Vehicle Type *</Label>
              <Select value={vehicleType} onValueChange={(value) => setValue('vehicleType', value)}>
                <SelectTrigger id="vehicleType">
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bus">School Bus</SelectItem>
                  <SelectItem value="van">Van</SelectItem>
                  <SelectItem value="minibus">Mini Bus</SelectItem>
                  <SelectItem value="car">Car</SelectItem>
                </SelectContent>
              </Select>
              {errors.vehicleType && (
                <p className="text-sm text-destructive">{errors.vehicleType.message}</p>
              )}
            </div>

            {/* Brand and Model */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand">Brand *</Label>
                <Input
                  id="brand"
                  placeholder="e.g., Tata, Ashok Leyland"
                  {...register('brand')}
                />
                {errors.brand && (
                  <p className="text-sm text-destructive">{errors.brand.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="model">Model *</Label>
                <Input
                  id="model"
                  placeholder="e.g., Starbus, Viking"
                  {...register('model')}
                />
                {errors.model && (
                  <p className="text-sm text-destructive">{errors.model.message}</p>
                )}
              </div>
            </div>

            {/* Year and Registration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="year">Year *</Label>
                <Input
                  id="year"
                  type="number"
                  placeholder="2020"
                  {...register('year', { valueAsNumber: true })}
                />
                {errors.year && (
                  <p className="text-sm text-destructive">{errors.year.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="registrationNumber">Registration Number *</Label>
                <Input
                  id="registrationNumber"
                  placeholder="e.g., MH-12-AB-1234"
                  {...register('registrationNumber')}
                />
                {errors.registrationNumber && (
                  <p className="text-sm text-destructive">{errors.registrationNumber.message}</p>
                )}
              </div>
            </div>

            {/* Seating Capacity and Mileage */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="seatingCapacity">Seating Capacity *</Label>
                <Input
                  id="seatingCapacity"
                  type="number"
                  placeholder="40"
                  {...register('seatingCapacity', { valueAsNumber: true })}
                />
                {errors.seatingCapacity && (
                  <p className="text-sm text-destructive">{errors.seatingCapacity.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="mileage">Mileage (km) *</Label>
                <Input
                  id="mileage"
                  type="number"
                  placeholder="50000"
                  {...register('mileage', { valueAsNumber: true })}
                />
                {errors.mileage && (
                  <p className="text-sm text-destructive">{errors.mileage.message}</p>
                )}
              </div>
            </div>

            {/* Fuel Type and Condition */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fuelType">Fuel Type *</Label>
                <Select value={fuelType} onValueChange={(value) => setValue('fuelType', value)}>
                  <SelectTrigger id="fuelType">
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diesel">Diesel</SelectItem>
                    <SelectItem value="petrol">Petrol</SelectItem>
                    <SelectItem value="cng">CNG</SelectItem>
                    <SelectItem value="electric">Electric</SelectItem>
                  </SelectContent>
                </Select>
                {errors.fuelType && (
                  <p className="text-sm text-destructive">{errors.fuelType.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <Select value={condition} onValueChange={(value) => setValue('condition', value)}>
                  <SelectTrigger id="condition">
                    <SelectValue placeholder="Select condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="needs-repair">Needs Repair</SelectItem>
                  </SelectContent>
                </Select>
                {errors.condition && (
                  <p className="text-sm text-destructive">{errors.condition.message}</p>
                )}
              </div>
            </div>

            {/* Price */}
            <div className="space-y-2">
              <Label htmlFor="price">Price (₹) *</Label>
              <Input
                id="price"
                type="number"
                placeholder="500000"
                {...register('price', { valueAsNumber: true })}
              />
              {errors.price && (
                <p className="text-sm text-destructive">{errors.price.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                rows={5}
                placeholder="Provide detailed information about the vehicle, its maintenance history, and any special features..."
                {...register('description')}
              />
              {errors.description && (
                <p className="text-sm text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Vehicle Features */}
            <div className="space-y-3">
              <Label>Vehicle Features</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {VEHICLE_FEATURES.map((feature) => (
                  <div key={feature} className="flex items-center space-x-2">
                    <Checkbox
                      id={feature}
                      checked={selectedFeatures.includes(feature)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedFeatures([...selectedFeatures, feature])
                        } else {
                          setSelectedFeatures(selectedFeatures.filter(f => f !== feature))
                        }
                      }}
                    />
                    <label
                      htmlFor={feature}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {feature}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isSubmitting || uploadingImages || processingImages}
                className="flex-1"
              >
                {processingImages ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing Images...
                  </>
                ) : uploadingImages ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading Images...
                  </>
                ) : isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Posting...
                  </>
                ) : (
                  'Post Vehicle'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/school/my-vehicles')}
                disabled={isSubmitting || uploadingImages || processingImages}
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
