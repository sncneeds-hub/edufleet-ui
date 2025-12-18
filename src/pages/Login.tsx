import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Lock, LogIn, Send } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { authService } from '@/services/authService';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [role, setRole] = useState<'institute' | 'admin' | 'teacher'>('institute');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [demoOTP, setDemoOTP] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      await login(email, password, role);
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      const result = await authService.sendLoginOTP(email);
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
      // For OTP login, we pass empty password and the OTP
      await login(email, '', role, otp);
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'teacher') {
        navigate('/teacher/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError('Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
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
            {step === 'credentials' ? 'Sign in to your account' : 'Verify your OTP'}
          </p>
        </div>

        <Card className="p-8 border-border">
          {step === 'credentials' ? (
            <form onSubmit={loginMethod === 'password' ? handlePasswordLogin : handleSendOTP} className="space-y-6">
              {/* Login Method Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Login Method</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('password')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      loginMethod === 'password'
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Lock className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">Email & Password</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('otp')}
                    className={`px-4 py-3 rounded-lg border-2 transition-all ${
                      loginMethod === 'otp'
                        ? 'border-primary bg-primary/5 text-primary font-medium'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Send className="w-5 h-5 mx-auto mb-1" />
                    <span className="text-sm">OTP Login</span>
                  </button>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-sm font-medium mb-2 block">Login As</label>
                <Select value={role} onValueChange={(value: any) => setRole(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="institute">Institute</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div>
                <label className="text-sm font-medium mb-2 block">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                  <Input
                    type="email"
                    placeholder="your@institute.edu.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Password - Only show for password login */}
              {loginMethod === 'password' && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted" />
                    <Input
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10"
                      disabled={loading}
                    />
                  </div>
                </div>
              )}

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
                {loginMethod === 'password' ? (
                  <>
                    <LogIn className="w-4 h-4" />
                    {loading ? 'Logging in...' : 'Login'}
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {loading ? 'Sending OTP...' : 'Send OTP'}
                  </>
                )}
              </Button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOTP} className="space-y-6">
              {/* OTP Input */}
              <div>
                <label className="text-sm font-medium mb-2 block">Enter OTP</label>
                <p className="text-sm text-muted mb-4">
                  We've sent a 6-digit OTP to {email}
                </p>
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
                  <LogIn className="w-4 h-4" />
                  {loading ? 'Verifying...' : 'Verify & Login'}
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => {
                    setStep('credentials');
                    setOtp('');
                    setError('');
                    setDemoOTP('');
                  }}
                  disabled={loading}
                >
                  Back to Login
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

          {/* Demo Credentials - only show on credentials step */}
          {step === 'credentials' && (
            <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <p className="font-medium mb-1">Demo Instructions:</p>
              <p>1. Choose your preferred login method above</p>
              <p>2. Sign up first to create an account</p>
              <p>3. For Password Login: Enter email & password directly</p>
              <p>4. For OTP Login: Enter email, receive OTP, then verify</p>
            </div>
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

          {/* Signup Links */}
          <div className="text-center text-sm space-y-2">
            <p className="text-muted">
              Don't have an account?
            </p>
            <div className="flex gap-2 justify-center">
              <Link to="/signup" className="text-primary hover:underline font-medium">
                Institute Signup
              </Link>
              <span className="text-muted">•</span>
              <Link to="/teacher/signup" className="text-primary hover:underline font-medium">
                Teacher Signup
              </Link>
            </div>
          </div>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted hover:text-primary smooth-transition">
            ← Back to Home
          </Link>
        </div>

        {/* Bottom Ad */}
        <div className="mt-6">
          <AdSlot placement="LP_INLINE_1" variant="banner" />
        </div>
      </div>
    </div>
  );
}
