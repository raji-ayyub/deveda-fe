'use client';

import React, { useRef, useState } from 'react';
import { ImagePlus, Loader2, Trash2, UploadCloud } from 'lucide-react';

import { api } from '@/lib/api';

interface CloudinaryUploadFieldProps {
  label: string;
  assetType: 'profile' | 'course';
  value: string;
  publicId?: string;
  suggestedPublicId?: string;
  helperText?: string;
  onChange: (value: { url: string; publicId: string }) => void;
}

const CloudinaryUploadField: React.FC<CloudinaryUploadFieldProps> = ({
  label,
  assetType,
  value,
  publicId,
  suggestedPublicId,
  helperText,
  onChange,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setError('');

    try {
      setUploading(true);
      const signature = await api.createUploadSignature(assetType, suggestedPublicId || publicId);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', signature.data.apiKey);
      formData.append('timestamp', String(signature.data.timestamp));
      formData.append('signature', signature.data.signature);
      formData.append('folder', signature.data.folder);
      if (signature.data.publicId) {
        formData.append('public_id', signature.data.publicId);
      }

      const uploadResponse = await fetch(`https://api.cloudinary.com/v1_1/${signature.data.cloudName}/image/upload`, {
        method: 'POST',
        body: formData,
      });
      const uploadPayload = await uploadResponse.json();

      if (!uploadResponse.ok || !uploadPayload.secure_url || !uploadPayload.public_id) {
        throw new Error(uploadPayload.error?.message || 'Upload failed');
      }

      onChange({
        url: uploadPayload.secure_url,
        publicId: uploadPayload.public_id,
      });
    } catch (uploadError: any) {
      setError(uploadError.message || 'Unable to upload image right now.');
    } finally {
      setUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">{label}</label>
      <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
        {value ? (
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="h-28 w-full overflow-hidden rounded-2xl bg-slate-200 sm:w-40">
              <img src={value} alt={label} className="h-full w-full object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900">Image ready</p>
              <p className="mt-1 break-all text-xs text-slate-500">{value}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => onChange({ url: '', publicId: '' })}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-700"
                >
                  <Trash2 className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="flex w-full flex-col items-center justify-center rounded-[20px] border border-dashed border-slate-300 bg-white px-6 py-10 text-center transition hover:border-blue-400 hover:bg-blue-50 disabled:opacity-60"
          >
            {uploading ? <Loader2 className="h-8 w-8 animate-spin text-blue-600" /> : <ImagePlus className="h-8 w-8 text-blue-600" />}
            <span className="mt-3 text-sm font-semibold text-slate-900">{uploading ? 'Uploading image...' : 'Upload image'}</span>
            <span className="mt-1 text-xs text-slate-500">{helperText || 'PNG, JPG, or WEBP from your device'}</span>
          </button>
        )}

        <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
      </div>
    </div>
  );
};

export default CloudinaryUploadField;
