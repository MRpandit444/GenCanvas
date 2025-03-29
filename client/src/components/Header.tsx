import { Button } from "@/components/ui/button";
import { RefreshCw, Download, Share } from "lucide-react";

interface HeaderProps {
  onReset: () => void;
  onDownload: () => void;
  onShare: () => void;
}

export default function Header({
  onReset,
  onDownload,
  onShare
}: HeaderProps) {
  return (
    <header className="mb-4 sm:mb-6">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div className="w-full sm:w-auto flex justify-between items-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center">
            <span className="text-primary">Art</span>
            <span className="text-secondary-500">Gen</span>
            <span className="ml-2 text-sm sm:text-lg text-gray-500 font-light hidden sm:inline-block">| Create Your Masterpiece</span>
          </h1>
        </div>
        
        <div className="w-full sm:w-auto flex justify-between gap-2 sm:gap-3">
          <Button 
            variant="secondary"
            onClick={onReset}
            size="sm"
            className="flex items-center gap-1 flex-1 sm:flex-initial btn-hover-effect hover-scale transition-transform"
          >
            <RefreshCw size={16} className="hover-spin" />
            <span className="sm:inline">New</span>
          </Button>
          
          <Button
            variant="default"
            onClick={onDownload}
            size="sm"
            className="flex items-center gap-1 flex-1 sm:flex-initial btn-hover-effect hover-scale transition-transform"
          >
            <Download size={16} className="group-hover:animate-bounce" />
            <span className="sm:inline">Download</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={onShare}
            size="sm"
            className="flex items-center gap-1 flex-1 sm:flex-initial btn-hover-effect hover-scale transition-transform"
          >
            <Share size={16} className="hover-pulse" />
            <span className="sm:inline">Share</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
