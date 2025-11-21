'use client';

import { useState } from 'react';
import { AdSlot, AD_SLOT_NAMES } from '@/types/ads';
import {
  uploadAdFile,
  createAd,
} from '@/lib/ad-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import AdSlotSelector from './AdSlotSelector';

interface AdUploadFormProps {
  onSuccess?: () => void;
}

export default function AdUploadForm({ onSuccess }: AdUploadFormProps) {
  const { toast } = useToast();
  const [selectedSlot, setSelectedSlot] = useState<AdSlot | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [revenue, setRevenue] = useState('');
  const [adType, setAdType] = useState<'image' | 'video'>('image');
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState('');

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreview(e.target?.result as string);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedSlot) {
      toast({ title: '❌ Error', description: 'Please select an ad slot', variant: 'destructive' });
      return;
    }
    if (!companyName.trim()) {
      toast({ title: '❌ Error', description: 'Please enter company name', variant: 'destructive' });
      return;
    }
    if (!redirectUrl.trim()) {
      toast({ title: '❌ Error', description: 'Please enter redirect URL', variant: 'destructive' });
      return;
    }
    if (!revenue || isNaN(Number(revenue))) {
      toast({ title: '❌ Error', description: 'Please enter valid revenue amount', variant: 'destructive' });
      return;
    }
    if (!file) {
      toast({ title: '❌ Error', description: 'Please select a file to upload', variant: 'destructive' });
      return;
    }

    try {
      setLoading(true);

      // Step 1: Upload file to Firebase Storage
      console.log('📤 Uploading file to Firebase Storage...');
      const mediaUrl = await uploadAdFile(file, selectedSlot, companyName);

      // Step 2: Create ad document in Firestore
      console.log('💾 Creating ad record in Firestore...');
      const adId = await createAd(
        companyName,
        selectedSlot,
        adType,
        mediaUrl,
        redirectUrl,
        Number(revenue)
      );

      toast({
        title: '✅ Success',
        description: `Ad uploaded successfully! ID: ${adId}`,
      });

      // Reset form
      setSelectedSlot(null);
      setCompanyName('');
      setRedirectUrl('');
      setRevenue('');
      setFile(null);
      setPreview('');
      setAdType('image');

      // Call onSuccess callback to refresh parent stats
      onSuccess?.();
    } catch (error) {
      console.error('Error uploading ad:', error);
      toast({
        title: '❌ Error',
        description: error instanceof Error ? error.message : 'Failed to upload ad',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* SLOT SELECTOR */}
      <AdSlotSelector selectedSlot={selectedSlot} onSelectSlot={setSelectedSlot} />

      {/* UPLOAD FORM */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">📝 Ad Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Company Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Company Name *
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g., Myntra, Amazon, Pepsi"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Redirect URL */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Redirect URL *
              </label>
              <input
                type="url"
                value={redirectUrl}
                onChange={(e) => setRedirectUrl(e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Revenue */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Revenue (₹) *
              </label>
              <input
                type="number"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
                placeholder="5000"
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500"
              />
            </div>

            {/* Ad Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Ad Type *
              </label>
              <select
                value={adType}
                onChange={(e) => setAdType(e.target.value as 'image' | 'video')}
                className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-yellow-500"
              >
                <option value="image">📸 Image</option>
                <option value="video">🎬 Video</option>
              </select>
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">
                Upload {adType === 'image' ? 'Image' : 'Video'} *
              </label>
              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center cursor-pointer hover:border-yellow-500 transition">
                <input
                  type="file"
                  accept={adType === 'image' ? 'image/*' : 'video/*'}
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-input"
                />
                <label htmlFor="file-input" className="cursor-pointer block">
                  {file ? (
                    <p className="text-sm text-green-400">✅ {file.name}</p>
                  ) : (
                    <div>
                      <p className="text-2xl mb-2">{adType === 'image' ? '🖼️' : '🎥'}</p>
                      <p className="text-gray-400 text-sm">Click to upload {adType}</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* PREVIEW */}
            {preview && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Preview</label>
                {adType === 'image' ? (
                  <img src={preview} alt="Preview" className="max-h-48 rounded-lg" />
                ) : (
                  <video src={preview} className="max-h-48 rounded-lg" controls />
                )}
              </div>
            )}

            {/* SUBMIT BUTTON */}
            <Button
              type="submit"
              disabled={loading || !selectedSlot}
              className="w-full bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 rounded-lg"
            >
              {loading ? '⏳ Uploading...' : '✅ Upload Ad'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
