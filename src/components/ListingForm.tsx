import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Upload, X, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { api } from '@/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { checkListingLimit, incrementListingCount } from '@/api/services/subscriptionEnforcement';
import { Alert } from '@/components/ui/alert';
import { Vehicle } from '@/api/types';

interface ListingFormProps {
  listing?: Vehicle | null;
  onSuccess?: () => Promise<void> | void;
  onCancel?: () => void;
}

export function ListingForm({ listing, onSuccess, onCancel }: ListingFormProps) {
  const navigate = useNavigate();
  const { user, refreshSubscription } = useAuth();
  const [listingCheckResult, setListingCheckResult] = useState<any>(null);
  const [checkingLimit, setCheckingLimit] = useState(!listing); // Only check limit if creating
  const [submitting, setSubmitting] = useState(false);
  
  // Remove the useEffect that redirects if user.id is missing
  // ProtectedRoute handles the main auth check, and we'll handle the id check gracefully

  const [formData, setFormData] = useState({
    title: listing?.title || '',
    manufacturer: listing?.manufacturer || '',
    vehicleModel: listing?.vehicleModel || '',
    year: listing?.year || new Date().getFullYear(),
    type: listing?.type || 'school-bus',
    price: listing?.price?.toString() || '',
    mileage: listing?.mileage?.toString() || '',
    condition: listing?.condition || 'good',
    registrationNumber: listing?.registrationNumber || '',
    description: listing?.description || '',
    insuranceValid: listing?.insurance?.valid || false,
    insuranceExpiry: listing?.insurance?.expiryDate ? new Date(listing.insurance.expiryDate).toISOString().split('T')[0] : '',
    insuranceProvider: listing?.insurance?.provider || '',
    fitnessValid: listing?.fitness?.valid || false,
    fitnessExpiry: listing?.fitness?.expiryDate ? new Date(listing.fitness.expiryDate).toISOString().split('T')[0] : '',
    roadTaxValid: listing?.roadTax?.valid || false,
    roadTaxExpiry: listing?.roadTax?.expiryDate ? new Date(listing.roadTax.expiryDate).toISOString().split('T')[0] : '',
    permitValid: listing?.permit?.valid || false,
    permitExpiry: listing?.permit?.expiryDate ? new Date(listing.permit.expiryDate).toISOString().split('T')[0] : '',
    permitType: listing?.permit?.permitType || '',
  });

  const [uploadedImages, setUploadedImages] = useState<Array<{ url: string; file?: File; preview: string }>>(() => {
    if (listing?.images) {
      return listing.images.map(url => ({
        url,
        preview: url
      }));
    }
    return [];
  });
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check listing limit on component mount only if creating new listing
  useEffect(() => {
    if (listing) return;
    
    const checkLimit = async () => {
      const userId = user?.id || (user as any)?._id;
      if (!userId) {
        setCheckingLimit(false);
        return;
      }

      try {
        const result = await checkListingLimit(userId);
        setListingCheckResult(result.data);
      } catch (err) {
        console.error('Listing limit check error:', err);
      } finally {
        setCheckingLimit(false);
      }
    };

    checkLimit();
  }, [user?.id, (user as any)?._id, listing]);

  // If no user, don't render anything (Dashboard handles the loading state)
  if (!user) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'year' || name === 'price' || name === 'mileage' ? parseFloat(value) || value : value)
    }));
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    
    // Check total images limit
    if (uploadedImages.length + fileArray.length > 10) {
      toast.error('Maximum 10 images allowed per listing');
      return;
    }

    setUploading(true);

    try {
      // Create preview URLs for immediate display
      const newImages = fileArray.map(file => ({
        url: '', // Will be filled after upload
        file,
        preview: URL.createObjectURL(file),
      }));

      setUploadedImages(prev => [...prev, ...newImages]);

      // Upload to backend
      const response = await api.vehicles.uploadVehicleImages(fileArray);
      
      if (response.success) {
        // Update URLs with mock uploaded URLs
        setUploadedImages(prev => 
          prev.map((img, idx) => {
            if (img.url === '') {
              const uploadedData = response.data[idx - (prev.length - fileArray.length)];
              return uploadedData ? { ...img, url: uploadedData.url } : img;
            }
            return img;
          })
        );
        toast.success(response.message || 'Images uploaded successfully');
      }
    } catch (error: any) {
      toast.error(error.error || 'Failed to upload images');
      // Remove failed uploads
      setUploadedImages(prev => prev.filter(img => img.url !== ''));
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setUploadedImages(prev => {
      const newImages = [...prev];
      // Revoke preview URL to free memory if it was created locally
      if (newImages[index].file) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const userId = user?.id || (user as any)?._id;

    if (!userId) {
      toast.error('You must be logged in to create a listing');
      return;
    }

    // Check listing limit before submission only for new listings
    if (!listing && listingCheckResult && !listingCheckResult.allowed) {
      toast.error(listingCheckResult.message || 'Listing limit reached');
      return;
    }

    if (uploadedImages.length === 0) {
      toast.error('Please upload at least one image');
      return;
    }

    // Validate required fields (trim whitespace)
    const trimmedTitle = formData.title.trim();
    const trimmedManufacturer = formData.manufacturer.trim();
    const trimmedVehicleModel = formData.vehicleModel.trim();
    const trimmedDescription = formData.description.trim();
    const trimmedRegNumber = formData.registrationNumber.trim();

    if (!trimmedTitle) {
      toast.error('Title is required');
      return;
    }
    if (!trimmedManufacturer) {
      toast.error('Manufacturer is required');
      return;
    }
    if (!trimmedVehicleModel) {
      toast.error('Model is required');
      return;
    }
    if (!trimmedDescription) {
      toast.error('Description is required');
      return;
    }
    if (!trimmedRegNumber) {
      toast.error('Registration Number is required');
      return;
    }
    if (!formData.price || Number(formData.price) <= 0) {
      toast.error('Please enter a valid price');
      return;
    }
    if (!formData.mileage || Number(formData.mileage) < 0) {
      toast.error('Please enter a valid mileage');
      return;
    }

    setSubmitting(true);

    try {
      // Prepare image URLs for submission
      const imageUrls = uploadedImages.map(img => img.url);

      // Construct payload matching backend model (use trimmed values)
      const payload: any = {
        title: trimmedTitle,
        manufacturer: trimmedManufacturer,
        vehicleModel: trimmedVehicleModel,
        year: Number(formData.year),
        type: formData.type,
        price: Number(formData.price),
        registrationNumber: trimmedRegNumber,
        mileage: Number(formData.mileage),
        condition: formData.condition,
        description: trimmedDescription,
        images: imageUrls,
        features: listing?.features || [], 
      };

      // Add nested objects if valid
      if (formData.insuranceValid) {
        payload.insurance = {
          valid: true,
          provider: formData.insuranceProvider,
          expiryDate: formData.insuranceExpiry ? new Date(formData.insuranceExpiry) : undefined,
        };
      }

      if (formData.fitnessValid) {
        payload.fitness = {
          valid: true,
          expiryDate: formData.fitnessExpiry ? new Date(formData.fitnessExpiry) : undefined,
        };
      }

      if (formData.roadTaxValid) {
        payload.roadTax = {
          valid: true,
          expiryDate: formData.roadTaxExpiry ? new Date(formData.roadTaxExpiry) : undefined,
        };
      }

      if (formData.permitValid) {
        payload.permit = {
          valid: true,
          permitType: formData.permitType,
          expiryDate: formData.permitExpiry ? new Date(formData.permitExpiry) : undefined,
        };
      }

      if (listing) {
        // Update existing vehicle
        await api.vehicles.updateVehicle({
          id: listing.id || (listing as any)._id,
          ...payload
        });
        toast.success('Listing updated successfully!');
      } else {
        // Call API to create vehicle
        await api.vehicles.createVehicle(payload, userId);
        
        // Increment listing count if user has subscription
        if (userId) {
          try {
            await refreshSubscription();
          } catch (err) {
            console.error('Failed to refresh subscription:', err);
          }
        }
        toast.success('Listing created successfully!');
      }

      if (onSuccess) {
        await onSuccess();
        // Don't navigate - let parent component handle tab switching after refetch
      } else {
        navigate('/dashboard'); // Redirect to dashboard
      }
    } catch (error: any) {
      console.error('Failed to save listing:', error);
      toast.error(error.error || `Failed to ${listing ? 'update' : 'create'} listing`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{listing ? 'Edit Listing' : 'Create New Listing'}</h2>
        {listing && onCancel && (
          <Button variant="outline" onClick={onCancel}>
            Cancel Edit
          </Button>
        )}
      </div>

      {/* Listing Limit Warning - Only show when creating */}
      {!listing && checkingLimit ? (
        <div className="mb-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <div className="ml-4">
              <p className="text-sm">Checking subscription limits...</p>
            </div>
          </Alert>
        </div>
      ) : !listing && listingCheckResult && !listingCheckResult.allowed ? (
        <div className="mb-6">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <div className="ml-4">
              <p className="font-semibold">Listing Limit Reached</p>
              <p className="text-sm mt-1">
                {listingCheckResult.message || 'You have reached your listing limit. Contact admin to upgrade your subscription.'}
              </p>
            </div>
          </Alert>
        </div>
      ) : !listing && listingCheckResult && listingCheckResult.remaining <= 2 ? (
        <div className="mb-6">
          <Alert className="border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <div className="ml-4">
              <p className="font-semibold text-amber-900">Low Listing Quota</p>
              <p className="text-sm mt-1 text-amber-800">
                You have {listingCheckResult.remaining} listing{listingCheckResult.remaining !== 1 ? 's' : ''} remaining in your current subscription.
              </p>
            </div>
          </Alert>
        </div>
      ) : null}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form */}
        <Card className="lg:col-span-2 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Image Upload Section */}
            <div className="border-b border-border pb-6">
              <h3 className="font-semibold mb-4 text-foreground flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Vehicle Images
              </h3>
              
              {/* Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  isDragging
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  onChange={(e) => handleFileSelect(e.target.files)}
                  className="hidden"
                />
                
                <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm font-medium mb-2">
                  Drag and drop images here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground mb-4">
                  Supports: JPEG, PNG, WebP • Max 5MB per file • Up to 10 images
                </p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading || uploadedImages.length >= 10}
                >
                  {uploading ? 'Uploading...' : 'Select Images'}
                </Button>
              </div>

              {/* Image Previews */}
              {uploadedImages.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm font-medium mb-3">
                    Uploaded Images ({uploadedImages.length}/10)
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {uploadedImages.map((image, index) => (
                      <div
                        key={index}
                        className="relative group rounded-lg overflow-hidden border border-border aspect-square"
                      >
                        <img
                          src={image.preview}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          title="Remove image"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        {image.url === '' && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Title <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="title"
                  placeholder="e.g., Yellow School Bus 2020"
                  value={formData.title}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type <span className="text-red-500">*</span></label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="school-bus">School Bus</option>
                  <option value="minibus">Minibus</option>
                  <option value="van">Van</option>
                  <option value="truck">Truck</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Manufacturer <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="manufacturer"
                  placeholder="e.g., Blue Bird"
                  value={formData.manufacturer}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Model <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="vehicleModel"
                  placeholder="e.g., Vision"
                  value={formData.vehicleModel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Year <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Price (₹) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="price"
                  placeholder="45000"
                  value={formData.price}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Mileage (km) <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="mileage"
                  placeholder="45000"
                  value={formData.mileage}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="needs-repair">Needs Repair</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Registration Number <span className="text-red-500">*</span></label>
              <input
                type="text"
                name="registrationNumber"
                placeholder="MH-02-AB-1234"
                value={formData.registrationNumber}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
            </div>

            {/* Insurance & Documents Section */}
            <div className="border-t border-border pt-6 mt-4">
              <h3 className="font-semibold mb-4 text-foreground">Insurance & Documents</h3>
              <div className="space-y-4">
                {/* Insurance */}
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <input
                    type="checkbox"
                    name="insuranceValid"
                    checked={formData.insuranceValid}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label className="text-sm font-medium">Insurance Valid</label>
                </div>
                {formData.insuranceValid && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Insurance Provider</label>
                      <input
                        type="text"
                        name="insuranceProvider"
                        placeholder="e.g., ICICI Insurance"
                        value={formData.insuranceProvider}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Expiry Date</label>
                      <input
                        type="date"
                        name="insuranceExpiry"
                        value={formData.insuranceExpiry}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}

                {/* Fitness */}
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <input
                    type="checkbox"
                    name="fitnessValid"
                    checked={formData.fitnessValid}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label className="text-sm font-medium">Fitness Certificate Valid</label>
                </div>
                {formData.fitnessValid && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Fitness Expiry Date</label>
                    <input
                      type="date"
                      name="fitnessExpiry"
                      value={formData.fitnessExpiry}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                {/* Road Tax */}
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <input
                    type="checkbox"
                    name="roadTaxValid"
                    checked={formData.roadTaxValid}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label className="text-sm font-medium">Road Tax Valid</label>
                </div>
                {formData.roadTaxValid && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Road Tax Expiry Date</label>
                    <input
                      type="date"
                      name="roadTaxExpiry"
                      value={formData.roadTaxExpiry}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}

                {/* Permit */}
                <div className="flex items-center gap-4 p-3 bg-muted/50 rounded-lg">
                  <input
                    type="checkbox"
                    name="permitValid"
                    checked={formData.permitValid}
                    onChange={handleChange}
                    className="w-4 h-4 rounded border-border"
                  />
                  <label className="text-sm font-medium">Permit Valid</label>
                </div>
                {formData.permitValid && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Permit Type</label>
                      <input
                        type="text"
                        name="permitType"
                        placeholder="e.g., School Transport"
                        value={formData.permitType}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">Expiry Date</label>
                      <input
                        type="date"
                        name="permitExpiry"
                        value={formData.permitExpiry}
                        onChange={handleChange}
                        className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description <span className="text-red-500">*</span></label>
              <textarea
                name="description"
                placeholder="Describe the vehicle in detail..."
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                required
              />
            </div>

            <div className="pt-4 border-t border-border flex gap-3">
              {listing && onCancel && (
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={onCancel}
                  disabled={submitting}
                >
                  Cancel
                </Button>
              )}
              <Button 
                type="submit" 
                className={listing && onCancel ? "flex-1" : "w-full"} 
                size="lg"
                disabled={submitting || (!listing && listingCheckResult && !listingCheckResult.allowed)}
              >
                {submitting ? (listing ? 'Updating...' : 'Creating Listing...') : (listing ? 'Update Listing' : 'Create Listing')}
              </Button>
            </div>
            
            {uploadedImages.length === 0 && (
              <p className="text-sm text-muted-foreground text-center mt-2">
                Please upload at least one image to {listing ? 'update' : 'create'} listing
              </p>
            )}
            {!listing && listingCheckResult && !listingCheckResult.allowed && (
              <p className="text-sm text-destructive text-center mt-2">
                Cannot create listing: {listingCheckResult.message}
              </p>
            )}
          </form>
        </Card>

        {/* Preview */}
        <div>
          <h3 className="font-semibold mb-4">Preview</h3>
          <Card className="p-4 sticky top-20">
            <div className="space-y-3">
              {(formData.title || uploadedImages.length > 0) && (
                <>
                  <div className="bg-muted rounded-lg h-32 overflow-hidden">
                    {uploadedImages.length > 0 ? (
                      <img
                        src={uploadedImages[0].preview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                        Upload images to preview
                      </div>
                    )}
                  </div>
                  {uploadedImages.length > 1 && (
                    <div className="flex gap-1 overflow-x-auto">
                      {uploadedImages.slice(1, 4).map((img, idx) => (
                        <div key={idx} className="w-12 h-12 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={img.preview}
                            alt={`Thumbnail ${idx + 2}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ))}
                      {uploadedImages.length > 4 && (
                        <div className="w-12 h-12 rounded bg-muted flex items-center justify-center text-xs font-medium flex-shrink-0">
                          +{uploadedImages.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                  {formData.title && (
                    <div>
                      <h4 className="font-semibold line-clamp-2">{formData.title}</h4>
                      <p className="text-sm text-muted-foreground">{formData.manufacturer} {formData.vehicleModel} • {formData.year}</p>
                    </div>
                  )}
                  {formData.price && (
                    <div className="text-2xl font-bold text-primary">₹{parseInt(formData.price).toLocaleString()}</div>
                  )}
                </>
              )}
              {!formData.title && uploadedImages.length === 0 && (
                 <div className="text-center text-muted-foreground py-8">
                   Upload images and fill form to see preview
                 </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
