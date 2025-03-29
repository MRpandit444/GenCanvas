import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  shareUrl: string;
}

export default function ShareModal({
  open,
  onOpenChange,
  shareUrl
}: ShareModalProps) {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) {
      setCopied(false);
    }
  }, [open]);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({
        title: "Copied to clipboard",
        description: "Share link has been copied to your clipboard"
      });
      
      // Reset copied state after 2 seconds
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again or copy the link manually",
        variant: "destructive"
      });
    }
  };

  const shareOnSocial = (platform: string) => {
    let url = '';
    
    switch (platform) {
      case 'twitter':
        url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent('Check out my generative artwork!')}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'pinterest':
        url = `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&description=${encodeURIComponent('Generative Artwork')}`;
        break;
      default:
        return;
    }
    
    window.open(url, '_blank')?.focus();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Artwork</DialogTitle>
          <DialogDescription>
            Copy this unique link to share your artwork with others
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 mt-2">
          <div className="grid flex-1 gap-2">
            <Input
              readOnly
              value={shareUrl}
              className="w-full"
            />
          </div>
          <Button type="submit" size="sm" onClick={copyToClipboard}>
            {copied ? "Copied!" : "Copy"}
          </Button>
        </div>
        
        <div className="mt-4">
          <p className="text-sm text-gray-500 mb-2">
            Or share on social media:
          </p>
          <div className="flex space-x-3">
            <button 
              onClick={() => shareOnSocial('twitter')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white hover:bg-blue-600"
            >
              <i className="ri-twitter-fill"></i>
            </button>
            <button 
              onClick={() => shareOnSocial('facebook')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-700 text-white hover:bg-blue-800"
            >
              <i className="ri-facebook-fill"></i>
            </button>
            <button 
              onClick={() => shareOnSocial('pinterest')}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-red-500 text-white hover:bg-red-600"
            >
              <i className="ri-pinterest-fill"></i>
            </button>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
