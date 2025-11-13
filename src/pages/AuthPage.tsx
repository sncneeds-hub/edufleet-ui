import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAuth } from '@/hooks/useAuth'
import { Bus, Home, Check } from 'lucide-react'
import { toast } from 'sonner'

export function AuthPage() {
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin'
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [role, setRole] = useState<'admin' | 'school'>('school')
  const [selectedPlan, setSelectedPlan] = useState<'Silver' | 'Gold' | 'Platinum'>('Silver')
  const [loading, setLoading] = useState(false)
  const { signIn, signUp } = useAuth()
  const navigate = useNavigate()

  // Extract selected plan from location state (from pricing page)
  useEffect(() => {
    if (location.state?.selectedPlan) {
      setSelectedPlan(location.state.selectedPlan as 'Silver' | 'Gold' | 'Platinum')
      setMode('signup')
    }
  }, [location.state])

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
        const userData = await signUp(email, password, role, displayName, role === 'school' ? selectedPlan : undefined)
        toast.success('Account created successfully!')
        if (role === 'school') {
          toast.success(`Your ${selectedPlan} plan subscription is pending activation.`)
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
                {role === 'school' && (
                  <div className="space-y-2">
                    <Label>Subscription Plan</Label>
                    <div className="grid grid-cols-3 gap-2">
                      {['Silver', 'Gold', 'Platinum'].map((plan) => (
                        <Button
                          key={plan}
                          type="button"
                          variant={selectedPlan === plan ? 'default' : 'outline'}
                          className="flex flex-col h-auto py-3 relative"
                          onClick={() => setSelectedPlan(plan as 'Silver' | 'Gold' | 'Platinum')}
                        >
                          {selectedPlan === plan && (
                            <Check className="h-4 w-4 absolute top-2 right-2" />
                          )}
                          <span className="font-semibold">{plan}</span>
                          <span className="text-xs mt-1">
                            {plan === 'Silver' && '₹2,999/mo'}
                            {plan === 'Gold' && '₹5,999/mo'}
                            {plan === 'Platinum' && '₹9,999/mo'}
                          </span>
                        </Button>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      You can upgrade or change your plan anytime after registration.{' '}
                      <Button 
                        variant="link" 
                        className="p-0 h-auto text-xs" 
                        onClick={() => navigate('/pricing')}
                        type="button"
                      >
                        View plan details
                      </Button>
                    </p>
                  </div>
                )}
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