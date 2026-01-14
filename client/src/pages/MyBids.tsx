import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bidsAPI } from '../services/api';
import type { Bid } from '../types';

const MyBids = () => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    try {
      setLoading(true);
      const response = await bidsAPI.getMyBids();
      setBids(response.data);
    } catch (error) {
      console.error('Failed to load bids:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your bids...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bids</h1>

      {bids.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-8 text-center">
          <p className="text-gray-600 mb-4">You haven't submitted any bids yet.</p>
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Browse Gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div key={bid._id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <Link
                    to={`/gig/${bid.gigId._id}`}
                    className="text-xl font-semibold text-blue-600 hover:text-blue-700"
                  >
                    {bid.gigId.title}
                  </Link>
                  {bid.gigId.budget && (
                    <p className="text-gray-600 mt-1">Budget: ${bid.gigId.budget}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-blue-600">${bid.price}</p>
                  <span
                    className={`inline-block mt-2 px-3 py-1 text-sm rounded ${
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
              <div className="mb-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Your Proposal:</p>
                <p className="text-gray-600">{bid.message}</p>
              </div>
              <div className="text-xs text-gray-500">
                Submitted on {new Date(bid.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBids;
