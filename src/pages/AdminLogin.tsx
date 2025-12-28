import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Mail, Lock, LogIn, ShieldCheck } from 'lucide-react';
import { AdSlot } from '@/components/ads/AdSlot';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please enter email and password');
      setLoading(false);
      return;
    }

    try {
      await login(email, password, 'admin');
      navigate('/admin');
    } catch (err) {
      setError('Invalid email or password. Please check your credentials.');
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

        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-primary/10 p-3 rounded-lg">
              <ShieldCheck className="w-8 h-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            EduFleet<span className="text-primary">Exchange</span>
          </h1>
          <p className="text-muted-foreground">Admin Portal</p>
        </div>

        <Card className="p-8 border-border">
          <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700 font-medium">Admin Access Only</p>
            <p className="text-xs text-blue-600 mt-1">
              Please enter your admin credentials to access the admin dashboard.
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="space-y-6">
            {/* Email */}
            <div>
              <label className="text-sm font-medium mb-2 block">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="admin@edufleet.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="text-sm font-medium mb-2 block">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={loading}
                  autoComplete="current-password"
                />
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
              <LogIn className="w-4 h-4" />
              {loading ? 'Logging in...' : 'Login as Admin'}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-700">
            <p className="font-medium mb-2">Demo Admin Account:</p>
            <div className="space-y-1 font-mono text-xs">
              <p>Email: <span className="text-amber-900">admin@edufleet.com</span></p>
              <p>Password: <span className="text-amber-900">admin123</span></p>
            </div>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-background text-muted-foreground">Or</span>
            </div>
          </div>

          {/* Other Login Links */}
          <div className="text-center text-sm space-y-2">
            <p className="text-muted-foreground">
              Not an admin?
            </p>
            <div className="flex gap-2 justify-center flex-wrap">
              <Link to="/login" className="text-primary hover:underline font-medium">
                Regular Login
              </Link>
              <span className="text-muted-foreground">•</span>
              <Link to="/" className="text-primary hover:underline font-medium">
                Home
              </Link>
            </div>
          </div>
        </Card>

        {/* Back Button */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-primary smooth-transition">
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
