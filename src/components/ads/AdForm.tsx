import React, { useState } from 'react';
import { Ad, AdPlacement, AdType, AdStatus } from '../../types/adTypes';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Loader2 } from 'lucide-react';

interface AdFormProps {
  initialData?: Partial<Ad>;
  onSubmit: (data: any) => Promise<void>;
  isSubmitting?: boolean;
}

export const AdForm: React.FC<AdFormProps> = ({ initialData, onSubmit, isSubmitting = false }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    advertiser: initialData?.advertiser || '',
    type: initialData?.type || 'image' as AdType,
    mediaUrl: initialData?.mediaUrl || '',
    htmlContent: initialData?.htmlContent || '',
    targetUrl: initialData?.targetUrl || '',
    placement: initialData?.placement || 'LP_TOP_BANNER' as AdPlacement,
    priority: initialData?.priority || 5,
    startDate: initialData?.startDate || '',
    endDate: initialData?.endDate || '',
    status: initialData?.status || 'draft' as AdStatus,
  });

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Ad' : 'Create New Ad'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="title">Ad Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange('title', e.target.value)}
                placeholder="e.g., Summer Sale"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="advertiser">Advertiser Name</Label>
              <Input
                id="advertiser"
                value={formData.advertiser}
                onChange={(e) => handleChange('advertiser', e.target.value)}
                placeholder="e.g., Acme Corp"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Placement Slot</Label>
              <Select
                value={formData.placement}
                onValueChange={(value) => handleChange('placement', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select placement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="LP_TOP_BANNER">Landing Page Top Banner</SelectItem>
                  <SelectItem value="LP_INLINE_1">Landing Page Inline 1</SelectItem>
                  <SelectItem value="LP_INLINE_2">Landing Page Inline 2</SelectItem>
                  <SelectItem value="LIST_SIDEBAR">Listing Sidebar</SelectItem>
                  <SelectItem value="DASH_TOP">Dashboard Top</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Media Type</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange('type', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="html">HTML Code</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.type === 'html' ? (
              <div className="col-span-2 space-y-2">
                <Label htmlFor="htmlContent">HTML Content</Label>
                <Textarea
                  id="htmlContent"
                  value={formData.htmlContent}
                  onChange={(e) => handleChange('htmlContent', e.target.value)}
                  placeholder="<div>...</div>"
                  className="font-mono h-32"
                />
              </div>
            ) : (
              <div className="col-span-2 space-y-2">
                <Label htmlFor="mediaUrl">Media URL</Label>
                <Input
                  id="mediaUrl"
                  value={formData.mediaUrl}
                  onChange={(e) => handleChange('mediaUrl', e.target.value)}
                  placeholder="https://example.com/image.jpg"
                />
                {formData.mediaUrl && (
                  <div className="mt-2 rounded-md border p-2 w-full max-w-sm">
                    {formData.type === 'image' ? (
                      <img src={formData.mediaUrl} alt="Preview" className="w-full h-auto rounded" />
                    ) : (
                      <video src={formData.mediaUrl} controls className="w-full h-auto rounded" />
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="col-span-2 space-y-2">
              <Label htmlFor="targetUrl">Target URL</Label>
              <Input
                id="targetUrl"
                value={formData.targetUrl}
                onChange={(e) => handleChange('targetUrl', e.target.value)}
                placeholder="https://example.com/landing"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority (1-10)</Label>
              <Input
                id="priority"
                type="number"
                min="1"
                max="10"
                value={formData.priority}
                onChange={(e) => handleChange('priority', parseInt(e.target.value))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="pending">Pending Approval</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="paused">Paused</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-4">
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {initialData ? 'Update Ad' : 'Create Ad'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
