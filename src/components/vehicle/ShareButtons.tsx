import { Button } from '@/components/ui/button'
import { Share2, MessageCircle, Mail, Facebook, Twitter, Copy, Check } from 'lucide-react'
import { useState } from 'react'
import { 
  copyToClipboard, 
  shareOnWhatsApp, 
  shareViaEmail, 
  shareOnFacebook, 
  shareOnTwitter,
  formatVehicleShareMessage 
} from '@/lib/sharing'
import { toast } from 'sonner'

interface ShareButtonsProps {
  vehicle: any
}

export function ShareButtons({ vehicle }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false)

  const currentUrl = window.location.href
  const shareMessage = formatVehicleShareMessage(vehicle)

  const handleCopyLink = async () => {
    const success = await copyToClipboard(currentUrl)
    if (success) {
      setCopied(true)
      toast.success('Link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } else {
      toast.error('Failed to copy link')
    }
  }

  const handleShareWhatsApp = () => {
    shareOnWhatsApp({
      title: `${vehicle.brand} ${vehicle.model}`,
      text: shareMessage,
      url: currentUrl
    })
  }

  const handleShareEmail = () => {
    shareViaEmail({
      title: `Check out: ${vehicle.brand} ${vehicle.model} on EduFleet`,
      text: shareMessage,
      url: currentUrl
    })
  }

  const handleShareFacebook = () => {
    shareOnFacebook(currentUrl)
  }

  const handleShareTwitter = () => {
    shareOnTwitter({
      title: shareMessage,
      text: shareMessage,
      url: currentUrl
    })
  }

  return (
    <div className="space-y-4">
      <h3 className="font-semibold flex items-center gap-2">
        <Share2 className="h-4 w-4" />
        Share This Vehicle
      </h3>
      
      <div className="grid grid-cols-2 gap-2">
        {/* Copy Link */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyLink}
          className="flex items-center gap-2"
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" />
              Copy Link
            </>
          )}
        </Button>

        {/* WhatsApp */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareWhatsApp}
          className="flex items-center gap-2"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>

        {/* Email */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareEmail}
          className="flex items-center gap-2"
        >
          <Mail className="h-4 w-4" />
          Email
        </Button>

        {/* Facebook */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareFacebook}
          className="flex items-center gap-2"
        >
          <Facebook className="h-4 w-4" />
          Facebook
        </Button>

        {/* Twitter */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleShareTwitter}
          className="flex items-center gap-2"
        >
          <Twitter className="h-4 w-4" />
          Twitter
        </Button>
      </div>

      <p className="text-xs text-muted-foreground">
        Share this listing with others to help them find the perfect vehicle
      </p>
    </div>
  )
}
