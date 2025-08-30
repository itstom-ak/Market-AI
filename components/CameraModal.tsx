
import React, { useState, useRef, useEffect } from 'react';
import { Spinner } from './Spinner';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (blob: Blob) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const stopStream = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setError(null);
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(mediaStream => {
          setStream(mediaStream);
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Camera access error:", err);
          setError("Could not access the camera. Please check permissions and try again.");
          setLoading(false);
        });
    } else {
      stopStream();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
          if (blob) {
            onCapture(blob);
            onClose();
          }
        }, 'image/jpeg', 0.95);
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 transition-opacity duration-300" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="camera-modal-title">
      <div className="bg-slate-800 rounded-lg shadow-xl p-4 w-full max-w-lg mx-4 text-center" onClick={e => e.stopPropagation()}>
        <h3 id="camera-modal-title" className="text-xl font-bold text-white mb-4">Take a Photo</h3>
        <div className="relative bg-slate-900 rounded-md overflow-hidden aspect-video">
          <video ref={videoRef} autoPlay playsInline className={`w-full h-full object-cover ${loading || error ? 'hidden' : 'block'}`} title="Live camera feed" />
          <canvas ref={canvasRef} className="hidden" aria-hidden="true" />
          
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
              <Spinner />
              <p className="mt-2">Starting camera...</p>
            </div>
          )}

          {error && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-red-400 p-4" role="alert">
              <p>{error}</p>
            </div>
          )}
        </div>
        <div className="flex justify-center gap-4 mt-4">
          <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-700 transition-colors">
            Cancel
          </button>
          <button 
            type="button" 
            onClick={handleCapture}
            disabled={loading || !!error}
            className="bg-primary-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-primary-700 transition-colors disabled:bg-slate-700 disabled:cursor-not-allowed"
            aria-label="Capture photo"
          >
            Capture
          </button>
        </div>
      </div>
    </div>
  );
};

export default CameraModal;
