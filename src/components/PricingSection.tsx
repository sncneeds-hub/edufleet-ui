import { useNavigate } from 'react-router-dom';
import { useSubscriptionPlans } from '@/hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SubscriptionPlan } from '@/types/subscriptionTypes';

interface PricingCardGridProps {
  plans: SubscriptionPlan[];
  loading: boolean;
  onSelectPlan: (planId: string) => void;
}

function PricingCardGrid({ plans, loading, onSelectPlan }: PricingCardGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i} className="flex flex-col h-full border-2 border-transparent">
            <CardHeader className="space-y-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-10 w-1/3" />
              <Skeleton className="h-4 w-full" />
            </CardHeader>
            <CardContent className="flex-1 space-y-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <Skeleton key={j} className="h-4 w-full" />
              ))}
            </CardContent>
            <CardFooter>
              <Skeleton className="h-10 w-full rounded-md" />
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No plans available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
      {plans.map((plan) => {
        const isPopular = plan.name.toLowerCase().includes('institute') || plan.name.toLowerCase().includes('pro');
        
        // Extract displayable features
        const featuresList: string[] = [];
        if (Array.isArray(plan.features)) {
          featuresList.push(...plan.features);
        } else if (plan.features && typeof plan.features === 'object') {
          const f = plan.features as any;
          if (f.maxListings !== undefined && f.maxListings > 0) featuresList.push(`${f.maxListings === 999999 ? 'Unlimited' : f.maxListings} Vehicle Listings`);
          if (f.maxJobPosts !== undefined && f.maxJobPosts > 0) featuresList.push(`${f.maxJobPosts === 999999 ? 'Unlimited' : f.maxJobPosts} Job Posts`);
          if (f.maxBrowsesPerMonth !== undefined) featuresList.push(`${f.maxBrowsesPerMonth} Browse Views/Month`);
          if (f.dataDelayDays !== undefined) featuresList.push(f.dataDelayDays === 0 ? 'Real-time Data Access' : `${f.dataDelayDays} Days Data Delay`);
          if (f.analytics) featuresList.push("Advanced Analytics");
          if (f.priorityListings) featuresList.push("Priority Listing Status");
          if (f.canAdvertiseVehicles) featuresList.push("Advertise Vehicles");
          if (f.instantVehicleAlerts) featuresList.push("Instant Alerts");
          if (f.supportLevel) featuresList.push(`${f.supportLevel.charAt(0).toUpperCase() + f.supportLevel.slice(1)} Support`);
        }

        return (
          <Card 
            key={plan.id} 
            className={`flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 relative border-2 ${
              isPopular ? 'border-primary shadow-xl scale-105 z-10' : 'border-white/50 shadow-md'
            }`}
          >
            {isPopular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg">
                <Star className="w-3 h-3 fill-current" />
                Most Popular
              </div>
            )}
            
            <CardHeader className="pt-8">
              <CardTitle className="text-2xl font-bold flex items-center justify-between">
                {plan.displayName}
              </CardTitle>
              <CardDescription className="text-sm min-h-[40px] mt-2">
                {plan.description}
              </CardDescription>
              <div className="mt-6 flex items-baseline">
                <span className="text-4xl font-extrabold text-gray-900">
                  {plan.price === 0 ? 'Free' : `₹${plan.price.toLocaleString()}`}
                </span>
                {plan.price > 0 && (
                  <span className="ml-1 text-muted-foreground font-medium">/{plan.billingPeriod === 'monthly' ? 'mo' : 'yr'}</span>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="flex-1 pt-4 pb-8">
              <div className="space-y-3">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">What's Included</p>
                
                {featuresList.length > 0 ? (
                  featuresList.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <div className="mt-1 rounded-full bg-primary/10 p-1">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-gray-600 leading-tight">{feature}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground italic">Basic features included</div>
                )}
              </div>
            </CardContent>
            
            <CardFooter className="pb-8">
              <Button 
                className={`w-full font-bold h-12 transition-all duration-300 ${
                  isPopular ? 'bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/20' : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white'
                }`}
                onClick={() => onSelectPlan(plan.id)}
              >
                {plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

export function PricingSection() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine plan type based on user role
  let planType: 'teacher' | 'institute' | 'vendor' | undefined;
  if (user?.role === 'teacher') {
    planType = 'teacher';
  } else if (user?.role === 'institute') {
    planType = 'institute';
  } else if (user?.role === 'vendor') {
    planType = 'vendor';
  }

  // If logged in, fetch specific plans. If not, fetch all (planType undefined)
  const { plans: fetchedPlans, loading, error } = useSubscriptionPlans(planType);

  // Explicitly filter plans if planType is set (client-side safety) to ensure logged-in users only see their relevant plans
  const plans = planType 
    ? fetchedPlans.filter(p => p.planType === planType)
    : fetchedPlans;

  if (error) {
    return null; // Don't show the section if there's an error
  }

  const handleSelectPlan = (planId: string) => {
    navigate('/signup', { state: { planId } });
  };

  // Filter plans for guest view
  const institutePlans = plans.filter(p => p.planType === 'institute');
  const teacherPlans = plans.filter(p => p.planType === 'teacher');
  const supplierPlans = plans.filter(p => p.planType === 'vendor');

  return (
    <section id="pricing" className="py-24 bg-slate-50 overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-[100px] translate-y-1/2"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge variant="outline" className="mb-4 px-4 py-1 border-primary/30 text-primary font-bold uppercase tracking-wider text-[10px]">
            Pricing Plans
          </Badge>
          <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 mb-6">
            Choose the Right <span className="text-primary">Plan</span> for Your Growth
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Transparent pricing designed to help educational institutes, teachers, and vendors thrive in our marketplace.
          </p>
        </div>

        {user ? (
          // Logged in: Show specific plans for the user role
          <PricingCardGrid 
            plans={plans} 
            loading={loading} 
            onSelectPlan={handleSelectPlan} 
          />
        ) : (
          // Guest: Show tabs for different user types
          <Tabs defaultValue="institute" className="w-full">
            <div className="flex justify-center mb-12">
              <TabsList className="h-14 p-1 bg-white border border-gray-100 shadow-sm rounded-full">
                <TabsTrigger 
                  value="institute" 
                  className="rounded-full px-8 h-12 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Institutes
                </TabsTrigger>
                <TabsTrigger 
                  value="teacher" 
                  className="rounded-full px-8 h-12 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Teachers
                </TabsTrigger>
                <TabsTrigger 
                  value="vendor" 
                  className="rounded-full px-8 h-12 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground transition-all"
                >
                  Suppliers
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="institute" className="mt-0">
              <PricingCardGrid 
                plans={institutePlans} 
                loading={loading} 
                onSelectPlan={handleSelectPlan} 
              />
            </TabsContent>
            
            <TabsContent value="teacher" className="mt-0">
              <PricingCardGrid 
                plans={teacherPlans} 
                loading={loading} 
                onSelectPlan={handleSelectPlan} 
              />
            </TabsContent>
            
            <TabsContent value="vendor" className="mt-0">
              <PricingCardGrid 
                plans={supplierPlans} 
                loading={loading} 
                onSelectPlan={handleSelectPlan} 
              />
            </TabsContent>
          </Tabs>
        )}

        <div className="mt-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-4">
          <p>Need a custom plan for your large-scale educational chain?</p>
          <Button variant="link" className="text-primary font-bold p-0">Contact our enterprise team</Button>
        </div>
      </div>
    </section>
  );
}