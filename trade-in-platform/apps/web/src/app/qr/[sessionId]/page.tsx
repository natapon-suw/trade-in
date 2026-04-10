'use client';

import { useCallback, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import { uploadMobilePhoto, ApiError } from '../../../lib/api';

export default function QRPhotoCapturePage() {
  const params = useParams();
  const sessionId = params.sessionId as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [successCount, setSuccessCount] = useState(0);
  const [lastThumbnail, setLastThumbnail] = useState<string | null>(null);
  const [sessionExpired, setSessionExpired] = useState(false);

  const handleCapture = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setUploading(true);
      setError('');

      // Show local thumbnail preview
      const reader = new FileReader();
      reader.onload = (ev) => setLastThumbnail(ev.target?.result as string);
      reader.readAsDataURL(file);

      try {
        await uploadMobilePhoto(sessionId, file);
        setSuccessCount((c) => c + 1);
      } catch (err) {
        if (err instanceof ApiError && (err.status === 410 || err.status === 404)) {
          setSessionExpired(true);
          setError('This QR session has expired. Please generate a new QR code from the admin panel.');
        } else {
          setError(err instanceof Error ? err.message : 'Upload failed');
        }
        setLastThumbnail(null);
      } finally {
        setUploading(false);
        // Reset input so the same file can be re-selected
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    },
    [sessionId],
  );

  const openCamera = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-gray-50 px-4 py-8">
      <div className="w-full max-w-sm">
        <h1 className="mb-2 text-center text-xl font-bold text-gray-900">
          📸 Photo Capture
        </h1>
        <p className="mb-6 text-center text-sm text-gray-500">
          Take photos of the device for assessment
        </p>

        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {successCount > 0 && !error && (
          <div className="mb-4 rounded-md bg-green-50 p-3 text-center text-sm text-green-700">
            ✓ {successCount} photo{successCount > 1 ? 's' : ''} uploaded successfully
          </div>
        )}

        {/* Thumbnail Preview */}
        {lastThumbnail && (
          <div className="mb-4 overflow-hidden rounded-lg border border-gray-200">
            <img
              src={lastThumbnail}
              alt="Last captured photo"
              className="h-48 w-full object-cover"
            />
          </div>
        )}

        {/* Hidden file input with camera capture */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleCapture}
          className="hidden"
        />

        {/* Main capture button */}
        {!sessionExpired && (
          <button
            onClick={openCamera}
            disabled={uploading}
            className="w-full rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {uploading
              ? 'Uploading…'
              : successCount > 0
                ? 'Take Another Photo'
                : 'Take Photo'}
          </button>
        )}

        {sessionExpired && (
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-center">
            <p className="text-sm font-medium text-yellow-800">Session Expired</p>
            <p className="mt-1 text-xs text-yellow-600">
              Please scan a new QR code from the admin panel.
            </p>
          </div>
        )}

        <p className="mt-4 text-center text-xs text-gray-400">
          Session: {sessionId.slice(0, 8)}…
        </p>
      </div>
    </div>
  );
}
