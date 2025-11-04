import React from 'react';
import Cropper from 'react-easy-crop';
import type { Point, Area } from 'react-easy-crop';

interface EditorCanvasProps {
  imageToDisplay: string | null;
  editedImage: string | null;
  upscaledImage: string | null;
  imageBeforeAI: string | null;
  isLoading: boolean;
  filters: {
    brightness: number;
    contrast: number;
    saturation: number;
  };
  rotation: number;
  isCropping: boolean;
  crop: Point;
  zoom: number;
  onCropChange: (point: Point) => void;
  onZoomChange: (zoom: number) => void;
  onCropComplete: (croppedArea: Area, croppedAreaPixels: Area) => void;
}

const ImageDisplay: React.FC<{ src: string; alt: string; label: string, filters?: EditorCanvasProps['filters'], rotation?: number }> = ({ src, alt, label, filters, rotation = 0 }) => (
  <div className="w-full h-full flex flex-col items-center justify-center">
    <div className="relative w-full h-full flex items-center justify-center">
        <img 
            src={src} 
            alt={alt} 
            className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
            style={{
                ...(filters && { filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)` }),
                transform: `rotate(${rotation}deg)`,
                transition: 'transform 0.3s ease-in-out',
            }}
        />
    </div>
    <span className="mt-2 text-sm font-semibold text-gray-400">{label}</span>
  </div>
);

const LoadingSpinner: React.FC = () => (
  <div className="flex flex-col items-center justify-center text-indigo-400">
    <svg className="animate-spin h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
    <p className="mt-4 text-lg font-semibold">AI is working its magic...</p>
  </div>
);

const EditorCanvas: React.FC<EditorCanvasProps> = ({
  imageToDisplay,
  editedImage,
  upscaledImage,
  imageBeforeAI,
  isLoading,
  filters,
  rotation,
  isCropping,
  crop,
  zoom,
  onCropChange,
  onZoomChange,
  onCropComplete
}) => {
  if (!imageToDisplay) {
    return null;
  }
  
  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (isCropping) {
    return (
      <div className="w-full h-full relative">
        <Cropper
          image={imageToDisplay}
          crop={crop}
          zoom={zoom}
          aspect={4 / 3}
          rotation={rotation}
          onCropChange={onCropChange}
          onZoomChange={onZoomChange}
          onCropComplete={onCropComplete}
        />
      </div>
    );
  }

  if (editedImage) {
    const afterImageSrc = upscaledImage || editedImage;
    const afterImageLabel = upscaledImage ? 'AI Upscaled' : 'AI Edited';
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-full p-4">
        <ImageDisplay src={imageBeforeAI || imageToDisplay} alt="Before AI Edit" label="Before AI" />
        <ImageDisplay src={afterImageSrc} alt="After Edit" label={afterImageLabel} />
      </div>
    );
  }
  
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <ImageDisplay src={imageToDisplay} alt="Image to edit" label="Preview" filters={filters} rotation={rotation} />
    </div>
  );
};

export default EditorCanvas;