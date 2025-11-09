import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { blink } from '@/lib/blink'
import { api } from '@/lib/api'
import { ContactInquiry, Vehicle } from '@/types'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'
import { 
  Mail, 
  Clock, 
  CheckCircle2, 
  MessageSquare,
  Phone,
  Building2,
  Car,
  IndianRupee
} from 'lucide-react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface InquiryWithDetails extends ContactInquiry {
  vehicle?: Vehicle
}

export default function Inquiries() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [receivedInquiries, setReceivedInquiries] = useState<InquiryWithDetails[]>([])
  const [sentInquiries, setSentInquiries] = useState<InquiryWithDetails[]>([])
  const [selectedInquiry, setSelectedInquiry] = useState<InquiryWithDetails | null>(null)
  const [replyMessage, setReplyMessage] = useState('')
  const [sendingReply, setSendingReply] = useState(false)

  useEffect(() => {
    loadInquiries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const loadInquiries = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Get user's institute
      const institute = await api.institutes.getByUserId(user.id)

      if (!institute) {
        setLoading(false)
        return
      }

      // Load received inquiries
      const received = await api.inquiries.getReceived(institute.id)

      // Load sent inquiries
      const sent = await api.inquiries.getSent(institute.id)

      // Load vehicle details for all inquiries
      const allVehicleIds = [...new Set([...received, ...sent].map(i => i.vehicleId))]
      const vehiclesData = await Promise.all(
        allVehicleIds.map(id => api.vehicles.getById(id).catch(() => null))
      )

      const vehiclesMap = new Map()
      vehiclesData.forEach(v => {
        if (v) {
          vehiclesMap.set(v.id, v)
        }
      })

      setReceivedInquiries(received.map(inq => ({
        ...inq,
        vehicle: vehiclesMap.get(inq.vehicleId)
      })))

      setSentInquiries(sent.map(inq => ({
        ...inq,
        vehicle: vehiclesMap.get(inq.vehicleId)
      })))
    } catch (error) {
      console.error('Failed to load inquiries:', error)
      toast.error('Failed to load inquiries')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (inquiry: ContactInquiry) => {
    try {
      await api.inquiries.updateStatus(inquiry.id, 'read')
      
      // Update local state
      setReceivedInquiries(prev => 
        prev.map(inq => 
          inq.id === inquiry.id 
            ? { ...inq, status: 'read' as const }
            : inq
        )
      )
      
      toast.success('Marked as read')
    } catch (error) {
      console.error('Failed to mark as read:', error)
      toast.error('Failed to update status')
    }
  }

  const handleReply = async () => {
    if (!selectedInquiry || !replyMessage.trim()) {
      toast.error('Please enter a reply message')
      return
    }

    try {
      setSendingReply(true)

      // Send reply with message content
      const updatedInquiry = await api.inquiries.sendReply(selectedInquiry.id, replyMessage)

      // Update local state with the updated inquiry
      setReceivedInquiries(prev => 
        prev.map(inq => 
          inq.id === selectedInquiry.id 
            ? { ...inq, ...updatedInquiry }
            : inq
        )
      )

      toast.success('Reply sent successfully!')
      setReplyMessage('')
      setSelectedInquiry(null)
    } catch (error) {
      console.error('Failed to send reply:', error)
      toast.error('Failed to send reply')
    } finally {
      setSendingReply(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'unread':
        return <Badge variant="default"><Mail className="h-3 w-3 mr-1" />New</Badge>
      case 'read':
        return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Read</Badge>
      case 'replied':
        return <Badge variant="outline"><CheckCircle2 className="h-3 w-3 mr-1" />Replied</Badge>
      default:
        return null
    }
  }

  const unreadCount = receivedInquiries.filter(i => i.status === 'unread').length

  return (
    <DashboardLayout activeTab="inquiries">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h2 className="text-3xl font-bold">Inquiries</h2>
          <p className="text-muted-foreground">Manage communications about your vehicles</p>
        </div>

        <Tabs defaultValue="received" className="space-y-4">
          <TabsList>
            <TabsTrigger value="received" className="relative">
              Received
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="sent">Sent</TabsTrigger>
          </TabsList>

          <TabsContent value="received" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading inquiries...</p>
                </CardContent>
              </Card>
            ) : receivedInquiries.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No inquiries received yet</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              receivedInquiries.map((inquiry) => (
                <Card key={inquiry.id} className={inquiry.status === 'unread' ? 'border-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          {inquiry.senderInstituteName}
                        </CardTitle>
                        <CardDescription>
                          {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      {getStatusBadge(inquiry.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {inquiry.vehicle && (
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <Car className="h-4 w-4" />
                          Vehicle: {inquiry.vehicleBrand} {inquiry.vehicleModel}
                        </div>
                        {inquiry.vehiclePrice && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <IndianRupee className="h-3 w-3" />
                            ₹{inquiry.vehiclePrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <Label className="text-xs text-muted-foreground">Message</Label>
                      <p className="mt-1 whitespace-pre-wrap">{inquiry.message}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 pt-3 border-t">
                      <div>
                        <Label className="text-xs text-muted-foreground">Contact Person</Label>
                        <p className="text-sm font-medium">{inquiry.senderEmail}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Phone
                        </Label>
                        <p className="text-sm font-medium">{inquiry.senderPhone}</p>
                      </div>
                    </div>

                    {inquiry.replyMessage && (
                      <div className="bg-green-50 border border-green-200 p-3 rounded-lg mt-3">
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <p className="text-sm font-semibold text-green-900">Your Reply</p>
                          {inquiry.repliedAt && (
                            <p className="text-xs text-green-700 ml-auto">
                              {new Date(inquiry.repliedAt).toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </p>
                          )}
                        </div>
                        <p className="text-sm text-green-900 whitespace-pre-wrap">{inquiry.replyMessage}</p>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      {inquiry.status === 'unread' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => markAsRead(inquiry)}
                        >
                          Mark as Read
                        </Button>
                      )}
                      
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant={inquiry.status === 'replied' ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => {
                              setSelectedInquiry(inquiry)
                              // Pre-fill if already replied
                              if (inquiry.replyMessage) {
                                setReplyMessage(inquiry.replyMessage)
                              } else {
                                setReplyMessage('')
                              }
                            }}
                          >
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {inquiry.status === 'replied' ? 'Edit Reply' : 'Reply'}
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>{inquiry.replyMessage ? 'Edit Reply' : 'Reply to Inquiry'}</DialogTitle>
                            <DialogDescription>
                              From {inquiry.senderInstituteName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <Label htmlFor="reply">Your Reply</Label>
                              <Textarea
                                id="reply"
                                placeholder="Type your reply message..."
                                rows={6}
                                value={replyMessage}
                                onChange={(e) => setReplyMessage(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground mt-2">
                                Seller contact: {inquiry.senderPhone} or {inquiry.senderEmail}
                              </p>
                            </div>
                            <Button
                              className="w-full"
                              onClick={handleReply}
                              disabled={sendingReply}
                            >
                              {sendingReply ? 'Sending...' : inquiry.replyMessage ? 'Update Reply' : 'Send Reply'}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="sent" className="space-y-4">
            {loading ? (
              <Card>
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">Loading inquiries...</p>
                </CardContent>
              </Card>
            ) : sentInquiries.length === 0 ? (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center py-12">
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No inquiries sent yet</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Browse vehicles and send inquiries to sellers
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              sentInquiries.map((inquiry) => (
                <Card key={inquiry.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-lg">Inquiry to Seller</CardTitle>
                        <CardDescription>
                          Sent on {new Date(inquiry.createdAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </CardDescription>
                      </div>
                      {getStatusBadge(inquiry.status)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {inquiry.vehicle && (
                      <div className="bg-secondary/50 p-3 rounded-lg">
                        <div className="flex items-center gap-2 text-sm font-medium mb-1">
                          <Car className="h-4 w-4" />
                          Vehicle: {inquiry.vehicleBrand} {inquiry.vehicleModel}
                        </div>
                        {inquiry.vehiclePrice && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <IndianRupee className="h-3 w-3" />
                            ₹{inquiry.vehiclePrice.toLocaleString()}
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <Label className="text-xs text-muted-foreground">Your Message</Label>
                      <p className="mt-1 whitespace-pre-wrap">{inquiry.message}</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-3 pt-3 border-t">
                      <div>
                        <Label className="text-xs text-muted-foreground">Your Contact</Label>
                        <p className="text-sm font-medium">{inquiry.senderEmail}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          Phone
                        </Label>
                        <p className="text-sm font-medium">{inquiry.senderPhone}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}