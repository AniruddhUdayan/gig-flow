import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { fetchGigs, setSearchQuery } from '../store/gigSlice';

const Home = () => {
  const dispatch = useAppDispatch();
  const { gigs, loading, searchQuery } = useAppSelector((state) => state.gigs);
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const [localSearch, setLocalSearch] = useState(searchQuery);

  useEffect(() => {
    dispatch(fetchGigs(searchQuery));
  }, [dispatch, searchQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(setSearchQuery(localSearch));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Gigs</h1>
        <form onSubmit={handleSearch} className="flex gap-2">
          <input
            type="text"
            placeholder="Search gigs by title..."
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Search
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading gigs...</p>
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600">No gigs found. Be the first to post one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <div
              key={gig._id}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-900">{gig.title}</h3>
                <span
                  className={`px-2 py-1 text-xs rounded ${
                    gig.status === 'open'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {gig.status}
                </span>
              </div>
              <p className="text-gray-600 mb-4 line-clamp-3">{gig.description}</p>
              <div className="mb-4">
                <p className="text-2xl font-bold text-blue-600">${gig.budget}</p>
              </div>
              <div className="mb-4 text-sm text-gray-500">
                Posted by: {gig.ownerId.name}
              </div>
              {isAuthenticated && (
                <Link
                  to={`/gig/${gig._id}`}
                  className="block text-center w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  View Details
                </Link>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
