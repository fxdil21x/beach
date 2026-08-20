import { useEffect, useRef, useState, useCallback } from 'react';
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
      e.target.value = '';
      return;
    }

    setLocalError('');
    if (tempSrc) URL.revokeObjectURL(tempSrc);

    const objectUrl = URL.createObjectURL(file);
    setTempSrc(objectUrl);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    e.target.value = '';
  };

  const onCropComplete = useCallback((_croppedArea, croppedAreaPixelsParam) => {
    setCroppedAreaPixels(croppedAreaPixelsParam);
  }, []);

  const handleCancelCrop = () => {
    if (tempSrc) URL.revokeObjectURL(tempSrc);
    setTempSrc(null);
    setCroppedAreaPixels(null);
  };

  const handleSaveCrop = async () => {
    if (!tempSrc || !croppedAreaPixels) return;
    setCropping(true);
    try {
      const { file, url } = await getCroppedImg(tempSrc, croppedAreaPixels);
      if (preview) URL.revokeObjectURL(preview);
      setPreview(url);
      setTempSrc(null);
      onSelect?.(file);
    } catch {
      setLocalError(t('common.error'));
    } finally {
      setCropping(false);
    }
  };

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-gray-700">{label || t('resident.photoOptional')}</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="sr-only"
        onChange={handleFileChange}
      />

      {/* Centered Square Photo Display */}
      <div className="mb-4 flex flex-col items-center justify-center">
        {displaySrc ? (
          <div className="relative h-44 w-44 overflow-hidden rounded-2xl border-2 border-slate-200 bg-slate-100 shadow-md transition-transform hover:scale-[1.01]">
            <img
              src={displaySrc}
              alt="Photo preview"
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="flex h-44 w-44 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-blue-50/70 p-4 text-center text-sm font-medium text-blue-700 shadow-xs">
            <ImagePlus className="mb-2 h-8 w-8 text-blue-500" />
            <span>{t('resident.noPhoto')}</span>
          </div>
        )}
      </div>

      <Button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="w-full gap-2 py-3.5 text-base shadow-sm"
      >
        {hasPhoto ? <Camera className="h-5 w-5 shrink-0" /> : <ImagePlus className="h-5 w-5 shrink-0" />}
        {uploading
          ? t('common.loading')
          : hasPhoto
            ? t('resident.changePhoto')
            : t('resident.chooseFile')}
      </Button>

      {(localError || error) && (
        <p className="mt-2 text-center text-sm font-medium text-red-600">{localError || error}</p>
      )}
      {!localError && !error && success && (
        <p className="mt-2 text-center text-sm font-medium text-green-700">{success}</p>
      )}

      {/* Crop Modal Dialog */}
      {tempSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
          <div className="relative flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
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
            <div className="relative h-72 w-full bg-slate-950">
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
                  {cropping ? t('common.loading') : t('common.save')}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
