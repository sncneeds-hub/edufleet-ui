import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { blink } from '@/lib/blink';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Loader2, Upload, X, ArrowLeft } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { VEHICLE_FEATURES, stringifyFeatures, getFeaturesArray } from '@/lib/vehicleFeatures';
import { processImagesForUploadAdvanced, formatFileSize } from '@/lib/imageCompression';

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

interface Vehicle extends VehicleFormData {
  id: string;
  images: string;
  instituteId: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export default function EditVehicle() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<Set<string>>(new Set());
  const [uploadingImages, setUploadingImages] = useState(false);
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

  const vehicleType = watch('vehicleType');
  const fuelType = watch('fuelType');
  const condition = watch('condition');

  useEffect(() => {
    if (id) {
      loadVehicleDetails();
    }
  }, [loadVehicleDetails, id]);

  const loadVehicleDetails = useCallback(async () => {
    try {
      if (!id) {
        toast.error('Vehicle ID not found');
        navigate('/school/my-vehicles');
        return;
      }

      const vehicleData = await api.vehicles.getById(id);
      
      if (!vehicleData) {
        toast.error('Vehicle not found');
        navigate('/school/my-vehicles');
        return;
      }

      setVehicle(vehicleData as Vehicle);

      // Parse and set existing images
      const images = typeof vehicleData.images === 'string' 
        ? JSON.parse(vehicleData.images || '[]')
        : vehicleData.images || [];
      setExistingImages(images);

      // Parse and set existing features
      const features = getFeaturesArray(vehicleData.features);
      setSelectedFeatures(features);

      // Pre-fill form
      setValue('vehicleType', vehicleData.vehicleType);
      setValue('brand', vehicleData.brand);
      setValue('model', vehicleData.vehicleModel);
      setValue('year', vehicleData.year);
      setValue('registrationNumber', vehicleData.registrationNumber);
      setValue('seatingCapacity', vehicleData.seatingCapacity);
      setValue('mileage', vehicleData.mileage);
      setValue('fuelType', vehicleData.fuelType);
      setValue('price', vehicleData.price);
      setValue('description', vehicleData.description);
      setValue('condition', vehicleData.condition);
    } catch (error) {
      console.error('Failed to load vehicle:', error);
      toast.error('Failed to load vehicle details');
      navigate('/school/my-vehicles');
    } finally {
      setLoading(false);
    }
  }, [id, navigate, setValue]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = existingImages.length - imagesToDelete.size + images.length + files.length;
    
    if (totalImages > 10) {
      toast.error(`Maximum 10 images allowed. You have ${existingImages.length - imagesToDelete.size + images.length} images.`);
      return;
    }

    setProcessingImages(true);
    try {
      // Process images with validation and compression
      const processedFiles = await processImagesForUploadAdvanced(files, {
        preset: 'gallery',
        maxImages: 10 - (existingImages.length - imagesToDelete.size + images.length),
        showToasts: true,
        onProgress: (fileIndex, progress) => {
          setImageProgress(prev => ({ ...prev, [fileIndex]: progress }));
        },
      });

      if (processedFiles.length === 0) {
        return;
      }

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
      toast.error('Failed to process images. Please try again.');
    } finally {
      setProcessingImages(false);
    }
  };

  const removeNewImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    setImagePreview(prev => prev.filter((_, i) => i !== index));
  };

  const toggleRemoveExistingImage = (imageUrl: string) => {
    const newSet = new Set(imagesToDelete);
    if (newSet.has(imageUrl)) {
      newSet.delete(imageUrl);
    } else {
      newSet.add(imageUrl);
    }
    setImagesToDelete(newSet);
  };

  const onSubmit = async (data: VehicleFormData) => {
    if (existingImages.length - imagesToDelete.size + images.length === 0) {
      toast.error('Please keep at least one image or upload a new one');
      return;
    }

    setIsSubmitting(true);
    try {
      const finalImageUrls: string[] = [];

      // Keep existing images that are not marked for deletion
      existingImages.forEach(img => {
        if (!imagesToDelete.has(img)) {
          finalImageUrls.push(img);
        }
      });

      // Upload new images
      if (images.length > 0) {
        setUploadingImages(true);
        for (let i = 0; i < images.length; i++) {
          const file = images[i];
          const extension = file.name.split('.').pop();
          const { publicUrl } = await blink.storage.upload(
            file,
            `vehicles/${Date.now()}-${i}.${extension}`,
            { upsert: true }
          );
          finalImageUrls.push(publicUrl);
        }
        setUploadingImages(false);
      }

      // Update vehicle
      await api.vehicles.update(vehicle!.id, {
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
        images: JSON.stringify(finalImageUrls),
        // Reset approval status for edited vehicles
        approvalStatus: 'pending',
      });

      toast.success('Vehicle updated successfully! Your updated listing is now pending admin approval.');
      navigate('/school/my-vehicles');
    } catch (error) {
      console.error('Error updating vehicle:', error);
      toast.error('Failed to update vehicle. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadingImages(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout activeTab="my-vehicles">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading vehicle details...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!vehicle) {
    return (
      <DashboardLayout activeTab="my-vehicles">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Vehicle not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const remainingImageSlots = 10 - (existingImages.length - imagesToDelete.size + images.length);

  return (
    <DashboardLayout activeTab="my-vehicles">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate('/school/my-vehicles')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Edit Vehicle</h1>
            <p className="text-muted-foreground">
              {vehicle.brand} {vehicle.model} ({vehicle.year})
            </p>
          </div>
        </div>

        {vehicle.approvalStatus === 'approved' && (
          <Card className="mb-6 border-blue-500 bg-blue-50">
            <CardContent className="pt-6">
              <p className="text-blue-900">
                <strong>Note:</strong> This vehicle is currently approved. After editing, it will be moved back to pending status for admin re-review.
              </p>
            </CardContent>
          </Card>
        )}

        {vehicle.approvalStatus === 'rejected' && vehicle.rejectionReason && (
          <Card className="mb-6 border-red-500 bg-red-50">
            <CardContent className="pt-6">
              <p className="text-red-900 font-semibold mb-2">Rejection Reason:</p>
              <p className="text-red-800">{vehicle.rejectionReason}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Edit Vehicle Details</CardTitle>
            <CardDescription>
              Update your vehicle information. Images can be added or removed.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              {/* Vehicle Images */}
              <div className="space-y-2">
                <Label>Vehicle Images ({existingImages.length - imagesToDelete.size + images.length}/10)</Label>
                <p className="text-sm text-muted-foreground">
                  Upload high-quality images (JPEG, PNG, WebP). Max 5MB per image. Images will be automatically compressed.
                </p>
                
                {/* Existing Images */}
                {existingImages.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-semibold text-muted-foreground">Existing Images</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {existingImages.map((image) => (
                        <div
                          key={image}
                          className={`relative aspect-video bg-muted rounded-lg overflow-hidden ${
                            imagesToDelete.has(image) ? 'opacity-50' : ''
                          }`}
                        >
                          <img src={image} alt="Vehicle" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => toggleRemoveExistingImage(image)}
                            className={`absolute top-2 right-2 rounded-full p-1 text-destructive-foreground ${
                              imagesToDelete.has(image)
                                ? 'bg-green-500 hover:bg-green-600'
                                : 'bg-destructive hover:bg-destructive/90'
                            }`}
                          >
                            {imagesToDelete.has(image) ? '✓' : <X className="w-4 h-4" />}
                          </button>
                          <span className="absolute bottom-2 left-2 text-xs bg-black/50 text-white px-2 py-1 rounded">
                            {imagesToDelete.has(image) ? 'To Remove' : 'Keep'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* New Images Preview */}
                {imagePreview.length > 0 && (
                  <div className="space-y-2 mb-4">
                    <p className="text-sm font-semibold text-muted-foreground">New Images</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {imagePreview.map((preview, index) => (
                        <div key={index} className="relative aspect-video bg-muted rounded-lg overflow-hidden border-2 border-green-500">
                          <img src={preview} alt={`New ${index + 1}`} className="w-full h-full object-cover" />
                          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                            {formatFileSize(images[index]?.size || 0)}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeNewImage(index)}
                            className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Upload Zone */}
                {remainingImageSlots > 0 && (
                  <label className={`aspect-video border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors ${processingImages ? 'opacity-50 cursor-not-allowed' : ''}`}>
                    {processingImages ? (
                      <>
                        <Loader2 className="w-8 h-8 text-muted-foreground mb-2 animate-spin" />
                        <span className="text-sm text-muted-foreground">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2" />
                        <span className="text-sm text-muted-foreground text-center">
                          Upload Image ({remainingImageSlots} slots remaining)
                        </span>
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
                  <Label htmlFor="registrationNumber">Registration Number * (Cannot be changed)</Label>
                  <Input
                    id="registrationNumber"
                    placeholder="e.g., MH-12-AB-1234"
                    {...register('registrationNumber')}
                    disabled
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
                      Updating...
                    </>
                  ) : (
                    'Save Changes'
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