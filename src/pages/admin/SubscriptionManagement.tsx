import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { CheckCircle, XCircle, Clock, CreditCard, Calendar, TrendingUp } from 'lucide-react'
import { api } from '@/lib/api'
import { Institute } from '@/types'
import { toast } from 'sonner'
import { format } from 'date-fns'

export function SubscriptionManagement() {
  const [subscriptions, setSubscriptions] = useState<Institute[]>([])
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null)
  const [showActivateDialog, setShowActivateDialog] = useState(false)
  const [showExtendDialog, setShowExtendDialog] = useState(false)
  const [showChangePlanDialog, setShowChangePlanDialog] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<'Silver' | 'Gold' | 'Platinum'>('Silver')
  const [durationMonths, setDurationMonths] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadSubscriptions()
  }, [])

  const loadSubscriptions = async () => {
    try {
      const data = await api.subscriptions.getAll()
      setSubscriptions(data)
    } catch (error) {
      toast.error('Failed to load subscriptions')
    }
  }

  const handleActivate = async () => {
    if (!selectedInstitute) return

    setLoading(true)
    try {
      await api.subscriptions.activate(selectedInstitute._id || selectedInstitute.id!, selectedPlan, durationMonths)
      toast.success(`${selectedPlan} subscription activated for ${durationMonths} month(s)`)
      setShowActivateDialog(false)
      setSelectedInstitute(null)
      loadSubscriptions()
    } catch (error) {
      toast.error('Failed to activate subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = async (institute: Institute) => {
    setLoading(true)
    try {
      await api.subscriptions.cancel(institute._id || institute.id!)
      toast.success('Subscription cancelled')
      loadSubscriptions()
    } catch (error) {
      toast.error('Failed to cancel subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleExtend = async () => {
    if (!selectedInstitute) return

    setLoading(true)
    try {
      await api.subscriptions.extend(selectedInstitute._id || selectedInstitute.id!, durationMonths)
      toast.success(`Subscription extended by ${durationMonths} month(s)`)
      setShowExtendDialog(false)
      setSelectedInstitute(null)
      loadSubscriptions()
    } catch (error) {
      toast.error('Failed to extend subscription')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePlan = async () => {
    if (!selectedInstitute) return

    setLoading(true)
    try {
      await api.subscriptions.changePlan(selectedInstitute._id || selectedInstitute.id!, selectedPlan)
      toast.success(`Plan changed to ${selectedPlan}`)
      setShowChangePlanDialog(false)
      setSelectedInstitute(null)
      loadSubscriptions()
    } catch (error) {
      toast.error('Failed to change plan')
    } finally {
      setLoading(false)
    }
  }

  const activeSubscriptions = subscriptions.filter(s => s.subscriptionStatus === 'active')
  const inactiveSubscriptions = subscriptions.filter(s => s.subscriptionStatus === 'inactive')
  const expiredSubscriptions = subscriptions.filter(s => s.subscriptionStatus === 'expired')
  const cancelledSubscriptions = subscriptions.filter(s => s.subscriptionStatus === 'cancelled')

  const getPlanColor = (plan?: string) => {
    switch (plan) {
      case 'Platinum': return 'from-purple-400 to-purple-600'
      case 'Gold': return 'from-yellow-400 to-yellow-600'
      case 'Silver': return 'from-slate-400 to-slate-600'
      default: return 'from-gray-400 to-gray-600'
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'active': return <Badge className="bg-green-500">Active</Badge>
      case 'expired': return <Badge variant="destructive">Expired</Badge>
      case 'cancelled': return <Badge variant="secondary">Cancelled</Badge>
      default: return <Badge variant="outline">Inactive</Badge>
    }
  }

  const SubscriptionCard = ({ institute }: { institute: Institute }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{institute.instituteName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Reg. No: {institute.registrationNumber}</p>
          </div>
          <div className="flex gap-2 items-center">
            {getStatusBadge(institute.subscriptionStatus)}
            {institute.subscriptionPlan && (
              <div className={`w-12 h-12 rounded-full bg-gradient-to-br ${getPlanColor(institute.subscriptionPlan)} flex items-center justify-center`}>
                <span className="text-white font-bold">{institute.subscriptionPlan[0]}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Plan
            </p>
            <p className="font-medium">{institute.subscriptionPlan || 'No Plan'}</p>
          </div>
          <div>
            <p className="text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Status
            </p>
            <p className="font-medium capitalize">{institute.subscriptionStatus || 'inactive'}</p>
          </div>
        </div>

        {institute.subscriptionStartDate && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Start Date
              </p>
              <p className="font-medium">{format(new Date(institute.subscriptionStartDate), 'MMM dd, yyyy')}</p>
            </div>
            {institute.subscriptionEndDate && (
              <div>
                <p className="text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  End Date
                </p>
                <p className="font-medium">{format(new Date(institute.subscriptionEndDate), 'MMM dd, yyyy')}</p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2 pt-2 flex-wrap">
          {institute.subscriptionStatus === 'active' ? (
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedInstitute(institute)
                  setSelectedPlan(institute.subscriptionPlan || 'Silver')
                  setShowChangePlanDialog(true)
                }}
                disabled={loading}
              >
                Change Plan
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setSelectedInstitute(institute)
                  setDurationMonths(1)
                  setShowExtendDialog(true)
                }}
                disabled={loading}
              >
                Extend
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={() => handleCancel(institute)}
                disabled={loading}
              >
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button
                size="sm"
                onClick={() => {
                  setSelectedInstitute(institute)
                  setSelectedPlan(institute.subscriptionPlan || 'Silver')
                  setDurationMonths(1)
                  setShowActivateDialog(true)
                }}
                disabled={loading}
              >
                Manual Activate
              </Button>
              <Badge variant="secondary" className="ml-2">
                Admin can manually enable subscription
              </Badge>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout activeTab="subscriptions">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Subscription Management</h2>
          <p className="text-muted-foreground">Manage institute subscriptions and plans</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-500">{activeSubscriptions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Inactive</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-500">{inactiveSubscriptions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-500">{expiredSubscriptions.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Cancelled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-500">{cancelledSubscriptions.length}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="active" className="space-y-4">
          <TabsList>
            <TabsTrigger value="active">
              <CheckCircle className="h-4 w-4 mr-2" />
              Active ({activeSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="inactive">
              <Clock className="h-4 w-4 mr-2" />
              Inactive ({inactiveSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="expired">
              <XCircle className="h-4 w-4 mr-2" />
              Expired ({expiredSubscriptions.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              <XCircle className="h-4 w-4 mr-2" />
              Cancelled ({cancelledSubscriptions.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No active subscriptions
                </CardContent>
              </Card>
            ) : (
              activeSubscriptions.map(institute => (
                <SubscriptionCard key={institute._id || institute.id} institute={institute} />
              ))
            )}
          </TabsContent>

          <TabsContent value="inactive" className="space-y-4">
            {inactiveSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No inactive subscriptions
                </CardContent>
              </Card>
            ) : (
              inactiveSubscriptions.map(institute => (
                <SubscriptionCard key={institute._id || institute.id} institute={institute} />
              ))
            )}
          </TabsContent>

          <TabsContent value="expired" className="space-y-4">
            {expiredSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No expired subscriptions
                </CardContent>
              </Card>
            ) : (
              expiredSubscriptions.map(institute => (
                <SubscriptionCard key={institute._id || institute.id} institute={institute} />
              ))
            )}
          </TabsContent>

          <TabsContent value="cancelled" className="space-y-4">
            {cancelledSubscriptions.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No cancelled subscriptions
                </CardContent>
              </Card>
            ) : (
              cancelledSubscriptions.map(institute => (
                <SubscriptionCard key={institute._id || institute.id} institute={institute} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Activate Subscription Dialog (Manual Admin Activation) */}
      <Dialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manual Subscription Activation</DialogTitle>
            <DialogDescription>
              Manually activate subscription for {selectedInstitute?.instituteName} (Admin Override)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="plan">Subscription Plan</Label>
              <Select value={selectedPlan} onValueChange={(value: 'Silver' | 'Gold' | 'Platinum') => setSelectedPlan(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Silver">Silver - ₹2,999/month</SelectItem>
                  <SelectItem value="Gold">Gold - ₹5,999/month</SelectItem>
                  <SelectItem value="Platinum">Platinum - ₹9,999/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (months)</Label>
              <Input
                id="duration"
                type="number"
                min="1"
                max="12"
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowActivateDialog(false)}>Cancel</Button>
            <Button onClick={handleActivate} disabled={loading}>
              Activate Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Extend Subscription Dialog */}
      <Dialog open={showExtendDialog} onOpenChange={setShowExtendDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Subscription</DialogTitle>
            <DialogDescription>
              Extend subscription for {selectedInstitute?.instituteName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="extend-duration">Additional Months</Label>
              <Input
                id="extend-duration"
                type="number"
                min="1"
                max="12"
                value={durationMonths}
                onChange={(e) => setDurationMonths(Number(e.target.value))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowExtendDialog(false)}>Cancel</Button>
            <Button onClick={handleExtend} disabled={loading}>
              Extend Subscription
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Plan Dialog */}
      <Dialog open={showChangePlanDialog} onOpenChange={setShowChangePlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Subscription Plan</DialogTitle>
            <DialogDescription>
              Change plan for {selectedInstitute?.instituteName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-plan">New Plan</Label>
              <Select value={selectedPlan} onValueChange={(value: 'Silver' | 'Gold' | 'Platinum') => setSelectedPlan(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Silver">Silver - ₹2,999/month</SelectItem>
                  <SelectItem value="Gold">Gold - ₹5,999/month</SelectItem>
                  <SelectItem value="Platinum">Platinum - ₹9,999/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChangePlanDialog(false)}>Cancel</Button>
            <Button onClick={handleChangePlan} disabled={loading}>
              Change Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
