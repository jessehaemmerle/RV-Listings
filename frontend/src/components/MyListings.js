import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTranslation } from '../translations/TranslationContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Auth Context Hook (replicated here for component use)
const AuthContext = React.createContext();

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    // Fallback: try to get user info from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      return { 
        user: { id: 'user', full_name: 'User' }, // Basic user info
        token 
      };
    }
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const MyListings = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(null);

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyListings();
  }, [user, navigate]);

  const fetchMyListings = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/my-listings`);
      setListings(response.data);
    } catch (error) {
      setError('Fehler beim Laden der Anzeigen');
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (listingId) => {
    if (!window.confirm(t('myListings.confirmDelete'))) {
      return;
    }

    setDeleteLoading(listingId);
    try {
      await axios.delete(`${API}/listings/${listingId}`);
      setListings(prev => prev.filter(listing => listing.id !== listingId));
    } catch (error) {
      setError('Fehler beim Löschen der Anzeige');
      console.error('Failed to delete listing:', error);
    } finally {
      setDeleteLoading(null);
    }
  };

  const getStatusBadge = (listing) => {
    // Simple status logic - can be enhanced based on backend status field
    const isActive = true; // You can add a status field to your backend model
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? t('myListings.active') : t('myListings.inactive')}
      </span>
    );
  };

  if (!user) return null;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <div className="text-lg">{t('common.loading')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{t('myListings.title')}</h1>
          <p className="mt-2 text-gray-600">
            Verwalten Sie Ihre Wohnmobil-Anzeigen
          </p>
        </div>
        <Link
          to="/create-listing"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 flex items-center space-x-2"
        >
          <span>+</span>
          <span>Neue Anzeige erstellen</span>
        </Link>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Listings */}
      {listings.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {t('myListings.noListings')}
          </h3>
          <p className="text-gray-600 mb-6">
            {t('myListings.createFirst')}
          </p>
          <Link
            to="/create-listing"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700"
          >
            Erste Anzeige erstellen
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-white rounded-lg shadow-md overflow-hidden">
              <div className="md:flex">
                {/* Bild */}
                <div className="md:w-48 md:flex-shrink-0">
                  {listing.images && listing.images.length > 0 ? (
                    <img
                      src={`data:image/jpeg;base64,${listing.images[0]}`}
                      alt={listing.title}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 md:h-full bg-gray-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* Inhalt */}
                <div className="flex-1 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">
                        {listing.title}
                      </h3>
                      <p className="text-2xl font-bold text-blue-600 mb-2">
                        {t('common.currency')}{listing.price?.toLocaleString()}
                      </p>
                    </div>
                    {getStatusBadge(listing)}
                  </div>

                  <div className="text-sm text-gray-600 space-y-1 mb-4">
                    <p><strong>Typ:</strong> {t(`listings.filters.${listing.vehicle_type}`)}</p>
                    <p><strong>Marke:</strong> {listing.make} {listing.model}</p>
                    <p><strong>{t('listings.card.year')}:</strong> {listing.year}</p>
                    {listing.mileage && (
                      <p><strong>{t('listings.card.mileage')}:</strong> {listing.mileage} {t('common.km')}</p>
                    )}
                    <p><strong>{t('listings.card.location')}:</strong> {listing.location?.address}</p>
                  </div>

                  <p className="text-gray-700 mb-4 line-clamp-2">
                    {listing.description}
                  </p>

                  {/* Aktionen */}
                  <div className="flex flex-wrap gap-3">
                    <Link
                      to={`/listings/${listing.id}`}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700"
                    >
                      {t('listings.card.viewDetails')}
                    </Link>
                    
                    <Link
                      to={`/edit-listing/${listing.id}`}
                      className="bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-700"
                    >
                      {t('myListings.edit')}
                    </Link>
                    
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={deleteLoading === listing.id}
                      className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                    >
                      {deleteLoading === listing.id ? t('myListings.deleting') : t('myListings.delete')}
                    </button>

                    {/* Statistiken (könnten später hinzugefügt werden) */}
                    <div className="flex items-center space-x-4 text-sm text-gray-500 ml-auto">
                      <span>👁 0 Aufrufe</span>
                      <span>💬 0 Anfragen</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Statistiken Footer */}
      {listings.length > 0 && (
        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Übersicht</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">{listings.length}</div>
              <div className="text-sm text-gray-600">Aktive Anzeigen</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">0</div>
              <div className="text-sm text-gray-600">Gesamt Aufrufe</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">0</div>
              <div className="text-sm text-gray-600">Anfragen</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {t('common.currency')}{listings.reduce((total, listing) => total + (listing.price || 0), 0).toLocaleString()}
              </div>
              <div className="text-sm text-gray-600">Gesamtwert</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyListings;