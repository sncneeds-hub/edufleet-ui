import { useNavigate } from 'react-router-dom';
import { useSubscriptionPlans } from '@/hooks/useApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, Loader2, Star } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export function PricingSection() {
  const navigate = useNavigate();
  const { plans, loading, error } = useSubscriptionPlans();

  if (error) {
    return null; // Don't show the section if there's an error
  }

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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
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
            ))
          ) : (
            plans.map((plan) => {
              const isPopular = plan.name.toLowerCase().includes('institute') || plan.name.toLowerCase().includes('pro');
              
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
                      
                      {/* Derived features from constraints if needed, but we'll use plan.features first */}
                      {plan.features.length > 0 ? (
                        plan.features.map((feature, idx) => (
                          <div key={idx} className="flex items-start gap-3">
                            <div className="mt-1 rounded-full bg-primary/10 p-1">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-sm text-gray-600 leading-tight">{feature}</span>
                          </div>
                        ))
                      ) : (
                        <>
                          <div className="flex items-start gap-3">
                            <div className="mt-1 rounded-full bg-primary/10 p-1">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-sm text-gray-600 leading-tight">
                              {plan.maxListingCount === 999999 ? 'Unlimited' : plan.maxListingCount} Listings Allowed
                            </span>
                          </div>
                          <div className="flex items-start gap-3">
                            <div className="mt-1 rounded-full bg-primary/10 p-1">
                              <Check className="w-3 h-3 text-primary" />
                            </div>
                            <span className="text-sm text-gray-600 leading-tight">
                              {plan.maxBrowseCount === 999999 ? 'Unlimited' : plan.maxBrowseCount} Daily Browses
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="pb-8">
                    <Button 
                      className={`w-full font-bold h-12 transition-all duration-300 ${
                        isPopular ? 'bg-primary hover:bg-primary-light text-white shadow-lg shadow-primary/20' : 'bg-white border-2 border-primary text-primary hover:bg-primary hover:text-white'
                      }`}
                      onClick={() => navigate('/signup', { state: { planId: plan.id } })}
                    >
                      {plan.price === 0 ? 'Get Started' : 'Subscribe Now'}
                    </Button>
                  </CardFooter>
                </Card>
              );
            })
          )}
        </div>
        
        <div className="mt-16 text-center text-muted-foreground text-sm flex flex-col items-center gap-4">
          <p>Need a custom plan for your large-scale educational chain?</p>
          <Button variant="link" className="text-primary font-bold p-0">Contact our enterprise team</Button>
        </div>
      </div>
    </section>
  );
}
