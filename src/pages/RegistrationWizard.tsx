import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { useAuth } from '@/hooks/useAuth'
import { api } from '@/lib/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, CheckCircle, Bus, Home } from 'lucide-react'
import { toast } from 'sonner'

// Step 1: Account Schema
const accountSchema = z
  .object({
    displayName: z.string().min(3, 'Full name must be at least 3 characters'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
    role: z.enum(['school', 'admin']),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// Step 2: Institute Schema
const instituteSchema = z.object({
  name: z.string().min(3, 'Institute name must be at least 3 characters'),
  registrationNumber: z.string().min(1, 'Registration number is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  address: z.string().min(10, 'Address must be at least 10 characters'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().min(6, 'Pincode must be 6 digits'),
})

type AccountFormData = z.infer<typeof accountSchema>
type InstituteFormData = z.infer<typeof instituteSchema>

type Step = 'account' | 'institute' | 'complete'

export default function RegistrationWizard() {
  const navigate = useNavigate()
  const { signUp } = useAuth()
  const [currentStep, setCurrentStep] = useState<Step>('account')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [accountData, setAccountData] = useState<AccountFormData | null>(null)

  const stepNumber = currentStep === 'account' ? 1 : currentStep === 'institute' ? 2 : 3
  const totalSteps = 3
  const progressPercent = (stepNumber / totalSteps) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Bus className="h-12 w-12 text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">EduFleet</h1>
          <p className="text-gray-600">School Vehicle Marketplace - Get Started</p>
        </div>

        <div className="mb-8">
          <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
            <span>Step {stepNumber} of {totalSteps}</span>
            <span>{Math.round(progressPercent)}%</span>
          </div>
          <Progress value={progressPercent} className="h-2" />
        </div>

        {currentStep === 'account' && (
          <AccountStep
            onNext={(data) => {
              setAccountData(data)
              setCurrentStep('institute')
            }}
            onCancel={() => navigate('/')}
          />
        )}

        {currentStep === 'institute' && accountData && (
          <InstituteStep
            accountData={accountData}
            onNext={async (instituteData) => {
              try {
                setIsSubmitting(true)
                // Create user account
                const userData = await signUp(
                  accountData.email,
                  accountData.password,
                  accountData.role,
                  accountData.displayName,
                  accountData.role === 'school' ? 'Silver' : undefined
                )

                // Create institute profile
                const institute = await api.institutes.create({
                  instituteName: instituteData.name,
                  registrationNumber: instituteData.registrationNumber,
                  instituteEmail: instituteData.email,
                  institutePhone: instituteData.phone,
                  instituteAddress: instituteData.address,
                  city: instituteData.city,
                  state: instituteData.state,
                  pincode: instituteData.pincode,
                })

                setCurrentStep('complete')
              } catch (error: any) {
                toast.error(error?.message || 'Failed to complete registration')
              } finally {
                setIsSubmitting(false)
              }
            }}
            onBack={() => setCurrentStep('account')}
            isLoading={isSubmitting}
          />
        )}

        {currentStep === 'complete' && (
          <CompleteStep
            accountData={accountData!}
            onFinish={() => {
              toast.success('Registration complete! Your profile is pending admin approval.')
              navigate(accountData!.role === 'admin' ? '/dashboard' : '/school')
            }}
          />
        )}
      </div>
    </div>
  )
}

function AccountStep({ onNext, onCancel }: { onNext: (data: AccountFormData) => void; onCancel: () => void }) {
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: { role: 'school' }
  })

  const role = watch('role')

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Create Your Account</CardTitle>
        <CardDescription>Step 1 of 3: Set up your login credentials</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="displayName">Full Name *</Label>
            <Input id="displayName" placeholder="John Doe" {...register('displayName')} />
            {errors.displayName && <p className="text-sm text-red-500">{errors.displayName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input id="email" type="email" placeholder="school@example.edu" {...register('email')} />
            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Account Type *</Label>
            <Select value={role} onValueChange={(value) => setValue('role', value as 'school' | 'admin')}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="school">School / Institute</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-red-500">{errors.role.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password *</Label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password *</Label>
            <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onCancel} className="flex-1">Cancel</Button>
            <Button type="submit" className="flex-1">Next</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function InstituteStep({
  accountData,
  onNext,
  onBack,
  isLoading
}: {
  accountData: AccountFormData;
  onNext: (data: InstituteFormData) => void;
  onBack: () => void;
  isLoading: boolean;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<InstituteFormData>({
    resolver: zodResolver(instituteSchema),
    defaultValues: { email: accountData.email }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Institute Profile</CardTitle>
        <CardDescription>Step 2 of 3: Provide your institution details</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert className="mb-6 border-blue-500 bg-blue-50">
          <AlertDescription className="text-blue-900">This information helps us verify your institution and is used for admin approval.</AlertDescription>
        </Alert>

        <form onSubmit={handleSubmit(onNext)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Institute Name *</Label>
            <Input id="name" placeholder="ABC Public School" {...register('name')} />
            {errors.name && <p className="text-sm text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="registrationNumber">Registration Number *</Label>
            <Input id="registrationNumber" placeholder="REG/2020/12345" {...register('registrationNumber')} />
            {errors.registrationNumber && <p className="text-sm text-red-500">{errors.registrationNumber.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input id="email" type="email" placeholder="contact@school.edu" {...register('email')} />
              {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" placeholder="+91 1234567890" {...register('phone')} />
              {errors.phone && <p className="text-sm text-red-500">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Textarea id="address" rows={3} placeholder="Full address with street, area, landmarks..." {...register('address')} />
            {errors.address && <p className="text-sm text-red-500">{errors.address.message}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City *</Label>
              <Input id="city" placeholder="Mumbai" {...register('city')} />
              {errors.city && <p className="text-sm text-red-500">{errors.city.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State *</Label>
              <Input id="state" placeholder="Maharashtra" {...register('state')} />
              {errors.state && <p className="text-sm text-red-500">{errors.state.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="pincode">Pincode *</Label>
              <Input id="pincode" placeholder="400001" {...register('pincode')} />
              {errors.pincode && <p className="text-sm text-red-500">{errors.pincode.message}</p>}
            </div>
          </div>

          <div className="flex gap-4 pt-4">
            <Button type="button" variant="outline" onClick={onBack} disabled={isLoading} className="flex-1">Back</Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Account...
                </>
              ) : (
                'Next'
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function CompleteStep({ accountData, onFinish }: { accountData: AccountFormData; onFinish: () => void }) {
  return (
    <Card className="border-green-500 bg-green-50">
      <CardHeader className="text-center">
        <div className="flex justify-center mb-4">
          <CheckCircle className="h-16 w-16 text-green-500" />
        </div>
        <CardTitle className="text-2xl text-green-900">Registration Complete!</CardTitle>
        <CardDescription className="text-green-800">Step 3 of 3: Your account is ready</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-green-500 bg-white">
          <AlertDescription className="text-green-900">
            <strong>Welcome aboard!</strong> Your institute profile has been created and is pending admin approval. You'll receive an email notification once approved.
          </AlertDescription>
        </Alert>

        <div className="space-y-4 bg-white p-4 rounded-lg">
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Account Created:</p>
            <p className="font-semibold text-gray-900">{accountData.displayName}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Email:</p>
            <p className="font-semibold text-gray-900">{accountData.email}</p>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Account Type:</p>
            <p className="font-semibold text-gray-900">{accountData.role === 'school' ? 'School / Institute' : 'Administrator'}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-gray-700">
          <p className="font-semibold">What's Next?</p>
          <ul className="space-y-2 list-disc list-inside">
            <li>Wait for admin approval (usually within 24 hours)</li>
            <li>Complete your institute profile once approved</li>
            <li>Start posting and selling school vehicles</li>
          </ul>
        </div>

        <Button onClick={onFinish} className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg">
          Go to Dashboard
          <Home className="ml-2 h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  )
}
