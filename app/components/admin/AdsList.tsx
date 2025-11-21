'use client';

import { useEffect, useState } from 'react';
import { Ad, AD_SLOT_NAMES, VIDEO_AD_SLOTS } from '@/types/ads';
import { getAllAds, deleteAd, updateAd } from '@/lib/ad-service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface AdsListProps {
  filterMode?: 'none' | 'total' | 'active' | 'deactivated' | 'revenue';
  onUpdate?: () => void;
}

export default function AdsList({ filterMode = 'none', onUpdate }: AdsListProps) {
  const { toast } = useToast();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRevenue, setEditRevenue] = useState('');

  // Load ads
  const loadAds = async () => {
    try {
      setLoading(true);
      const fetchedAds = await getAllAds();
      setAds(fetchedAds);
      console.log('✅ Loaded ads:', fetchedAds);
    } catch (error) {
      console.error('Error loading ads:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to load ads',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAds();
  }, []);

  // Filter ads based on mode
  const getFilteredAds = () => {
    switch (filterMode) {
      case 'total':
        return ads;
      case 'active':
        return ads.filter(ad => ad.isActive);
      case 'deactivated':
        return ads.filter(ad => !ad.isActive);
      case 'revenue':
        return [...ads].sort((a, b) => b.revenue - a.revenue);
      default:
        return ads;
    }
  };

  const displayedAds = getFilteredAds();

  // Delete ad
  const handleDelete = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return;

    try {
      setDeleting(adId);
      await deleteAd(adId);
      setAds(ads.filter(ad => ad.id !== adId));
      onUpdate?.(); // Refresh stats
      toast({
        title: '✅ Success',
        description: 'Ad deleted successfully',
      });
    } catch (error) {
      console.error('Error deleting ad:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to delete ad',
        variant: 'destructive',
      });
    } finally {
      setDeleting(null);
    }
  };

  // Toggle active status
  const handleToggleActive = async (ad: Ad) => {
    try {
      await updateAd(ad.id, { isActive: !ad.isActive });
      setAds(ads.map(a => a.id === ad.id ? { ...a, isActive: !a.isActive } : a));
      onUpdate?.(); // Refresh stats
      toast({
        title: '✅ Success',
        description: `Ad ${!ad.isActive ? 'activated' : 'deactivated'}`,
      });
    } catch (error) {
      console.error('Error updating ad:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to update ad',
        variant: 'destructive',
      });
    }
  };

  // Update revenue
  const handleUpdateRevenue = async (adId: string) => {
    if (!editRevenue || isNaN(Number(editRevenue))) {
      toast({
        title: '❌ Error',
        description: 'Please enter valid revenue',
        variant: 'destructive',
      });
      return;
    }

    try {
      await updateAd(adId, { revenue: Number(editRevenue) });
      setAds(ads.map(a => a.id === adId ? { ...a, revenue: Number(editRevenue) } : a));
      setEditingId(null);
      setEditRevenue('');
      onUpdate?.(); // Refresh stats
      toast({
        title: '✅ Success',
        description: 'Revenue updated',
      });
    } catch (error) {
      console.error('Error updating revenue:', error);
      toast({
        title: '❌ Error',
        description: 'Failed to update revenue',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">⏳ Loading ads...</div>;
  }

  if (displayedAds.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-gray-500">
          📭 No ads found. {filterMode !== 'none' ? 'Try a different filter.' : 'Create one to get started!'}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">📊 Displaying {displayedAds.length} Ads</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {displayedAds.map(ad => (
            <div key={ad.id} className="border border-gray-700 rounded-lg p-4 bg-gray-900/50">
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-start">
                {/* Thumbnail */}
                <div className="md:col-span-1">
                  {ad.adType === 'image' ? (
                    <img
                      src={ad.mediaUrl}
                      alt={ad.companyName}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-24 bg-gray-800 rounded-lg flex items-center justify-center">
                      🎬 Video
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="md:col-span-2 space-y-2">
                  <p className="font-bold text-white">{ad.companyName}</p>
                  <p className="text-sm text-gray-400">
                    Slot: <span className="font-semibold text-yellow-400">{AD_SLOT_NAMES[ad.adSlot] || ad.adSlot}</span>
                    {VIDEO_AD_SLOTS.includes(ad.adSlot) && <span className="ml-2 text-red-400">🎬 VIDEO</span>}
                  </p>
                </div>

                {/* Revenue Edit */}
                <div className="md:col-span-1">
                  {editingId === ad.id ? (
                    <div className="space-y-2">
                      <input
                        type="number"
                        value={editRevenue}
                        onChange={(e) => setEditRevenue(e.target.value)}
                        placeholder="Revenue"
                        className="w-full px-2 py-1 bg-gray-800 border border-gray-600 rounded text-white text-sm"
                      />
                      <Button
                        onClick={() => handleUpdateRevenue(ad.id)}
                        className="w-full bg-green-600 hover:bg-green-700 text-white text-xs py-1"
                      >
                        Save
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => {
                        setEditingId(ad.id);
                        setEditRevenue(ad.revenue.toString());
                      }}
                      className="cursor-pointer p-2 bg-gray-800 rounded hover:bg-gray-700 transition"
                    >
                      <p className="text-sm text-gray-400">Revenue</p>
                      <p className="font-bold text-green-400">₹{ad.revenue}</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="md:col-span-1 space-y-2">
                  <Button
                    onClick={() => handleToggleActive(ad)}
                    className={`w-full text-xs py-1 ${
                      ad.isActive
                        ? 'bg-green-600 hover:bg-green-700'
                        : 'bg-gray-600 hover:bg-gray-700'
                    } text-white`}
                  >
                    {ad.isActive ? '✅ Active' : '⏸ Inactive'}
                  </Button>
                  <Button
                    onClick={() => handleDelete(ad.id)}
                    disabled={deleting === ad.id}
                    className="w-full bg-red-600 hover:bg-red-700 text-white text-xs py-1"
                  >
                    {deleting === ad.id ? '⏳ Deleting...' : '🗑️ Delete'}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
