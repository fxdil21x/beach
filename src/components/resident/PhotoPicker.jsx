import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import { Camera, ImagePlus, X, ZoomIn, ZoomOut, Check } from 'lucide-react';
import Cropper from 'react-easy-crop';
import Button from '../ui/Button.jsx';
import getCroppedImg from '../../utils/cropImage.js';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export default function PhotoPicker({
  existingUrl = null,
  onSelect,
  uploading = false,
  error = '',
  success = '',
  label,
}) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [localError, setLocalError] = useState('');

  // Cropper Modal States
  const [tempSrc, setTempSrc] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [cropping, setCropping] = useState(false);
  const [portalTarget, setPortalTarget] = useState(null);
  const resolvedRef = useRef(false);

  useEffect(() => {
    if (!tempSrc) return;
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    const deviceLayer = window.__deviceModalLayer;
    setPortalTarget(deviceLayer || document.body);
  }, [tempSrc]);

  useEffect(() => {
    if (!tempSrc) {
      resolvedRef.current = false;
      setPortalTarget(null);
    }
  }, [tempSrc]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
      if (tempSrc) URL.revokeObjectURL(tempSrc);
    };
  }, [preview, tempSrc]);

  const displaySrc = preview || existingUrl;
  const hasPhoto = Boolean(displaySrc);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError(t('resident.invalidPhoto'));
      return;
    }

    setLocalError('');
    const objectUrl = URL.createObjectURL(file);
    setTempSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleChoose = () => {
    setLocalError('');
    fileInputRef.current?.click();
  };

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleSaveCrop = async () => {
    if (!tempSrc || !croppedAreaPixels) return;
    try {
      setCropping(true);
      const croppedBlob = await getCroppedImg(tempSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], 'profile.jpg', { type: 'image/jpeg' });
      
      const newPreview = URL.createObjectURL(croppedBlob);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(newPreview);

      // Clean up temporary image
      URL.revokeObjectURL(tempSrc);
      setTempSrc(null);

      // Trigger callback with cropped file
      onSelect?.(croppedFile);
    } catch {
      setLocalError(t('resident.invalidPhoto'));
    } finally {
      setCropping(false);
    }
  };

  const handleCancelCrop = () => {
    if (tempSrc) URL.revokeObjectURL(tempSrc);
    setTempSrc(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png,image/webp"
        capture="user"
        onChange={handleFileChange}
        className="hidden"
      />
      <div className="flex items-center gap-4">
        <div className="relative flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-gray-300 bg-gray-50">
          {hasPhoto ? (
            <img
              src={displaySrc}
              alt="Resident"
              className="h-full w-full object-cover"
            />
          ) : (
            <Camera className="h-8 w-8 text-gray-400" />
          )}
        </div>
        <div className="flex-1 space-y-1">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={handleChoose}
            disabled={uploading}
            className="flex items-center gap-2"
          >
            <ImagePlus className="h-4 w-4" />
            {hasPhoto ? t('resident.changePhoto') : (label || t('resident.uploadPhoto'))}
          </Button>
          <p className="text-xs text-gray-500">{t('resident.photoHelp')}</p>
        </div>
      </div>
      {(localError || error) && (
        <p className="mt-2 text-center text-sm font-medium text-red-600">{localError || error}</p>
      )}
      {!localError && !error && success && (
        <p className="mt-2 text-center text-sm font-medium text-green-700">{success}</p>
      )}

      {/* Crop Modal Dialog (PORTALED INSIDE DEVICE FRAME) */}
      {tempSrc && portalTarget && createPortal(
        <div className="absolute inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative flex max-h-[90%] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <h3 className="text-base font-bold text-slate-900">Crop & Position Photo</h3>
              <button
                type="button"
                onClick={handleCancelCrop}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Cropper Canvas Container */}
            <div className="relative h-64 w-full bg-slate-950">
              <Cropper
                image={tempSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
                showGrid={true}
              />
            </div>

            {/* Controls Section */}
            <div className="space-y-4 p-4">
              <div className="flex items-center justify-between gap-3 px-1">
                <ZoomOut className="h-4 w-4 text-slate-500" />
                <input
                  type="range"
                  min={1}
                  max={3}
                  step={0.1}
                  value={zoom}
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="h-1.5 flex-1 cursor-pointer accent-blue-600 bg-slate-200 rounded-lg"
                />
                <ZoomIn className="h-4 w-4 text-slate-500" />
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleCancelCrop}
                  disabled={cropping}
                  className="px-4 py-2"
                >
                  {t('common.cancel')}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleSaveCrop}
                  disabled={cropping}
                  className="gap-1.5 px-5 py-2"
                >
                  <Check className="h-4 w-4" />
                  {cropping ? t('common.saving') : t('resident.applyPhoto')}
                </Button>
              </div>
            </div>
          </div>
        </div>,
        portalTarget
      )}
    </div>
  );
}
