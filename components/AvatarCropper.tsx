import React, { useState, useCallback, useRef } from 'react';
import Cropper from 'react-easy-crop';
import { ZoomIn, ZoomOut } from 'lucide-react';

interface AvatarCropperProps {
  image: string;
  onCropComplete: (croppedAreaPixels: any) => void;
  onCancel: () => void;
  onConfirm: () => void;
}

const AvatarCropper: React.FC<AvatarCropperProps> = ({
  image,
  onCropComplete,
  onCancel,
  onConfirm,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const isProcessingRef = useRef(false);

  const onCropCompleteCustom = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    if (isProcessingRef.current) return;
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.1, 0.5));
  };

  const handleConfirm = () => {
    if (croppedAreaPixels && !isProcessingRef.current) {
      isProcessingRef.current = true;
      onCropComplete(croppedAreaPixels);
      setTimeout(() => {
        isProcessingRef.current = false;
      }, 500);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-cyber-panel border border-cyber-border rounded-2xl p-6 max-w-lg w-full shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4 text-center">Ajustar Avatar</h3>
        
        {/* Cropper Container */}
        <div className="relative w-full aspect-square bg-cyber-dark rounded-full overflow-hidden border-2 border-cyber-border mb-4">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            
            minZoom={0.5}
            maxZoom={3}
            zoomWithScroll={true}
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteCustom}
            style={{
              containerStyle: {
                width: '100%',
                height: '100%',
                backgroundColor: '#0a0a0f',
              },
              cropAreaStyle: {
                border: 'none',
              },
            }}
          />
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center justify-center space-x-4 mb-6">
          <button
            onClick={handleZoomOut}
            className="p-3 bg-cyber-dark border border-cyber-border rounded-lg hover:bg-cyber-border transition-colors"
            title="Zoom Out"
          >
            <ZoomOut size={20} className="text-white" />
          </button>
          <span className="text-sm font-mono text-cyber-blue min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-3 bg-cyber-dark border border-cyber-border rounded-lg hover:bg-cyber-border transition-colors"
            title="Zoom In"
          >
            <ZoomIn size={20} className="text-white" />
          </button>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-cyber-dark border border-cyber-border hover:bg-cyber-border text-white py-3 rounded-lg font-bold transition-all"
          >
            Cancelar
          </button>
          <button
            onClick={handleConfirm}
            disabled={!croppedAreaPixels}
            className="flex-1 bg-cyber-blue hover:bg-blue-600 text-white py-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(45,96,255,0.39)]"
          >
            Salvar
          </button>
        </div>

        <p className="text-xs text-gray-500 text-center mt-3">
          Use o scroll do mouse para zoom • Arraste para mover a imagem
        </p>
      </div>
    </div>
  );
};

export default AvatarCropper;
