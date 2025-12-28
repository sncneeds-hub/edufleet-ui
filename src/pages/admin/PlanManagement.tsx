import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Edit2, Power, PowerOff, ShieldCheck, Clock, Settings, Briefcase, Car, Eye } from 'lucide-react';
import { 
  getAllSubscriptionPlans, 
  createSubscriptionPlan, 
  updateSubscriptionPlan, 
  toggleSubscriptionPlanStatus 
} from '@/api/services/subscriptionService';
import { SubscriptionPlan, CreateSubscriptionPlanDto } from '@/types';
import toast from 'react-hot-toast';

export function PlanManagement() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<CreateSubscriptionPlanDto>({
    name: '',
    displayName: '',
    description: '',
    planType: 'institute',
    price: 0,
    currency: 'INR',
    duration: 30,
    features: {
      maxListings: 5,
      maxJobPosts: 0,
      maxBrowsesPerMonth: 50,
      dataDelayDays: 0,
      teacherDataDelayDays: 0,
      canAdvertiseVehicles: false,
      instantVehicleAlerts: false,
      instantJobAlerts: false,
      priorityListings: false,
      analytics: false,
      supportLevel: 'basic',
    }
  });

  useEffect(() => {
    loadPlans();
  }, []);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await getAllSubscriptionPlans();
      if (response.success && response.data) {
        setPlans(response.data);
      }
    } catch (err) {
      toast.error('Failed to load subscription plans');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingPlan(null);
    setFormData({
      name: '',
      displayName: '',
      description: '',
      planType: 'institute',
      price: 0,
      currency: 'INR',
      duration: 30,
      features: {
        maxListings: 5,
        maxJobPosts: 0,
        maxBrowsesPerMonth: 50,
        dataDelayDays: 0,
        teacherDataDelayDays: 0,
        canAdvertiseVehicles: false,
        instantVehicleAlerts: false,
        instantJobAlerts: false,
        priorityListings: false,
        analytics: false,
        supportLevel: 'basic',
      }
    });
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan);
    setFormData({
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description,
      planType: plan.planType,
      price: plan.price,
      currency: plan.currency || 'INR',
      duration: plan.duration,
      features: { ...plan.features }
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingPlan) {
        await updateSubscriptionPlan({
          id: editingPlan.id,
          ...formData
        });
        toast.success('Plan updated successfully');
      } else {
        await createSubscriptionPlan(formData);
        toast.success('Plan created successfully');
      }
      setIsDialogOpen(false);
      loadPlans();
    } catch (err: any) {
      toast.error(err.error || 'Failed to save plan');
    }
  };

  const handleToggleStatus = async (planId: string) => {
    try {
      await toggleSubscriptionPlanStatus(planId);
      toast.success('Plan status updated');
      loadPlans();
    } catch (err) {
      toast.error('Failed to toggle plan status');
    }
  };

  const updateFeature = (key: keyof CreateSubscriptionPlanDto['features'], value: any) => {
    setFormData(prev => ({
      ...prev,
      features: {
        ...prev.features,
        [key]: value
      }
    }));
  };

  if (loading && plans.length === 0) {
    return <div className="p-8 text-center">Loading plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold">Subscription Plans</h2>
          <p className="text-sm text-muted-foreground">Define and manage plans for teachers, institutes, and vendors</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Create New Plan
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Details</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Price & Duration</TableHead>
                <TableHead>Features Overview</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div>
                      <p className="font-bold">{plan.displayName}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{plan.description}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {plan.planType}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">₹{plan.price.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">{plan.duration} Days</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="secondary" className="text-[10px]">
                        <Car className="w-3 h-3 mr-1" /> {plan.features.maxListings}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        <Briefcase className="w-3 h-3 mr-1" /> {plan.features.maxJobPosts}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        <Eye className="w-3 h-3 mr-1" /> {plan.features.maxBrowsesPerMonth}
                      </Badge>
                      {plan.features.priorityListings && (
                        <Badge className="bg-amber-100 text-amber-700 text-[10px]">Priority</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {plan.isActive ? (
                      <Badge className="bg-green-100 text-green-700">Active</Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-700">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenEdit(plan)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className={plan.isActive ? "text-red-500" : "text-green-500"}
                        onClick={() => handleToggleStatus(plan.id)}
                      >
                        {plan.isActive ? <PowerOff className="w-4 h-4" /> : <Power className="w-4 h-4" />}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingPlan ? 'Edit Plan' : 'Create New Plan'}</DialogTitle>
            <DialogDescription>
              Configure the details and features of the subscription plan.
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <Settings className="w-4 h-4" /> Basic Information
              </h3>
              
              <div className="space-y-2">
                <Label>System Name (Unique ID)</Label>
                <Input 
                  placeholder="e.g. premium-institute-yearly" 
                  value={formData.name}
                  onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Display Name</Label>
                <Input 
                  placeholder="e.g. Premium Institute" 
                  value={formData.displayName}
                  onChange={e => setFormData(prev => ({ ...prev, displayName: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  placeholder="Describe the plan benefits..." 
                  value={formData.description}
                  onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Plan Type</Label>
                  <Select 
                    value={formData.planType} 
                    onValueChange={(val: any) => setFormData(prev => ({ ...prev, planType: val }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="institute">Institute</SelectItem>
                      <SelectItem value="vendor">Vendor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Support Level</Label>
                  <Select 
                    value={formData.features.supportLevel} 
                    onValueChange={(val: any) => updateFeature('supportLevel', val)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="priority">Priority</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (₹)</Label>
                  <Input 
                    type="number" 
                    value={formData.price}
                    onChange={e => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Duration (Days)</Label>
                  <Input 
                    type="number" 
                    value={formData.duration}
                    onChange={e => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" /> Feature Limits
              </h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Max Listings (Vehicles/Teachers)</Label>
                    <span className="text-xs text-muted-foreground">{formData.features.maxListings}</span>
                  </div>
                  <Input 
                    type="number" 
                    value={formData.features.maxListings}
                    onChange={e => updateFeature('maxListings', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Max Job Posts</Label>
                    <span className="text-xs text-muted-foreground">{formData.features.maxJobPosts}</span>
                  </div>
                  <Input 
                    type="number" 
                    value={formData.features.maxJobPosts}
                    onChange={e => updateFeature('maxJobPosts', Number(e.target.value))}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label>Max Browses Per Month</Label>
                    <span className="text-xs text-muted-foreground">{formData.features.maxBrowsesPerMonth}</span>
                  </div>
                  <Input 
                    type="number" 
                    value={formData.features.maxBrowsesPerMonth}
                    onChange={e => updateFeature('maxBrowsesPerMonth', Number(e.target.value))}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Vehicle Delay (Days)</Label>
                    <Input 
                      type="number" 
                      value={formData.features.dataDelayDays}
                      onChange={e => updateFeature('dataDelayDays', Number(e.target.value))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Teacher Delay (Days)</Label>
                    <Input 
                      type="number" 
                      value={formData.features.teacherDataDelayDays}
                      onChange={e => updateFeature('teacherDataDelayDays', Number(e.target.value))}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Priority Listings</Label>
                    <p className="text-xs text-muted-foreground">Listings appear at top</p>
                  </div>
                  <Switch 
                    checked={formData.features.priorityListings}
                    onCheckedChange={checked => updateFeature('priorityListings', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Allow Ads</Label>
                    <p className="text-xs text-muted-foreground">Can list advertisement banners</p>
                  </div>
                  <Switch 
                    checked={formData.features.canAdvertiseVehicles}
                    onCheckedChange={checked => updateFeature('canAdvertiseVehicles', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Instant Alerts</Label>
                    <p className="text-xs text-muted-foreground">Get real-time notifications</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">Vehicles</span>
                      <Switch 
                        checked={formData.features.instantVehicleAlerts}
                        onCheckedChange={checked => updateFeature('instantVehicleAlerts', checked)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px]">Jobs</span>
                      <Switch 
                        checked={formData.features.instantJobAlerts}
                        onCheckedChange={checked => updateFeature('instantJobAlerts', checked)}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Analytics Dashboard</Label>
                    <p className="text-xs text-muted-foreground">Access detailed usage stats</p>
                  </div>
                  <Switch 
                    checked={formData.features.analytics}
                    onCheckedChange={checked => updateFeature('analytics', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>
              {editingPlan ? 'Update Plan' : 'Create Plan'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
