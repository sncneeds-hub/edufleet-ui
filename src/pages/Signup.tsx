import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, Building2, User, Send, CheckCircle, Phone } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { authService } from '@/services/authService';

export function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    instituteName: '',
    contactPerson: '',
    instituteCode: '',
    phone: '',
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'form' | 'otp'>('form');
  const [demoOTP, setDemoOTP] = useState('');

  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Validation
    if (!formData.name || !formData.email || !formData.password || !formData.instituteName || !formData.contactPerson || !formData.instituteCode || !formData.phone) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Phone validation
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit Indian phone number');
      setLoading(false);
      return;
    }

    // Institute code validation
    if (formData.instituteCode.length < 4) {
      setError('Institute code must be at least 4 characters');
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.sendSignupOTP(formData.email);
      if (result.success) {
        setStep('otp');
        // For demo purposes, show the OTP
        if (result.otp) {
          setDemoOTP(result.otp);
        }
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!otp || otp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      setLoading(false);
      return;
    }

    try {
      await signup(
        formData.name,
        formData.email,
        formData.password,
        formData.instituteName,
        formData.contactPerson,
        formData.instituteCode,
        formData.phone,
        otp
      );
      navigate('/dashboard');
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background py-12 px-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Top Ad */}
        <div className="mb-6">
          <AdSlot placement="LP_TOP_BANNER" variant="banner" />
        </div>
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">
            EduFleet<span className="text-primary">Exchange</span>
          </h1>
          <p className="text-muted">
            {step === 'form' ? 'Create your institution account' : 'Verify your email'}
          </p>
        </div>

        <Card className="p-8 border-border">
          {step === 'form' ? (
            <form onSubmit={handleSendOTP} className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="font-semibold mb-4 text-lg">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Contact Person Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Contact Person Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      type="text"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      type="email"
                      name="email"
                      placeholder="your@institute.edu.in"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Institute Information */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-4 text-lg">Institute Information</h3>
              <div className="space-y-4">
                {/* Institute Name */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Institute Name</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      type="text"
                      name="instituteName"
                      placeholder="Your Institute Name"
                      value={formData.instituteName}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Institute Code and Phone Number */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Institute Code */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Institute Code <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="text"
                      name="instituteCode"
                      placeholder="e.g., INST2024"
                      value={formData.instituteCode}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <p className="text-xs text-muted mt-1">
                      Unique code provided by your institution
                    </p>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="text-sm font-medium mb-2 block">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="9876543210"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={loading}
                      maxLength={10}
                    />
                    <p className="text-xs text-muted mt-1">
                      10-digit Indian mobile number
                    </p>
                  </div>
                </div>

                {/* Contact Person Title */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Title/Position</label>
                  <Input
                    type="text"
                    name="contactPerson"
                    placeholder="e.g., Transport Manager, Principal"
                    value={formData.contactPerson}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div className="pt-4 border-t border-border">
              <h3 className="font-semibold mb-4 text-lg">Security</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Password */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      type="password"
                      name="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="text-sm font-medium mb-2 block">Confirm Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      type="password"
                      name="confirmPassword"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={loading}
            >
              <Send className="w-4 h-4" />
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </Button>
          </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* Success Message */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <p className="font-medium">OTP Sent Successfully!</p>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  We've sent a 6-digit OTP to {formData.email}
                </p>
              </div>

              {/* OTP Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Enter OTP</label>
                <div className="flex justify-center">
                  <InputOTP maxLength={6} value={otp} onChange={setOtp}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
              </div>

              {/* Demo OTP Display */}
              {demoOTP && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                  <p className="font-medium mb-1">Demo OTP (for testing):</p>
                  <p className="text-lg font-bold tracking-wider">{demoOTP}</p>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Buttons */}
              <div className="space-y-3">
                <Button
                  type="submit"
                  className="w-full gap-2"
                  disabled={loading}
                >
                  <CheckCircle className="w-4 h-4" />
                  {loading ? 'Verifying...' : 'Verify & Create Account'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep('form');
                    setOtp('');
                    setError('');
                    setDemoOTP('');
                  }}
                  disabled={loading}
                >
                  Back to Form
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  className="w-full"
                  onClick={handleSendOTP}
                  disabled={loading}
                >
                  Resend OTP
                </Button>
              </div>
            </form>
          )}

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted">Or</span>
            </div>
          </div>

          {/* Login Link */}
          <p className="text-center text-sm text-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in here
            </Link>
          </p>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted hover:text-primary smooth-transition">
            ← Back to Home
          </Link>
        </div>

        {/* Bottom Ad */}
        <div className="mt-6">
          <AdSlot placement="LP_INLINE_2" variant="banner" />
        </div>
      </div>
    </div>
  );
}
