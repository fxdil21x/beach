import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Camera, ImagePlus } from 'lucide-react';
import Button from '../ui/Button.jsx';

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

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const displaySrc = preview || existingUrl;
  const hasPhoto = Boolean(displaySrc);

  const handleChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setLocalError(t('resident.invalidPhoto'));
      e.target.value = '';
      return;
    }

    setLocalError('');
    if (preview) URL.revokeObjectURL(preview);
    setPreview(URL.createObjectURL(file));
    onSelect?.(file);
    e.target.value = '';
  };

  return (
    <div>
      <p className="mb-2 text-sm font-medium text-gray-700">{label || t('resident.photoOptional')}</p>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/jpg,image/webp"
        className="sr-only"
        onChange={handleChange}
      />

      {displaySrc ? (
        <img
          src={displaySrc}
          alt=""
          className="mb-3 h-40 w-full rounded-xl object-cover"
        />
      ) : (
        <div className="mb-3 flex h-40 w-full items-center justify-center rounded-xl border-2 border-dashed border-blue-200 bg-blue-50 text-sm font-medium text-blue-700">
          {t('resident.noPhoto')}
        </div>
      )}

      <Button
        type="button"
        disabled={uploading}
        onClick={() => fileInputRef.current?.click()}
        className="w-full gap-2 py-3.5 text-base"
      >
        {hasPhoto ? <Camera className="h-5 w-5 shrink-0" /> : <ImagePlus className="h-5 w-5 shrink-0" />}
        {uploading
          ? t('common.loading')
          : hasPhoto
            ? t('resident.changePhoto')
            : t('resident.chooseFile')}
      </Button>

      {(localError || error) && (
        <p className="mt-2 text-sm text-red-600">{localError || error}</p>
      )}
      {!localError && !error && success && (
        <p className="mt-2 text-sm text-green-700">{success}</p>
      )}
    </div>
  );
}
