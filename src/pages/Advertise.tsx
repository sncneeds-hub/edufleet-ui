import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { CheckCircle, Megaphone, Target, TrendingUp, Users, Send } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState, useEffect } from 'react';
import { useAds } from '@/context/AdContext';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

export function Advertise() {
  const navigate = useNavigate();
  const { submitAdRequest } = useAds();
  const { isAuthenticated, user } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    adType: '',
    message: ''
  });

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        company: user.instituteName || '',
        phone: user.phone || ''
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, adType: value }));
  };

  const handleCreateAdClick = () => {
    if (isAuthenticated) {
      const element = document.getElementById('contact-form');
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/signup');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.company || !formData.adType) {
      toast.error('Please fill in all required fields');
      return;
    }

    submitAdRequest(formData);
    toast.success('Ad request submitted successfully! Our team will contact you shortly.');
    setFormData({
      name: '',
      email: '',
      company: '',
      phone: '',
      adType: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-20 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 font-serif">
            Grow Your Business with <span className="text-accent">EduFleet</span>
          </h1>
          <p className="text-xl md:text-2xl opacity-90 mb-8 max-w-3xl mx-auto">
            Connect with thousands of educational institutes, vehicle owners, and job seekers in one place.
          </p>
          <Button
            size="lg"
            variant="secondary"
            className="font-bold text-lg h-14 px-8 shadow-lg"
            onClick={handleCreateAdClick}
          >
            Create Your Ad Now
          </Button>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Advertise with Us?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              EduFleet offers targeted advertising options to help you reach the right audience in the education sector.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: Target, title: 'Targeted Audience', desc: 'Reach decision-makers in educational institutes directly.' },
              { icon: TrendingUp, title: 'High Conversion', desc: 'Our users are actively looking for solutions you provide.' },
              { icon: Users, title: 'Massive Reach', desc: 'Over 10,000+ monthly active users from the education industry.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <item.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-gray-900">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ad Types Section */}
      <section className="py-20 container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl font-bold text-gray-900">Choose Your Ad Format</h2>
            <div className="space-y-6">
              {[
                'Banner Ads on Landing Page',
                'Featured Listings in Search Results',
                'Sidebar Ads on Browse Pages',
                'Sponsored Email Newsletters'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-500 flex-shrink-0" />
                  <span className="text-lg text-gray-700">{item}</span>
                </div>
              ))}
            </div>
            {/* Removed the Contact Sales Team button as we now have a form below */}
          </div>
          <div className="flex-1 bg-gray-100 rounded-2xl p-8 border border-dashed border-gray-300 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Megaphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 font-medium">Ad Preview Area</p>
            </div>
          </div>
        </div>
      </section>

      {/* Request Form Section */}
      <section id="contact-form" className="py-20 bg-slate-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Start Your Campaign</h2>
              <p className="text-gray-600">
                Fill out the form below and our advertising team will get back to you within 24 hours.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email *</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="john@company.com"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="company">Company/Institute Name *</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="EduFleet Institute"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="adType">Interested Ad Format *</Label>
                <Select onValueChange={handleSelectChange} value={formData.adType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select an ad format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Banner Ads on Landing Page">Banner Ads on Landing Page</SelectItem>
                    <SelectItem value="Featured Listings in Search Results">Featured Listings in Search Results</SelectItem>
                    <SelectItem value="Sidebar Ads on Browse Pages">Sidebar Ads on Browse Pages</SelectItem>
                    <SelectItem value="Sponsored Email Newsletters">Sponsored Email Newsletters</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Campaign Details / Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="Tell us about your goals, budget, or any specific requirements..."
                  className="min-h-[120px]"
                />
              </div>

              <Button type="submit" size="lg" className="w-full h-12 text-lg font-semibold">
                <Send className="w-5 h-5 mr-2" /> Submit Request
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to boost your visibility?</h2>
          <div className="flex justify-center gap-4">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8"
              onClick={handleCreateAdClick}
            >
              Get Started
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
