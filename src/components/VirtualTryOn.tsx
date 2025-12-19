import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Upload,
  Camera,
  RotateCcw,
  Palette,
  X,
  Check,
  AlertCircle,
  Loader2,
  Grid,
  Flash,
  FlipHorizontal,
  Crop,
  RotateCw,
  Sun,
  Moon,
  Zap,
  User,
  Shield,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { Button } from "./ui/button";
import { Slider } from "./ui/slider";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Progress } from "./ui/progress";
import { ImageWithFallback } from "./figma/ImageWithFallback";

// Types
interface UserPhoto {
  id: string;
  userId: string;
  imageUrl: string;
  processedUrl?: string;
  avatarUrl?: string;
  measurements?: {
    height: number;
    shape: string;
    shoulders: number;
    bust: number;
    waist: number;
    hips: number;
    inseam: number;
  };
  poseType?: string;
  backgroundType?: string;
  createdAt: Date;
  isPrimary: boolean;
}

interface PhotoValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

type UploadStep = "initial" | "camera" | "upload" | "review" | "editing" | "processing" | "results";

export function VirtualTryOn() {
  const [step, setStep] = useState<UploadStep>("initial");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [fitLevel, setFitLevel] = useState([50]);
  const [sizeLevel, setSizeLevel] = useState([50]);
  const [validation, setValidation] = useState<PhotoValidation | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  const [measurements, setMeasurements] = useState<UserPhoto["measurements"] | null>(null);
  
  // Camera state
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [facingMode, setFacingMode] = useState<"user" | "environment">("user");
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showInstructions, setShowInstructions] = useState(true);
  
  // Photo editing state
  const [cropData, setCropData] = useState<any>(null);
  const [rotation, setRotation] = useState(0);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const colors = ["#F5DCE7", "#E3F0FF", "#E8F5E9", "#F7EDE2", "#C8A2C8", "#DAD7CD"];

  // Initialize camera
  const startCamera = async () => {
    // Check if MediaDevices API is supported
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert("Camera access is not supported in this browser. Please use the Upload option instead.");
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setStep("camera");
    } catch (error: any) {
      console.error("Error accessing camera:", error);
      
      // Provide user-friendly error messages
      let errorMessage = "Unable to access camera. ";
      if (error.name === "NotAllowedError" || error.name === "PermissionDeniedError") {
        errorMessage += "Please allow camera permissions in your browser settings.";
      } else if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError") {
        errorMessage += "No camera found on this device. Please use the Upload option instead.";
      } else if (error.name === "NotReadableError" || error.name === "TrackStartError") {
        errorMessage += "Camera is already in use by another application.";
      } else {
        errorMessage += "Please check your camera permissions and try again.";
      }
      
      alert(errorMessage);
    }
  };

  // Stop camera
  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [stream]);

  // Ensure video plays when stream is ready
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch((error) => {
        console.error("Error playing video:", error);
      });
    }
  }, [stream]);

  // Cleanup camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Switch camera
  const switchCamera = async () => {
    stopCamera();
    setFacingMode(facingMode === "user" ? "environment" : "user");
    await new Promise((resolve) => setTimeout(resolve, 100));
    startCamera();
  };

  // Countdown and capture
  const capturePhoto = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setCountdown(3);
    for (let i = 3; i > 0; i--) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setCountdown(i - 1);
    }
    setCountdown(null);

    const canvas = canvasRef.current;
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedPhotos((prev) => [...prev, dataUrl]);
      if (capturedPhotos.length === 0) {
        setSelectedImage(dataUrl);
      }
    }
  };

  // Handle file upload
  const handleFileSelect = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp|heic)$/i)) {
      alert("Please upload a valid image file (JPG, PNG, WebP, or HEIC)");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be less than 10MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setSelectedImage(result);
      validatePhoto(result);
      setStep("review");
    };
    reader.readAsDataURL(file);
  };

  // Drag and drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Photo validation
  const validatePhoto = (imageUrl: string): PhotoValidation => {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Simulate validation checks
    const img = new Image();
    img.onload = () => {
      if (img.width < 800 || img.height < 1200) {
        errors.push("Photo dimensions too small. Minimum: 800x1200 pixels");
      }

      const aspectRatio = img.width / img.height;
      if (aspectRatio < 0.5 || aspectRatio > 0.8) {
        warnings.push("Photo aspect ratio may not be optimal for full-body");
      }

      if (img.width < 1200 || img.height < 1800) {
        suggestions.push("For best results, use a photo with at least 1200x1800 pixels");
      }

      suggestions.push("Ensure full body is visible from head to toe");
      suggestions.push("Stand straight with arms slightly away from body");
      suggestions.push("Use a plain, contrasting background for better results");
    };
    img.src = imageUrl;

    const validation: PhotoValidation = {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };

    setValidation(validation);
    return validation;
  };

  // Process photo (simulated AI processing)
  const processPhoto = async () => {
    setIsProcessing(true);
    setProcessingProgress(0);
    setStep("processing");

    // Simulate processing steps
    const steps = [
      "Analyzing photo...",
      "Detecting body measurements...",
      "Generating 3D avatar...",
      "Optimizing for virtual try-on...",
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setProcessingProgress(((i + 1) / steps.length) * 100);
    }

    // Simulate extracted measurements
    setMeasurements({
      height: 170,
      shape: "Hourglass",
      shoulders: 38,
      bust: 36,
      waist: 28,
      hips: 38,
      inseam: 32,
    });

    setIsProcessing(false);
    setStep("results");
  };

  // Initial Upload Screen
  if (step === "initial") {
    return (
      <div className="min-h-screen pb-28 px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2>Virtual Try-On</h2>
            <p className="text-[#8A8A8A]">See how outfits look on you</p>
          </div>


          {/* Upload Zone */}
          <motion.div
            ref={dropZoneRef}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            whileHover={{ scale: 1.02 }}
            className="rounded-[24px] bg-gradient-to-br from-[#F5DCE7] to-[#E3F0FF] p-8 aspect-[3/4] flex flex-col items-center justify-center border-2 border-dashed border-white/60 cursor-pointer relative overflow-hidden"
            onClick={() => fileInputRef.current?.click()}
            style={{ textAlign: 'center' }}
          >
            <div className="w-20 h-20 rounded-full bg-white/40 backdrop-blur-sm flex items-center justify-center mb-4">
              <Upload className="w-10 h-10 text-white" />
            </div>
            <h3 
              className="text-center mb-2 font-semibold"
              style={{ 
                color: '#FFFFFF',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                fontSize: '20px',
                fontWeight: 600
              }}
            >
              Upload Your Photo
            </h3>
            <p 
              className="text-center text-sm mb-4"
              style={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                lineHeight: '1.5'
              }}
            >
              Take or upload a full-body photo for best results
            </p>
            <p 
              className="text-center text-xs"
              style={{ 
                color: '#FFFFFF',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.2)',
                opacity: 0.95
              }}
            >
              Drag and drop or click to browse
            </p>
            {/* Hidden file input - completely invisible, no browser default text shown */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/heic"
              className="hidden"
              style={{ 
                display: 'none',
                visibility: 'hidden',
                position: 'absolute',
                width: 0,
                height: 0,
                opacity: 0,
                pointerEvents: 'none'
              }}
              aria-label="Upload photo file"
              tabIndex={-1}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
            />
          </motion.div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={startCamera}
              className="h-14 rounded-[16px] bg-white/60 backdrop-blur-md border-2 border-white/40 text-[#4A4A4A] transition-all duration-200 ease-in-out hover:bg-white hover:border-white/60 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
              style={{
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
              }}
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="h-14 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg border-2 border-transparent transition-all duration-200 ease-in-out hover:from-[#B892B8] hover:to-[#D3A8D3] hover:scale-[1.02] hover:shadow-xl hover:border-white/30 active:scale-[0.98]"
              style={{
                boxShadow: '0 4px 12px rgba(200, 162, 200, 0.3)'
              }}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload
            </Button>
          </div>

          {/* Instructions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-[20px] bg-white/60 backdrop-blur-md border border-white/40 p-4"
          >
            <h4 className="text-[#4A4A4A] font-semibold mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Tips for Best Results
            </h4>
            <ul className="text-sm text-[#8A8A8A] space-y-1">
              <li>• Stand straight with arms slightly away from body</li>
              <li>• Ensure full body is visible from head to toe</li>
              <li>• Use a plain, contrasting background</li>
              <li>• Wear form-fitting clothes for accurate measurements</li>
              <li>• Ensure good lighting</li>
            </ul>
          </motion.div>
        </motion.div>
      </div>
    );
  }

  // Camera Screen
  if (step === "camera") {
    return (
      <div className="fixed inset-0 bg-black z-50">
        <div className="relative w-full h-full">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
            style={{ transform: facingMode === "user" ? "scaleX(-1)" : "none" }}
          />

          {/* Grid Overlay */}
          {showGrid && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="w-full h-full grid grid-cols-3 grid-rows-3 border-white/20">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="border border-white/20" />
                ))}
              </div>
            </div>
          )}

          {/* Instructions Overlay */}
          {showInstructions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-20 left-4 right-4 bg-black/70 backdrop-blur-sm rounded-[20px] p-4 text-white"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold">Ideal Pose</h3>
                <button onClick={() => setShowInstructions(false)}>
                  <X className="w-4 h-4" />
                </button>
              </div>
              <ul className="text-sm space-y-1">
                <li>• Stand straight, arms slightly away from body</li>
                <li>• Full body visible from head to toe</li>
                <li>• Look straight ahead</li>
                <li>• Plain background recommended</li>
              </ul>
            </motion.div>
          )}

          {/* Countdown */}
          {countdown !== null && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/50"
            >
              <div className="text-white text-9xl font-bold">{countdown}</div>
            </motion.div>
          )}

          {/* Camera Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-3">
                <Button
                  onClick={switchCamera}
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 text-white hover:bg-white/30"
                >
                  <FlipHorizontal className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => setFlashEnabled(!flashEnabled)}
                  variant="ghost"
                  size="icon"
                  className={`${flashEnabled ? "bg-yellow-500/50" : "bg-white/20"} text-white hover:bg-white/30`}
                >
                  <Zap className="w-5 h-5" />
                </Button>
                <Button
                  onClick={() => setShowGrid(!showGrid)}
                  variant="ghost"
                  size="icon"
                  className={`${showGrid ? "bg-white/50" : "bg-white/20"} text-white hover:bg-white/30`}
                >
                  <Grid className="w-5 h-5" />
                </Button>
              </div>
              <Button
                onClick={() => {
                  stopCamera();
                  setStep("initial");
                }}
                variant="ghost"
                size="icon"
                className="bg-white/20 text-white hover:bg-white/30"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="flex items-center justify-center gap-4">
              {capturedPhotos.length > 0 && (
                <Button
                  onClick={() => {
                    if (selectedPhotoIndex > 0) {
                      setSelectedPhotoIndex(selectedPhotoIndex - 1);
                      setSelectedImage(capturedPhotos[selectedPhotoIndex - 1]);
                    }
                  }}
                  variant="ghost"
                  size="icon"
                  className="bg-white/20 text-white hover:bg-white/30"
                  disabled={selectedPhotoIndex === 0}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              )}

              <Button
                onClick={capturePhoto}
                className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 hover:bg-gray-100"
                disabled={countdown !== null || capturedPhotos.length >= 5}
              >
                <div className="w-16 h-16 rounded-full bg-white border-2 border-gray-400" />
              </Button>

              {capturedPhotos.length > 0 && (
                <>
                  <Button
                    onClick={() => {
                      if (selectedPhotoIndex < capturedPhotos.length - 1) {
                        setSelectedPhotoIndex(selectedPhotoIndex + 1);
                        setSelectedImage(capturedPhotos[selectedPhotoIndex + 1]);
                      }
                    }}
                    variant="ghost"
                    size="icon"
                    className="bg-white/20 text-white hover:bg-white/30"
                    disabled={selectedPhotoIndex === capturedPhotos.length - 1}
                  >
                    <ChevronRight className="w-5 h-5" />
                  </Button>
                  {capturedPhotos.length > 0 && (
                    <Button
                      onClick={() => {
                        setStep("review");
                        stopCamera();
                      }}
                      className="bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white"
                    >
                      Review ({capturedPhotos.length})
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
        <canvas ref={canvasRef} className="hidden" />
      </div>
    );
  }

  // Review Screen
  if (step === "review" && selectedImage) {
    return (
      <div className="min-h-screen pb-28 px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2>Review Your Photo</h2>
            <p className="text-[#8A8A8A]">Make sure everything looks good</p>
          </div>

          {/* Photo Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
          >
            <div className="aspect-[3/4] relative">
              <img
                src={selectedImage}
                alt="Uploaded photo"
                className="w-full h-full object-cover"
              />
            </div>
          </motion.div>

          {/* Validation Feedback */}
          {validation && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              {validation.errors.length > 0 && (
                <div className="rounded-[20px] bg-red-50 border border-red-200 p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <h4 className="font-semibold text-red-800">Issues Found</h4>
                  </div>
                  <ul className="text-sm text-red-700 space-y-1">
                    {validation.errors.map((error, i) => (
                      <li key={i}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.warnings.length > 0 && (
                <div className="rounded-[20px] bg-yellow-50 border border-yellow-200 p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <h4 className="font-semibold text-yellow-800">Warnings</h4>
                  </div>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    {validation.warnings.map((warning, i) => (
                      <li key={i}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {validation.suggestions.length > 0 && (
                <div className="rounded-[20px] bg-blue-50 border border-blue-200 p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <h4 className="font-semibold text-blue-800">Suggestions</h4>
                  </div>
                  <ul className="text-sm text-blue-700 space-y-1">
                    {validation.suggestions.map((suggestion, i) => (
                      <li key={i}>• {suggestion}</li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => {
                setStep("initial");
                setSelectedImage(null);
                setCapturedPhotos([]);
              }}
              className="h-14 rounded-[16px] bg-white/60 backdrop-blur-md border border-white/40 text-[#4A4A4A] hover:bg-white"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Retake
            </Button>
            <Button
              onClick={() => setStep("editing")}
              className="h-14 rounded-[16px] bg-white/60 backdrop-blur-md border border-white/40 text-[#4A4A4A] hover:bg-white"
            >
              <Crop className="w-5 h-5 mr-2" />
              Edit
            </Button>
          </div>

          <Button
            onClick={processPhoto}
            disabled={!validation?.isValid}
            className="w-full h-14 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg disabled:opacity-50"
          >
            {validation?.isValid ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Continue to Processing
              </>
            ) : (
              "Fix Issues First"
            )}
          </Button>
        </motion.div>
      </div>
    );
  }

  // Editing Screen
  if (step === "editing" && selectedImage) {
    return (
      <div className="min-h-screen pb-28 px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <h2>Edit Photo</h2>
            <p className="text-[#8A8A8A]">Adjust your photo for best results</p>
          </div>

          {/* Photo Preview with Edits */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
          >
            <div className="aspect-[3/4] relative overflow-hidden">
              <img
                src={selectedImage}
                alt="Photo being edited"
                className="w-full h-full object-cover"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  filter: `brightness(${brightness}%) contrast(${contrast}%)`,
                }}
              />
            </div>
          </motion.div>

          {/* Editing Controls */}
          <div className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[#4A4A4A] flex items-center gap-2">
                  <RotateCw className="w-4 h-4" />
                  Rotation
                </label>
                <span className="text-[#8A8A8A]">{rotation}°</span>
              </div>
              <Slider
                value={[rotation]}
                onValueChange={(value) => setRotation(value[0])}
                min={-180}
                max={180}
                step={1}
                className="[&_[role=slider]]:bg-[#C8A2C8]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[#4A4A4A] flex items-center gap-2">
                  <Sun className="w-4 h-4" />
                  Brightness
                </label>
                <span className="text-[#8A8A8A]">{brightness}%</span>
              </div>
              <Slider
                value={[brightness]}
                onValueChange={(value) => setBrightness(value[0])}
                min={0}
                max={200}
                step={1}
                className="[&_[role=slider]]:bg-[#C8A2C8]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[#4A4A4A] flex items-center gap-2">
                  <Moon className="w-4 h-4" />
                  Contrast
                </label>
                <span className="text-[#8A8A8A]">{contrast}%</span>
              </div>
              <Slider
                value={[contrast]}
                onValueChange={(value) => setContrast(value[0])}
                min={0}
                max={200}
                step={1}
                className="[&_[role=slider]]:bg-[#C8A2C8]"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => {
                setRotation(0);
                setBrightness(100);
                setContrast(100);
              }}
              className="h-14 rounded-[16px] bg-white/60 backdrop-blur-md border border-white/40 text-[#4A4A4A] hover:bg-white"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
            <Button
              onClick={() => setStep("review")}
              className="h-14 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg"
            >
              <Check className="w-5 h-5 mr-2" />
              Done
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Processing Screen
  if (step === "processing") {
    return (
      <div className="min-h-screen pb-28 px-6 pt-8 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md space-y-6"
        >
          <div className="text-center">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              className="inline-block mb-4"
            >
              <Loader2 className="w-16 h-16 text-[#C8A2C8]" />
            </motion.div>
            <h2 className="mb-2">Processing Your Photo</h2>
            <p className="text-[#8A8A8A]">This may take a few moments...</p>
          </div>

          <div className="space-y-2">
            <Progress value={processingProgress} className="h-2" />
            <p className="text-center text-sm text-[#8A8A8A]">
              {Math.round(processingProgress)}% complete
            </p>
          </div>

          <div className="rounded-[20px] bg-white/60 backdrop-blur-md border border-white/40 p-4">
            <p className="text-sm text-[#4A4A4A] text-center">
              Analyzing your photo and extracting measurements...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  // Results Screen
  if (step === "results" && measurements) {
    return (
      <div className="min-h-screen pb-28 px-6 pt-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
                <Check className="w-10 h-10 text-white" />
              </div>
            </motion.div>
            <h2>Photo Processed Successfully!</h2>
            <p className="text-[#8A8A8A]">Your measurements have been extracted</p>
          </div>

          {/* Measurements Display */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg p-6"
          >
            <h3 className="text-[#4A4A4A] font-semibold mb-4 flex items-center gap-2">
              <User className="w-5 h-5" />
              Extracted Measurements
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[#8A8A8A]">Height</p>
                <p className="text-lg font-semibold text-[#4A4A4A]">{measurements.height} cm</p>
              </div>
              <div>
                <p className="text-sm text-[#8A8A8A]">Body Shape</p>
                <p className="text-lg font-semibold text-[#4A4A4A]">{measurements.shape}</p>
              </div>
              <div>
                <p className="text-sm text-[#8A8A8A]">Shoulders</p>
                <p className="text-lg font-semibold text-[#4A4A4A]">{measurements.shoulders}"</p>
              </div>
              <div>
                <p className="text-sm text-[#8A8A8A]">Bust</p>
                <p className="text-lg font-semibold text-[#4A4A4A]">{measurements.bust}"</p>
              </div>
              <div>
                <p className="text-sm text-[#8A8A8A]">Waist</p>
                <p className="text-lg font-semibold text-[#4A4A4A]">{measurements.waist}"</p>
              </div>
              <div>
                <p className="text-sm text-[#8A8A8A]">Hips</p>
                <p className="text-lg font-semibold text-[#4A4A4A]">{measurements.hips}"</p>
              </div>
            </div>
          </motion.div>

          {/* Virtual Try-On Preview */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg overflow-hidden"
          >
            <div className="aspect-[3/4] bg-gradient-to-br from-[#F7EDE2] to-[#E8F5E9] relative">
              <ImageWithFallback
                src={selectedImage || ""}
                alt="Virtual try-on model"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              <div className="absolute top-4 right-4">
                <div className="px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm">
                  <p className="text-[#C8A2C8]">AI Fitted</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Try-On Controls */}
          <div className="rounded-[24px] bg-white/60 backdrop-blur-md border border-white/40 shadow-lg p-6 space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[#4A4A4A]">Fit Adjustment</label>
                <span className="text-[#8A8A8A]">{fitLevel[0]}%</span>
              </div>
              <Slider
                value={fitLevel}
                onValueChange={setFitLevel}
                max={100}
                step={1}
                className="[&_[role=slider]]:bg-[#C8A2C8]"
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-[#4A4A4A]">Size</label>
                <span className="text-[#8A8A8A]">{sizeLevel[0]}%</span>
              </div>
              <Slider
                value={sizeLevel}
                onValueChange={setSizeLevel}
                max={100}
                step={1}
                className="[&_[role=slider]]:bg-[#C8A2C8]"
              />
            </div>

            <div className="space-y-3">
              <label className="text-[#4A4A4A]">Color Variations</label>
              <div className="flex gap-3">
                {colors.map((color, index) => (
                  <motion.button
                    key={index}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-12 h-12 rounded-[14px] border-2 border-white shadow-md"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => {
                setStep("initial");
                setSelectedImage(null);
                setMeasurements(null);
              }}
              className="h-14 rounded-[16px] bg-white/60 backdrop-blur-md border border-white/40 text-[#4A4A4A] hover:bg-white"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Try Another
            </Button>
            <Button
              className="h-14 rounded-[16px] bg-gradient-to-r from-[#C8A2C8] to-[#E3B8E3] text-white shadow-lg"
            >
              <Palette className="w-5 h-5 mr-2" />
              Save Look
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return null;
}
