import { useEffect, useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchGigById, clearCurrentGig } from '../store/gigSlice';
import { addNotification } from '../store/notificationSlice';
import { bidsAPI } from '../services/api';
import type { Bid } from '../types';

const GigDetails = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { currentGig, loading } = useAppSelector((state) => state.gigs);
  const { user } = useAppSelector((state) => state.auth);

  const [bidFormData, setBidFormData] = useState({ message: '', price: '' });
  const [bids, setBids] = useState<Bid[]>([]);
  const [loadingBids, setLoadingBids] = useState(false);
  const [submittingBid, setSubmittingBid] = useState(false);

  const isOwner = currentGig?.ownerId._id === user?.id;

  useEffect(() => {
    if (id) {
      dispatch(fetchGigById(id));
    }
    return () => {
      dispatch(clearCurrentGig());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (currentGig && isOwner) {
      loadBids();
    }
  }, [currentGig, isOwner]);

  const loadBids = async () => {
    if (!id) return;
    try {
      setLoadingBids(true);
      const response = await bidsAPI.getBidsByGig(id);
      setBids(response.data);
    } catch (error: any) {
      console.error('Failed to load bids:', error);
    } finally {
      setLoadingBids(false);
    }
  };

  const handleBidSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) return;

    try {
      setSubmittingBid(true);
      await bidsAPI.createBid({
        gigId: id,
        message: bidFormData.message,
        price: Number(bidFormData.price),
      });
      dispatch(addNotification({ message: 'Bid submitted successfully!', type: 'success' }));
      setBidFormData({ message: '', price: '' });
    } catch (error: any) {
      dispatch(
        addNotification({
          message: error.response?.data?.message || 'Failed to submit bid',
          type: 'error',
        })
      );
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleHire = async (bidId: string) => {
    if (!window.confirm('Are you sure you want to hire this freelancer?')) return;

    try {
      const response = await bidsAPI.hireBid(bidId);

      // Emit Socket.io event for real-time notification
      const socket = (window as any).socket;
      if (socket) {
        socket.emit('hire', {
          freelancerId: response.data.freelancerId.toString(),
          gigTitle: response.data.gigTitle,
        });
      }

      dispatch(addNotification({ message: 'Freelancer hired successfully!', type: 'success' }));
      loadBids();
      dispatch(fetchGigById(id!));
    } catch (error: any) {
      dispatch(
        addNotification({
          message: error.response?.data?.message || 'Failed to hire freelancer',
          type: 'error',
        })
      );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  if (!currentGig) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Gig not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-start mb-4">
          <h1 className="text-3xl font-bold text-gray-900">{currentGig.title}</h1>
          <span
            className={`px-3 py-1 text-sm rounded ${
              currentGig.status === 'open'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {currentGig.status}
          </span>
        </div>
        <p className="text-gray-700 mb-6 whitespace-pre-wrap">{currentGig.description}</p>
        <div className="mb-4">
          <p className="text-3xl font-bold text-blue-600">${currentGig.budget}</p>
        </div>
        <div className="text-sm text-gray-500">
          Posted by: {currentGig.ownerId.name} ({currentGig.ownerId.email})
        </div>
      </div>

      {/* Bidding Form - Only show if not owner and gig is open */}
      {!isOwner && currentGig.status === 'open' && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Submit Your Bid</h2>
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Your Proposal
              </label>
              <textarea
                id="message"
                name="message"
                required
                rows={4}
                value={bidFormData.message}
                onChange={(e) => setBidFormData({ ...bidFormData, message: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Explain why you're the best fit for this job"
              />
            </div>
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Your Price ($)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                required
                min="0"
                step="0.01"
                value={bidFormData.price}
                onChange={(e) => setBidFormData({ ...bidFormData, price: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your price"
              />
            </div>
            <button
              type="submit"
              disabled={submittingBid}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium disabled:opacity-50"
            >
              {submittingBid ? 'Submitting...' : 'Submit Bid'}
            </button>
          </form>
        </div>
      )}

      {/* Bids List - Only show if owner */}
      {isOwner && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Bids Received</h2>
          {loadingBids ? (
            <p className="text-gray-600">Loading bids...</p>
          ) : bids.length === 0 ? (
            <p className="text-gray-600">No bids received yet.</p>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div key={bid._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{bid.freelancerId.name}</p>
                      <p className="text-sm text-gray-500">{bid.freelancerId.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">${bid.price}</p>
                      <span
                        className={`inline-block mt-1 px-2 py-1 text-xs rounded ${
                          bid.status === 'hired'
                            ? 'bg-green-100 text-green-800'
                            : bid.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {bid.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{bid.message}</p>
                  {bid.status === 'pending' && currentGig.status === 'open' && (
                    <button
                      onClick={() => handleHire(bid._id)}
                      className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium"
                    >
                      Hire
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default GigDetails;
