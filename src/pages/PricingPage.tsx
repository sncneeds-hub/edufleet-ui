import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, X, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RazorpayCheckout } from '@/components/payments/RazorpayCheckout';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const pricingPlans = [
  {
    name: 'Silver',
    price: 2999,
    period: '/month',
    yearlyPrice: 28792,
    yearlySavings: '20%',
    description: 'Perfect for small institutions getting started',
    features: [
      { text: 'List up to 10 vehicles', included: true },
      { text: 'Basic vehicle analytics', included: true },
      { text: 'Email support', included: true },
      { text: 'Standard listing visibility', included: true },
      { text: '30-day listing duration', included: true },
      { text: 'Basic search appearance', included: true },
      { text: 'Featured badge on listings', included: false },
      { text: 'Dedicated account manager', included: false },
      { text: 'Priority phone support', included: false }
    ],
    popular: false,
    color: 'from-slate-400 to-slate-600',
    cta: 'Get Started'
  },
  {
    name: 'Gold',
    price: 5999,
    period: '/month',
    yearlyPrice: 57592,
    yearlySavings: '20%',
    description: 'Most popular for growing institutions',
    features: [
      { text: 'List up to 30 vehicles', included: true },
      { text: 'Advanced analytics & insights', included: true },
      { text: 'Priority email support', included: true },
      { text: 'Enhanced listing visibility', included: true },
      { text: '60-day listing duration', included: true },
      { text: 'Featured badge on listings', included: true },
      { text: 'Homepage promotion slots', included: true },
      { text: '2x search ranking boost', included: true },
      { text: 'Dedicated account manager', included: false }
    ],
    popular: true,
    color: 'from-yellow-400 to-yellow-600',
    cta: 'Start Free Trial'
  },
  {
    name: 'Platinum',
    price: 9999,
    period: '/month',
    yearlyPrice: 95992,
    yearlySavings: '20%',
    description: 'For institutions requiring maximum exposure',
    features: [
      { text: 'Unlimited vehicle listings', included: true },
      { text: 'Premium analytics dashboard', included: true },
      { text: 'Dedicated account manager', included: true },
      { text: 'Maximum listing visibility', included: true },
      { text: '90-day listing duration', included: true },
      { text: 'Premium featured badge', included: true },
      { text: 'Top homepage placement', included: true },
      { text: '5x search ranking boost', included: true },
      { text: 'Priority phone support', included: true }
    ],
    popular: false,
    color: 'from-purple-400 to-purple-600',
    cta: 'Go Premium'
  }
];

const comparisonFeatures = [
  { category: 'Listings', label: 'Max Vehicles' },
  { category: 'Listings', label: 'Listing Duration' },
  { category: 'Analytics', label: 'Analytics Depth' },
  { category: 'Analytics', label: 'Custom Reports' },
  { category: 'Support', label: 'Support Channel' },
  { category: 'Support', label: 'Response Time' },
  { category: 'Visibility', label: 'Search Ranking Boost' },
  { category: 'Visibility', label: 'Homepage Placement' },
  { category: 'Premium', label: 'Featured Badge' }
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showPayment, setShowPayment] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'Silver' | 'Gold' | 'Platinum'>('Silver');
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const handleSelectPlan = (planName: 'Silver' | 'Gold' | 'Platinum') => {
    if (user && user.role === 'school') {
      setSelectedPlan(planName);
      setShowPayment(true);
    } else if (user && user.role === 'admin') {
      toast.info('Admins cannot purchase subscriptions. Please use school account.');
    } else {
      navigate('/auth', { state: { selectedPlan: planName } });
    }
  };

  const handlePaymentSuccess = () => {
    toast.success('Subscription activated successfully!');
    navigate('/school/dashboard');
  };

  const getDisplayPrice = (plan: typeof pricingPlans[0]) => {
    if (billingCycle === 'yearly') {
      return `₹${plan.yearlyPrice.toLocaleString('en-IN')}`;
    }
    return `₹${plan.price.toLocaleString('en-IN')}`;
  };

  const getMonthlyCost = (plan: typeof pricingPlans[0]) => {
    if (billingCycle === 'yearly') {
      const monthlyFromYearly = Math.round(plan.yearlyPrice / 12);
      return `₹${monthlyFromYearly.toLocaleString('en-IN')}/mo`;
    }
    return '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate('/')}>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg"></div>
            <span className="text-xl font-bold">EduFleet</span>
          </div>
          <Button variant="outline" onClick={() => navigate('/')}>
            Back to Home
          </Button>
        </div>
      </header>

      {/* Pricing Content */}
      <div className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <Badge className="mb-4" variant="secondary">Subscription Plans</Badge>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Choose the Perfect Plan for Your Institution
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Unlock premium features and maximize your vehicle sales with our flexible subscription plans. 
            All plans include secure payment processing and 24/7 platform access.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 bg-secondary/30 p-4 rounded-lg inline-block">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-primary text-primary-foreground shadow-lg'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Annual Billing
              <Badge variant="destructive" className="text-xs">Save 20%</Badge>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
          {pricingPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative transition-all duration-300 hover:shadow-xl ${
                plan.popular
                  ? 'border-primary shadow-2xl shadow-primary/20 md:scale-105'
                  : 'hover:border-primary/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-0 right-0 flex justify-center">
                  <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
                    Most Popular
                  </Badge>
                </div>
              )}

              <CardHeader className="text-center pb-8">
                {/* Plan Icon */}
                <div className={`w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center shadow-lg`}>
                  <span className="text-2xl font-bold text-white">{plan.name[0]}</span>
                </div>

                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription className="text-base">{plan.description}</CardDescription>

                {/* Price Display */}
                <div className="mt-8 space-y-1">
                  <div className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    {getDisplayPrice(plan)}
                  </div>
                  <div className="text-muted-foreground">
                    {billingCycle === 'monthly' ? (
                      <span className="text-lg">{plan.period}</span>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm">{billingCycle === 'yearly' ? 'per year' : plan.period}</span>
                        <span className="text-xs text-primary font-medium">{getMonthlyCost(plan)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      {feature.included ? (
                        <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-5 h-5 text-muted-foreground/30 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={feature.included ? 'text-sm' : 'text-sm text-muted-foreground/50'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter className="pt-0">
                <Button
                  className={`w-full gap-2 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-primary to-accent hover:opacity-90'
                      : ''
                  }`}
                  variant={plan.popular ? 'default' : 'outline'}
                  size="lg"
                  onClick={() => handleSelectPlan(plan.name)}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

        {/* Comparison Table */}
        <div className="max-w-6xl mx-auto mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Detailed Comparison</h2>
            <p className="text-muted-foreground">See all features across plans</p>
          </div>

          <div className="overflow-x-auto rounded-lg border">
            <table className="w-full">
              <thead className="bg-secondary/50 border-b">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold min-w-48">Features</th>
                  {pricingPlans.map((plan) => (
                    <th key={plan.name} className="px-6 py-4 text-center text-sm font-semibold">
                      {plan.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {comparisonFeatures.map((feature, idx) => {
                  const values: Record<string, string> = {
                    'Max Vehicles': ['10', '30', '∞'],
                    'Listing Duration': ['30 days', '60 days', '90 days'],
                    'Analytics Depth': ['Basic', 'Advanced', 'Premium'],
                    'Custom Reports': ['No', 'Yes', 'Yes'],
                    'Support Channel': ['Email', 'Email + Chat', 'Email + Chat + Phone'],
                    'Response Time': ['24 hours', '12 hours', '2 hours'],
                    'Search Ranking Boost': ['None', '2x', '5x'],
                    'Homepage Placement': ['Standard', 'Featured', 'Premium'],
                    'Featured Badge': ['No', 'Yes', 'Yes']
                  };

                  return (
                    <tr key={idx} className="hover:bg-secondary/20 transition-colors">
                      <td className="px-6 py-4 text-sm font-medium">{feature.label}</td>
                      {pricingPlans.map((plan) => (
                        <td key={plan.name} className="px-6 py-4 text-center text-sm">
                          {values[feature.label]?.[pricingPlans.indexOf(plan)] || '—'}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Frequently Asked Questions</h2>
            <p className="text-muted-foreground">Got questions? We've got answers</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I change plans anytime?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a contract or lock-in?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                No contracts. Cancel anytime with no penalties. We believe in earning your subscription through value.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What payment methods do you accept?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                We accept all major credit cards, debit cards, UPI, and net banking through Razorpay for secure payments.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer discounts for annual billing?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Yes! Pay annually and save 20% compared to monthly billing. Perfect for institutions planning long-term.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What happens if I hit my listing limit?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                You'll get a notification before reaching the limit. Upgrade anytime to add more listings, or archive old ones.
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is support included with all plans?</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                Yes! All plans include support. Higher tiers get faster response times and additional support channels.
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 text-center">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-lg p-12">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
              Join hundreds of educational institutions already using EduFleet to sell their vehicles.
              Start selling smarter today.
            </p>
            <Button
              size="lg"
              onClick={() => navigate('/auth')}
              className="bg-gradient-to-r from-primary to-accent"
            >
              Create Free Account
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Razorpay Payment Modal */}
      {showPayment && (
        <RazorpayCheckout
          open={showPayment}
          onClose={() => setShowPayment(false)}
          plan={selectedPlan}
          billingCycle={billingCycle}
          onSuccess={handlePaymentSuccess}
        />
      )}

      {/* Footer */}
      <footer className="border-t py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-8 text-center text-sm text-muted-foreground">
            <p>© 2024 EduFleet. All rights reserved. | Made for Indian Educational Institutions</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
