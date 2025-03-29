import { useState } from 'react';
import { SavedArtwork } from '@/types/art';
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
      <h2 className="text-xl font-semibold mb-4 text-gray-800 pb-2 border-b border-gray-100">
        Your Gallery
      </h2>
      
      {artworks.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <i className="ri-gallery-line text-3xl mb-2"></i>
          <p>Your saved artworks will appear here</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {artworks.map((artwork, index) => (
            <div key={index} className="relative group">
              <img 
                src={artwork.imageUrl} 
                alt={`Artwork ${index + 1}`}
                className="w-full h-32 object-cover rounded-md cursor-pointer" 
                onClick={() => onLoadArtwork(artwork.settings)}
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                <button 
                  onClick={() => onLoadArtwork(artwork.settings)} 
                  className="p-1 bg-white rounded-full mx-1 hover:bg-gray-100"
                >
                  <i className="ri-edit-line text-primary"></i>
                </button>
                <button 
                  onClick={() => onDownload(artwork.imageUrl, index)} 
                  className="p-1 bg-white rounded-full mx-1 hover:bg-gray-100"
                >
                  <i className="ri-download-line text-accent"></i>
                </button>
                <button 
                  onClick={() => handleDelete(index)} 
                  className="p-1 bg-white rounded-full mx-1 hover:bg-gray-100"
                >
                  <i className="ri-delete-bin-line text-secondary-500"></i>
                </button>
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
