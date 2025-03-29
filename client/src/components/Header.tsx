import { Button } from "@/components/ui/button";

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
    <header className="mb-8">
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <div>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 flex items-center">
            <span className="text-primary">Art</span>
            <span className="text-secondary-500">Gen</span>
            <span className="ml-2 text-lg text-gray-500 font-sans">| Create Your Masterpiece</span>
          </h1>
          <p className="text-gray-600 mt-1">Generate beautiful algorithmic art with simple controls</p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <Button 
            variant="secondary"
            onClick={onReset}
            className="flex items-center px-4 py-2"
          >
            <i className="ri-refresh-line mr-1"></i> New
          </Button>
          <Button
            variant="default"
            onClick={onDownload}
            className="flex items-center px-4 py-2"
          >
            <i className="ri-download-line mr-1"></i> Download
          </Button>
          <Button
            variant="outline"
            onClick={onShare}
            className="flex items-center px-4 py-2"
          >
            <i className="ri-share-line mr-1"></i> Share
          </Button>
        </div>
      </div>
    </header>
  );
}
