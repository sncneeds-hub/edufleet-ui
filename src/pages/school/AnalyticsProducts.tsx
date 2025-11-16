import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { TrendingUp, BarChart3, Globe, CheckCircle, Star, Zap, Mail } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import axios from 'axios';
import { toast } from 'sonner';
import { AlertDialog, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function AnalyticsProducts() {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [activeProducts, setActiveProducts] = useState<string[]>([]);

  // Fetch active products on mount
  useEffect(() => {
    fetchActiveProducts();
  }, []);

  const fetchActiveProducts = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/api/analytics-payments/active`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data.success) {
        const activeIds = response.data.data.map((p: any) => p.productId);
        setActiveProducts(activeIds);
      }
    } catch (error) {
      console.error('Failed to fetch active products:', error);
    }
  };

  const products = [
    {
      id: 'market-insights',
      name: 'Market Insights Report',
      price: 999,
      currency: '₹',
      period: 'month',
      description: 'Comprehensive market analysis and trend reports',
      icon: TrendingUp,
      color: 'from-blue-500 to-cyan-500',
      features: [
        'Weekly market trend reports',
        'Price benchmarking analysis',
        'Competitor vehicle analysis',
        'Buyer demand forecasting',
        'Email delivery of reports',
        'Up to 3 custom reports/month'
      ],
      popular: false
    },
    {
      id: 'performance-dashboard',
      name: 'Institute Performance Dashboard',
      price: 1499,
      currency: '₹',
      period: 'month',
      description: 'Advanced analytics for your institute\'s vehicle listings',
      icon: BarChart3,
      color: 'from-purple-500 to-pink-500',
      features: [
        'Real-time listing analytics',
        'Inquiry tracking & conversion rate',
        'Detailed buyer demographics',
        'Peak listing time analysis',
        'Custom reports & dashboards',
        'Export to Excel/PDF',
        'Historical data (12 months)',
        'Priority email support'
      ],
      popular: true
    },
    {
      id: 'industry-benchmark',
      name: 'Industry Benchmark Report',
      price: 4999,
      currency: '₹',
      period: 'quarter',
      description: 'Quarterly comprehensive industry analysis and strategic insights',
      icon: Globe,
      color: 'from-amber-500 to-orange-500',
      features: [
        'Industry trend analysis',
        'Regional market comparison',
        'Vehicle category performance',
        'Pricing strategy recommendations',
        'Competitor benchmarking',
        'Custom strategic recommendations',
        'Dedicated analyst consultation (30 mins)',
        'Strategic action plan development',
        'API access to data',
        'Unlimited custom reports'
      ],
      popular: false
    }
  ];

  const handleSubscribe = (productId: string) => {
    // Check if already subscribed
    if (activeProducts.includes(productId)) {
      toast.info('You already have an active subscription for this product');
      return;
    }
    setSelectedPlan(productId);
    setCheckoutOpen(true);
  };

  const handlePaymentSuccess = () => {
    setCheckoutOpen(false);
    setSelectedPlan(null);
    fetchActiveProducts(); // Refresh active products
    toast.success('Payment successful! Your analytics product is now active.');
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const selectedProduct = products.find(p => p.id === selectedPlan);

  return (
    <DashboardLayout activeTab="analytics">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold">Premium Analytics Products</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            Gain competitive advantage with data-driven insights. Choose the analytics solution that fits your needs.
          </p>
        </div>

        {/* Analytics Products Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {products.map((product) => {
            const Icon = product.icon;
            const isSelected = selectedPlan === product.id;
            
            return (
              <Card 
                key={product.id}
                className={`relative transition-all duration-300 ${
                  isSelected 
                    ? 'ring-2 ring-primary shadow-lg scale-105' 
                    : 'hover:shadow-lg'
                } ${product.popular ? 'border-primary md:shadow-xl' : ''}`}
              >
                {product.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-white">
                      <Star className="h-3 w-3 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}

                <CardHeader className={`bg-gradient-to-r ${product.color} text-white pb-8`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Icon className="h-8 w-8" />
                      <div>
                        <CardTitle className="text-white">{product.name}</CardTitle>
                        <CardDescription className="text-white/80 mt-1">
                          {product.description}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="pt-8">
                  {/* Pricing */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold">{product.currency}{product.price}</span>
                      <span className="text-muted-foreground">{product.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">
                      {product.period === '/quarter' 
                        ? 'Billed quarterly' 
                        : 'Billed monthly'}
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3 mb-8">
                    {product.features.map((feature, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* CTA Button */}
                  <Button 
                    onClick={() => handleSubscribe(product.id)}
                    variant={activeProducts.includes(product.id) ? 'outline' : product.popular ? 'default' : 'outline'}
                    className={`w-full ${product.popular && !activeProducts.includes(product.id) ? 'bg-primary hover:bg-primary/90' : ''}`}
                    size="lg"
                    disabled={activeProducts.includes(product.id)}
                  >
                    {activeProducts.includes(product.id) ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Active Subscription
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4 mr-2" />
                        Subscribe Now
                      </>
                    )}
                  </Button>

                  {/* Trial Info */}
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    7-day free trial • Cancel anytime • No credit card required
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Comparison Table */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Feature Comparison</h2>
          <Card>
            <CardContent className="pt-6">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-semibold">Feature</th>
                      <th className="text-center py-3 px-4 font-semibold">Market Insights</th>
                      <th className="text-center py-3 px-4 font-semibold">Performance Dashboard</th>
                      <th className="text-center py-3 px-4 font-semibold">Industry Benchmark</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-3 px-4">Real-time Analytics</td>
                      <td className="text-center"><CheckCircle className="h-5 w-5 text-green-500 inline" /></td>
                      <td className="text-center"><CheckCircle className="h-5 w-5 text-green-500 inline" /></td>
                      <td className="text-center"><CheckCircle className="h-5 w-5 text-green-500 inline" /></td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Custom Reports</td>
                      <td className="text-center"><span className="text-muted-foreground">3/month</span></td>
                      <td className="text-center">Unlimited</td>
                      <td className="text-center">Unlimited</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">Historical Data</td>
                      <td className="text-center"><span className="text-muted-foreground">-</span></td>
                      <td className="text-center">12 months</td>
                      <td className="text-center">24 months</td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-3 px-4">API Access</td>
                      <td className="text-center"><span className="text-muted-foreground">-</span></td>
                      <td className="text-center"><span className="text-muted-foreground">-</span></td>
                      <td className="text-center"><CheckCircle className="h-5 w-5 text-green-500 inline" /></td>
                    </tr>
                    <tr>
                      <td className="py-3 px-4">Support</td>
                      <td className="text-center">Email</td>
                      <td className="text-center">Priority Email</td>
                      <td className="text-center">Dedicated Analyst</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* FAQ Section */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Can I switch plans?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes, you can upgrade or downgrade your analytics plan at any time. Changes take effect on your next billing cycle.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Is there a free trial?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All analytics plans include a 7-day free trial. No credit card required to get started.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">What if I'm not satisfied?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We offer a 30-day money-back guarantee. If you're not satisfied with your subscription, we'll refund your payment.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Do you offer discounts for annual plans?</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Yes! Subscribe to annual plans and save 20% on all analytics products. Contact our team for enterprise pricing.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardContent className="pt-12 pb-12 text-center">
            <h3 className="text-2xl font-bold mb-2">Ready to grow your school vehicle business?</h3>
            <p className="text-muted-foreground mb-6">
              Start with a free 7-day trial of any analytics product today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" onClick={() => navigate('/school/dashboard')}>
                Explore Dashboard
              </Button>
              <Button size="lg" variant="outline">
                Contact Sales
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Contact Admin Dialog (Payments Disabled) */}
        <AlertDialog open={checkoutOpen} onOpenChange={setCheckoutOpen}>
          <AlertDialogContent className="max-w-md">
            <AlertDialogHeader>
              <AlertDialogTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Administrator for Analytics Subscription
              </AlertDialogTitle>
              <AlertDialogDescription className="pt-4">
                Online payments are temporarily disabled. To subscribe to any analytics product, please contact the administrator with the product details below.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {selectedProduct && (
              <div className="p-4 bg-secondary/50 rounded-md mt-4">
                <p className="font-semibold">Selected Product:</p>
                <p>{selectedProduct.name} — {selectedProduct.currency}{selectedProduct.price} / {selectedProduct.period}</p>
                <p className="text-sm text-muted-foreground mt-2">Please contact admin@edufleet.com with this product code: <strong>{selectedProduct.id}</strong></p>
              </div>
            )}

            <AlertDialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setCheckoutOpen(false)}>Close</Button>
              <Button onClick={() => {
                // copy contact info to clipboard and close
                const info = `Product: ${selectedProduct?.name} (Code: ${selectedProduct?.id})`;
                navigator.clipboard?.writeText(info);
                toast.success('Product details copied to clipboard. Contact admin@edufleet.com');
                setCheckoutOpen(false);
              }}>
                Copy & Contact Admin
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}