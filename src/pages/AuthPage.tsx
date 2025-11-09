import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { Bus, Home } from 'lucide-react'
import toast from 'react-hot-toast'

export function AuthPage() {
  const [searchParams] = useSearchParams()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'admin' | 'school'>('school')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      if (mode === 'signin') {
        const userData = await signIn(email, password)
        toast.success('Signed in successfully!')
        // Navigate based on user role from returned data
        const userRole = (userData as any)?.role || role
        navigate(userRole === 'admin' ? '/dashboard' : '/school')
      } else {
        const userData = await signUp(email, password, role, displayName)
        toast.success('Account created successfully!')
        if (role === 'school') {
          toast.success('Your institute registration is pending admin approval.')
        }
        // Navigate based on role selected during signup
        navigate(role === 'admin' ? '/dashboard' : '/school')
      }
    } catch (error: any) {
      toast.error(error.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 left-4"
            onClick={() => navigate('/')}
          >
            <Home className="h-4 w-4 mr-2" />
            Home
          </Button>
          <div className="flex justify-center mb-4">
            <Bus className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </CardTitle>
          <CardDescription>
            {mode === 'signin' 
              ? 'Sign in to access your dashboard' 
              : 'Register your educational institute'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="displayName">Full Name</Label>
                  <Input
                    id="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Account Type</Label>
                  <Select value={role} onValueChange={(v) => setRole(v as 'admin' | 'school')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="school">School / Institute</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@school.edu"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
              {mode === 'signin' && (
                <Button 
                  type="button"
                  variant="link" 
                  className="p-0 h-auto text-xs" 
                  onClick={() => navigate('/forgot-password')}
                >
                  Forgot password?
                </Button>
              )}
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            {mode === 'signin' ? (
              <>
                Don't have an account?{' '}
                <Button variant="link" className="p-0" onClick={() => setMode('signup')}>
                  Sign up
                </Button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <Button variant="link" className="p-0" onClick={() => setMode('signin')}>
                  Sign in
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
