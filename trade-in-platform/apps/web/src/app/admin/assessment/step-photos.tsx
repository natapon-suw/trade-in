'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  uploadPhotos,
  generateQRSession,
  type AssessmentPhoto,
  type QRSession,
} from '../../../lib/api';

interface StepPhotosProps {
  assessmentId: string;
  onContinue: () => void;
}

export function StepPhotos({ assessmentId, onContinue }: StepPhotosProps) {
  const [photos, setPhotos] = useState<AssessmentPhoto[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [qrSession, setQrSession] = useState<QRSession | null>(null);
  const [qrLoading, setQrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<ReturnType<typeof import('socket.io-client').io> | null>(null);

  // WebSocket connection for real-time photo updates
  const connectSocket = useCallback(
    (sessionId: string) => {
      import('socket.io-client').then(({ io }) => {
        const baseUrl =
          process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') ?? '';
        const socket = io(`${baseUrl}/api/v1/admin/photo-sync`, {
          transports: ['websocket', 'polling'],
        });

        socket.on('connect', () => {
          socket.emit('join-session', { assessmentId });
        });

        socket.on('photo-uploaded', (data: { photo: AssessmentPhoto }) => {
          setPhotos((prev) => {
            if (prev.some((p) => p.id === data.photo.id)) return prev;
            return [...prev, data.photo];
          });
        });

        socket.on('session-expired', () => {
          setQrSession(null);
        });

        socketRef.current = socket;
      });
    },
    [assessmentId],
  );

  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
    };
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const uploaded = await uploadPhotos(assessmentId, files);
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith('image/'),
    );
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const uploaded = await uploadPhotos(assessmentId, files);
      setPhotos((prev) => [...prev, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleGenerateQR = async () => {
    setQrLoading(true);
    setError('');
    try {
      const session = await generateQRSession(assessmentId);
      setQrSession(session);
      connectSocket(session.sessionId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate QR');
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">
        Step 5: Upload Photos
      </h2>

      {/* Drop zone */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center rounded-md border-2 border-dashed border-gray-300 p-8 text-center hover:border-blue-400"
      >
        <p className="text-sm text-gray-600">
          Drag & drop images here, or{' '}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 underline"
          >
            browse files
          </button>
        </p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        {uploading && (
          <p className="mt-2 text-sm text-gray-500">Uploading...</p>
        )}
      </div>

      {/* QR Code section */}
      <div className="rounded-md border border-gray-200 p-4">
        {!qrSession ? (
          <button
            type="button"
            onClick={handleGenerateQR}
            disabled={qrLoading}
            className="rounded-md border border-gray-300 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-50"
          >
            {qrLoading ? 'Generating...' : '📱 Use Phone Camera'}
          </button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="text-sm text-gray-600">
              Scan this QR code with your phone to upload photos
            </p>
            <img
              src={qrSession.qrCodeDataUrl}
              alt="QR Code for mobile photo upload"
              className="h-48 w-48"
            />
            <p className="text-xs text-gray-400">
              Expires: {new Date(qrSession.expiresAt).toLocaleTimeString()}
            </p>
          </div>
        )}
      </div>

      {/* Photo grid */}
      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className="relative aspect-square overflow-hidden rounded-md border border-gray-200"
            >
              <img
                src={photo.url}
                alt="Assessment photo"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-1 right-1 rounded bg-black/50 px-1.5 py-0.5 text-[10px] text-white">
                {photo.uploadedVia}
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="button"
        onClick={onContinue}
        disabled={photos.length === 0}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:opacity-50"
      >
        Continue ({photos.length} photo{photos.length !== 1 ? 's' : ''})
      </button>
    </div>
  );
}
