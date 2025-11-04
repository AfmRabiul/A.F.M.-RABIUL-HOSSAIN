import React, { useState, useCallback, useEffect } from 'react';
import Header from './components/Header';
import ImageUploader from './components/ImageUploader';
import EditorCanvas from './components/EditorCanvas';
import EditingToolbar from './components/EditingToolbar';
import ManualAdjustments from './components/ManualAdjustments';
import AIFilters from './components/AIFilters';
import { editImageWithPrompt, upscaleImage as upscaleImageService } from './services/geminiService';
import type { ImageFile } from './types';
import { DownloadIcon, UpscaleIcon } from './components/Icons';
import type { Area } from 'react-easy-crop';
import { useHistory } from './hooks/useHistory';

// Helper to calculate rotated bounding box size
const rotateSize = (width: number, height: number, rotation: number) => {
    const rotRad = (Math.abs(rotation) * Math.PI) / 180;
    return {
        width:
            Math.abs(width * Math.cos(rotRad)) + Math.abs(height * Math.sin(rotRad)),
        height:
            Math.abs(height * Math.cos(rotRad)) + Math.abs(width * Math.sin(rotRad)),
    };
};


// Utility to apply filters and rotation to an image via canvas and return a new base64 string
const applyFiltersAndGetBase64 = (
    imageSrc: string,
    filters: { brightness: number; contrast: number; saturation: number; },
    rotation = 0,
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                return reject(new Error("Could not get canvas context"));
            }

            const { width, height } = rotateSize(image.width, image.height, rotation);
            canvas.width = width;
            canvas.height = height;
            
            ctx.translate(width / 2, height / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.translate(-image.width / 2, -image.height / 2);

            ctx.filter = `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%)`;
            ctx.drawImage(image, 0, 0);

            resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = (error) => reject(error);
    });
};

// Utility to crop and rotate an image via canvas
const getCroppedImg = (
    imageSrc: string,
    pixelCrop: Area,
    rotation = 0
): Promise<string> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.crossOrigin = 'anonymous';
        image.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            if (!ctx) {
                return reject(new Error('Failed to get canvas context'));
            }

            const rotRad = (rotation * Math.PI) / 180;
            const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
                image.width,
                image.height,
                rotation
            );

            canvas.width = bBoxWidth;
            canvas.height = bBoxHeight;

            ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
            ctx.rotate(rotRad);
            ctx.translate(-image.width / 2, -image.height / 2);

            ctx.drawImage(image, 0, 0);

            const data = ctx.getImageData(
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height
            );

            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;

            ctx.putImageData(data, 0, 0);

            resolve(canvas.toDataURL('image/png'));
        };
        image.onerror = (error) => reject(error);
    });
};

interface EditorState {
  originalImage: ImageFile | null;
  imageToDisplay: string | null;
  imageBeforeAI: string | null;
  editedImage: string | null;
  upscaledImage: string | null;
  brightness: number;
  contrast: number;
  saturation: number;
  rotation: number;
}

const initialState: EditorState = {
  originalImage: null,
  imageToDisplay: null,
  imageBeforeAI: null,
  editedImage: null,
  upscaledImage: null,
  brightness: 100,
  contrast: 100,
  saturation: 100,
  rotation: 0,
};

const App: React.FC = () => {
  const { state, setState, undo, redo, canUndo, canRedo } = useHistory<EditorState>(initialState);
  const { 
    originalImage, imageToDisplay, imageBeforeAI, editedImage, upscaledImage, 
    brightness, contrast, saturation, rotation 
  } = state;

  // UI state not part of history
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isUpscaling, setIsUpscaling] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  
  const handleImageUpload = (imageFile: ImageFile) => {
    setState({
        ...initialState,
        originalImage: imageFile,
        imageToDisplay: imageFile.base64,
    });
  };

  const handleEditRequest = useCallback(async (prompt: string) => {
    if (!imageToDisplay) {
      setError("Please upload an image first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const imageWithTransforms = await applyFiltersAndGetBase64(
          imageToDisplay,
          { brightness, contrast, saturation },
          rotation
      );
      
      const base64Data = imageWithTransforms.split(',')[1];
      const result = await editImageWithPrompt(base64Data, 'image/png', prompt);

      setState({
          ...state,
          imageBeforeAI: imageWithTransforms,
          editedImage: `data:image/png;base64,${result}`,
          upscaledImage: null, // Reset upscale on new edit
      });

    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : "An unknown error occurred.");
    } finally {
      setIsLoading(false);
    }
  }, [state, setState]);

  const handleUpscaleRequest = async () => {
    if (!editedImage) {
        setError("There's no edited image to upscale.");
        return;
    }

    setIsUpscaling(true);
    setError(null);
    try {
        const base64Data = editedImage.split(',')[1];
        const result = await upscaleImageService(base64Data, 'image/png');
        setState({ ...state, upscaledImage: `data:image/png;base64,${result}` });
    } catch (e) {
        console.error(e);
        setError(e instanceof Error ? e.message : "An unknown error occurred during upscaling.");
    } finally {
        setIsUpscaling(false);
    }
  };
  
  const resetAllAdjustments = () => {
    setState({
        ...state,
        brightness: 100,
        contrast: 100,
        saturation: 100,
        rotation: 0,
        imageToDisplay: originalImage ? originalImage.base64 : null,
    });
    setIsCropping(false);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const resetEditor = () => {
    setState(initialState);
    setError(null);
    setIsLoading(false);
    setIsUpscaling(false);
  };

  const downloadImage = () => {
    const imageUrl = upscaledImage || editedImage;
    if (!imageUrl) return;
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = upscaledImage ? 'lumina-upscaled.png' : 'lumina-edited.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApplyCrop = async () => {
    if (croppedAreaPixels && imageToDisplay) {
      const croppedImage = await getCroppedImg(imageToDisplay, croppedAreaPixels, rotation);
      setState({
          ...state,
          imageToDisplay: croppedImage,
          rotation: 0,
      });
    }
    setIsCropping(false);
  };

  const handleRotate = () => {
    setState({ ...state, rotation: (state.rotation + 90) % 360 });
  }

  const handleManualAdjustmentChange = useCallback((newValues: Partial<EditorState>) => {
      setState({ ...state, ...newValues });
  }, [state, setState]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header 
        onReset={originalImage ? resetEditor : undefined}
        onUndo={undo}
        onRedo={redo}
        canUndo={canUndo}
        canRedo={canRedo}
      />
      <main className="flex-grow flex flex-col lg:flex-row items-stretch p-4 gap-4">
        {originalImage ? (
          <>
            <div className="lg:w-1/3 xl:w-1/4 flex-shrink-0 flex flex-col gap-4">
              <ManualAdjustments
                brightness={brightness}
                contrast={contrast}
                saturation={saturation}
                isCropping={isCropping}
                onCropToggle={() => setIsCropping(!isCropping)}
                onCropApply={handleApplyCrop}
                onRotateClick={handleRotate}
                onReset={resetAllAdjustments}
                onCommitChange={handleManualAdjustmentChange}
              />
              <AIFilters onSelectFilter={handleEditRequest} isLoading={isLoading} />
              <EditingToolbar onEdit={handleEditRequest} isLoading={isLoading} error={error} />
            </div>
            <div className="flex-grow flex flex-col items-center justify-center p-4 bg-gray-800/50 rounded-lg relative">
              <EditorCanvas
                imageToDisplay={imageToDisplay}
                editedImage={editedImage}
                upscaledImage={upscaledImage}
                imageBeforeAI={imageBeforeAI}
                isLoading={isLoading}
                filters={{ brightness, contrast, saturation }}
                rotation={rotation}
                isCropping={isCropping}
                crop={crop}
                zoom={zoom}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, pixels) => setCroppedAreaPixels(pixels)}
              />
              {editedImage && !isLoading && (
                <div className="absolute top-4 right-4 flex gap-2 z-10">
                  {!upscaledImage && (
                    <button
                      onClick={handleUpscaleRequest}
                      disabled={isUpscaling}
                      className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors duration-200"
                    >
                      {isUpscaling ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Upscaling...
                        </>
                      ) : (
                        <>
                          <UpscaleIcon className="h-5 w-5 mr-2" />
                          Upscale
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={downloadImage}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded-lg flex items-center transition-colors duration-200"
                  >
                    <DownloadIcon className="h-5 w-5 mr-2" />
                    Download
                  </button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="w-full flex items-center justify-center">
            <ImageUploader onImageUpload={handleImageUpload} />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
