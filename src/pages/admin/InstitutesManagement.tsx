import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { CheckCircle, XCircle, Clock } from 'lucide-react'
import { blink } from '@/lib/blink'
import { api } from '@/lib/api'
import { Institute } from '@/types'
import toast from 'react-hot-toast'

export function InstitutesManagement() {
  const [institutes, setInstitutes] = useState<Institute[]>([])
  const [selectedInstitute, setSelectedInstitute] = useState<Institute | null>(null)
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [rejectionReason, setRejectionReason] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadInstitutes()
  }, [])

  const loadInstitutes = async () => {
    try {
      const data = await api.institutes.getAll()

      console.log('Institutes loaded:')
      console.log(data)
      setInstitutes(data as Institute[])
    } catch (error) {
      toast.error('Failed to load institutes')
    }
  }

  const handleApprove = async (institute: Institute) => {
    setLoading(true)
    try {
      await api.institutes.approve(institute._id)
      toast.success(`${institute.instituteName} has been approved!`)
      loadInstitutes()
    } catch (error) {
      toast.error('Failed to approve institute')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    if (!selectedInstitute || !rejectionReason.trim()) {
      toast.error('Please provide a reason for rejection')
      return
    }

    setLoading(true)
    try {
      await api.institutes.reject(selectedInstitute.id, rejectionReason)
      toast.success('Institute has been rejected')
      setShowRejectDialog(false)
      setRejectionReason('')
      setSelectedInstitute(null)
      loadInstitutes()
    } catch (error) {
      toast.error('Failed to reject institute')
    } finally {
      setLoading(false)
    }
  }

  const pendingInstitutes = institutes.filter(i => i.approvalStatus === 'pending')
  const approvedInstitutes = institutes.filter(i => i.approvalStatus === 'approved')
  const rejectedInstitutes = institutes.filter(i => i.approvalStatus === 'rejected')

  const InstituteCard = ({ institute }: { institute: Institute }) => (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{institute.instituteName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">Reg. No: {institute.registrationNumber}</p>
          </div>
          <Badge variant={
            institute.approvalStatus === 'approved' ? 'default' :
            institute.approvalStatus === 'rejected' ? 'destructive' : 'secondary'
          }>
            {institute.approvalStatus}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Email</p>
            <p className="font-medium">{institute.instituteEmail}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Phone</p>
            <p className="font-medium">{institute.institutePhone}</p>
          </div>
        </div>
        <div className="text-sm">
          <p className="text-muted-foreground">Address</p>
          <p className="font-medium">{institute.instituteAddress}</p>
        </div>
        {institute.rejectionReason && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3 text-sm">
            <p className="font-medium text-destructive mb-1">Rejection Reason:</p>
            <p className="text-muted-foreground">{institute.rejectionReason}</p>
          </div>
        )}
        {institute.approvalStatus === 'pending' && (
          <div className="flex gap-2 pt-2">
            <Button
              className="flex-1"
              onClick={() => handleApprove(institute)}
              disabled={loading}
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Approve
            </Button>
            <Button
              className="flex-1"
              variant="destructive"
              onClick={() => {
                setSelectedInstitute(institute)
                setShowRejectDialog(true)
              }}
              disabled={loading}
            >
              <XCircle className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )

  return (
    <DashboardLayout activeTab="institutes">
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold mb-2">Institute Management</h2>
          <p className="text-muted-foreground">Review and approve institute registrations</p>
        </div>

        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending">
              <Clock className="h-4 w-4 mr-2" />
              Pending ({pendingInstitutes.length})
            </TabsTrigger>
            <TabsTrigger value="approved">
              <CheckCircle className="h-4 w-4 mr-2" />
              Approved ({approvedInstitutes.length})
            </TabsTrigger>
            <TabsTrigger value="rejected">
              <XCircle className="h-4 w-4 mr-2" />
              Rejected ({rejectedInstitutes.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingInstitutes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No pending institute registrations
                </CardContent>
              </Card>
            ) : (
              pendingInstitutes.map(institute => (
                <InstituteCard key={institute.id} institute={institute} />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedInstitutes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No approved institutes yet
                </CardContent>
              </Card>
            ) : (
              approvedInstitutes.map(institute => (
                <InstituteCard key={institute.id} institute={institute} />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedInstitutes.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No rejected institutes
                </CardContent>
              </Card>
            ) : (
              rejectedInstitutes.map(institute => (
                <InstituteCard key={institute.id} institute={institute} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Institute Registration</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting {selectedInstitute?.instituteName}'s registration.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="reason">Rejection Reason</Label>
            <Textarea
              id="reason"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="Enter the reason for rejection..."
              rows={4}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleReject} disabled={loading || !rejectionReason.trim()}>
              Reject Institute
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
