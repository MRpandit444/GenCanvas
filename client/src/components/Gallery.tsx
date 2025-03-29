import { useState } from 'react';
import { SavedArtwork } from '@/types/art';
import { Edit, Download, Trash2, Image } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GalleryProps {
  artworks: SavedArtwork[];
  onLoadArtwork: (settings: SavedArtwork['settings']) => void;
  onDeleteArtwork: (index: number) => void;
  onDownload: (imageUrl: string, index: number) => void;
}

export default function Gallery({
  artworks,
  onLoadArtwork,
  onDeleteArtwork,
  onDownload
}: GalleryProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleDelete = (index: number) => {
    setSelectedIndex(index);
    setShowDeleteDialog(true);
  };

  const confirmDelete = () => {
    if (selectedIndex !== null) {
      onDeleteArtwork(selectedIndex);
      setShowDeleteDialog(false);
      setSelectedIndex(null);
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">
          Your Gallery
        </h2>
        <span className="text-sm text-gray-500">{artworks.length} artwork{artworks.length !== 1 ? 's' : ''}</span>
      </div>
      
      {artworks.length === 0 ? (
        <div className="text-center p-6 text-gray-500 flex flex-col items-center gap-2">
          <Image className="w-12 h-12 opacity-30" />
          <p>Your saved artworks will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {artworks.map((artwork, index) => (
            <div key={index} className="relative group rounded-lg overflow-hidden shadow-sm border border-gray-100">
              <img 
                src={artwork.imageUrl} 
                alt={`Artwork ${index + 1}`}
                className="w-full aspect-square object-cover cursor-pointer" 
                onClick={() => onLoadArtwork(artwork.settings)}
              />
              {/* Display on mobile without hover */}
              <div className="flex items-center justify-between bg-gray-50 p-1 sm:p-2">
                <div className="text-xs text-gray-500 hidden sm:block">
                  {new Date(artwork.createdAt || Date.now()).toLocaleDateString()}
                </div>
                <div className="flex space-x-1 sm:space-x-2">
                  <button 
                    onClick={() => onLoadArtwork(artwork.settings)} 
                    className="p-1 rounded-md hover:bg-gray-200 text-primary"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => onDownload(artwork.imageUrl, index)} 
                    className="p-1 rounded-md hover:bg-gray-200 text-blue-600"
                  >
                    <Download size={16} />
                  </button>
                  <button 
                    onClick={() => handleDelete(index)} 
                    className="p-1 rounded-md hover:bg-gray-200 text-red-500"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              {/* Overlay for medium-large screens */}
              <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center sm:flex hidden">
                <div className="flex space-x-2">
                  <button 
                    onClick={() => onLoadArtwork(artwork.settings)} 
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Edit artwork"
                  >
                    <Edit className="text-primary" size={18} />
                  </button>
                  <button 
                    onClick={() => onDownload(artwork.imageUrl, index)} 
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Download artwork"
                  >
                    <Download className="text-blue-600" size={18} />
                  </button>
                  <button 
                    onClick={() => handleDelete(index)} 
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Delete artwork"
                  >
                    <Trash2 className="text-red-500" size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Artwork</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this artwork? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
