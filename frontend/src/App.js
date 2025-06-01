import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API}/me`);
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      logout();
    }
  };

  const login = async (username, password) => {
    try {
      const response = await axios.post(`${API}/login`, { username, password });
      const { access_token } = response.data;
      setToken(access_token);
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      await fetchUser();
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Login failed' };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post(`${API}/register`, userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registration failed' };
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, token }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Components
const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">RV</span>
              </div>
              <span className="text-xl font-bold text-gray-900">RV Classifieds</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-4">
            <Link to="/listings" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              Browse Listings
            </Link>
            {user ? (
              <>
                <Link to="/create-listing" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Post Listing
                </Link>
                <Link to="/my-listings" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  My Listings
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    {user.full_name}
                    <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={logout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  Login
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  return (
    <div className="relative h-96 bg-gray-900">
      <img
        src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7"
        alt="RV Adventure"
        className="w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Find Your Perfect RV</h1>
          <p className="text-xl md:text-2xl mb-8">Caravans, Motorhomes & Camper Vans</p>
          <Link
            to="/listings"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            Browse Listings
          </Link>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const [stats, setStats] = useState({});

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  return (
    <div>
      <Hero />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Your RV Adventure Starts Here</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the perfect caravan, motorhome, or camper van for your next adventure. 
            Browse thousands of listings or post your own vehicle for sale.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total_listings || 0}</div>
            <div className="text-gray-600">Active Listings</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.total_users || 0}</div>
            <div className="text-gray-600">Registered Users</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">24/7</div>
            <div className="text-gray-600">Support Available</div>
          </div>
        </div>

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Location-Based Search</h3>
            <p className="text-gray-600">Find RVs near you with interactive maps and route planning</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Advanced Filters</h3>
            <p className="text-gray-600">Filter by vehicle type, price, year, and specifications</p>
          </div>
          
          <div className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2">Direct Contact</h3>
            <p className="text-gray-600">Contact sellers directly through our secure messaging system</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData.username, formData.password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
          )}
          <div>
            <input
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
          <div className="text-center">
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              Don't have an account? Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    phone: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await register(formData);
    if (result.success) {
      navigate('/login');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create your account</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>
          )}
          <div className="space-y-4">
            <input
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Full Name"
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
            <input
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Username"
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <input
              type="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="tel"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Phone (optional)"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <input
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? 'Creating Account...' : 'Register'}
          </button>
          <div className="text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              Already have an account? Sign in here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// Map Component
const MapComponent = ({ listings, userLocation, onListingClick }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([51.505, -0.09], 6);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add markers for listings
    listings.forEach(listing => {
      if (listing.location.latitude && listing.location.longitude) {
        const marker = L.marker([listing.location.latitude, listing.location.longitude])
          .addTo(map)
          .bindPopup(`
            <div>
              <h3 class="font-bold">${listing.title}</h3>
              <p>£${listing.price.toLocaleString()}</p>
              <button onclick="window.selectListing('${listing.id}')" class="bg-blue-600 text-white px-2 py-1 rounded text-sm mt-2">View Details</button>
            </div>
          `);
      }
    });

    // Add user location marker if available
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      const userIcon = L.divIcon({
        className: 'user-location-marker',
        html: '<div style="background-color: red; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      });
      L.marker([userLocation.latitude, userLocation.longitude], { icon: userIcon })
        .addTo(map)
        .bindPopup('Your Location');
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [listings, userLocation]);

  // Global function for popup button clicks
  window.selectListing = (listingId) => {
    if (onListingClick) {
      onListingClick(listingId);
    }
  };

  return <div ref={mapRef} className="w-full h-96 rounded-lg"></div>;
};

const Listings = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    vehicle_type: '',
    min_price: '',
    max_price: '',
    search_text: ''
  });
  const [showMap, setShowMap] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListings();
    getUserLocation();
  }, []);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  };

  const fetchListings = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.vehicle_type) params.append('vehicle_type', filters.vehicle_type);
      if (filters.min_price) params.append('min_price', filters.min_price);
      if (filters.max_price) params.append('max_price', filters.max_price);
      if (filters.search_text) params.append('search_text', filters.search_text);

      const response = await axios.get(`${API}/listings?${params}`);
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const handleListingClick = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Browse Listings</h1>
        <button
          onClick={() => setShowMap(!showMap)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          {showMap ? 'Hide Map' : 'Show Map'}
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type</label>
            <select
              value={filters.vehicle_type}
              onChange={(e) => handleFilterChange('vehicle_type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Types</option>
              <option value="caravan">Caravan</option>
              <option value="motorhome">Motorhome</option>
              <option value="camper_van">Camper Van</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Min Price</label>
            <input
              type="number"
              value={filters.min_price}
              onChange={(e) => handleFilterChange('min_price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="£0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Max Price</label>
            <input
              type="number"
              value={filters.max_price}
              onChange={(e) => handleFilterChange('max_price', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="£100,000"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
            <input
              type="text"
              value={filters.search_text}
              onChange={(e) => handleFilterChange('search_text', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Make, model, etc."
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={fetchListings}
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Map */}
      {showMap && (
        <div className="mb-8">
          <MapComponent
            listings={listings}
            userLocation={userLocation}
            onListingClick={handleListingClick}
          />
        </div>
      )}

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-8">Loading...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleListingClick(listing.id)}
            >
              {listing.images.length > 0 && (
                <img
                  src={`data:image/jpeg;base64,${listing.images[0]}`}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">£{listing.price.toLocaleString()}</p>
                <p className="text-gray-600 mb-2">{listing.year} {listing.make} {listing.model}</p>
                <p className="text-gray-500 text-sm">{listing.location.address}</p>
                <div className="mt-3">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {listing.vehicle_type.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && listings.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No listings found. Try adjusting your filters.
        </div>
      )}
    </div>
  );
};

const ListingDetail = () => {
  const { listingId } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    sender_name: '',
    sender_email: '',
    message: ''
  });
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  useEffect(() => {
    if (listing && listing.location.latitude && listing.location.longitude) {
      initializeMap();
    }
  }, [listing]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`${API}/listings/${listingId}`);
      setListing(response.data);
    } catch (error) {
      console.error('Failed to fetch listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeMap = () => {
    if (!mapRef.current || !listing) return;

    // Clear existing map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    // Initialize map
    const map = L.map(mapRef.current).setView([listing.location.latitude, listing.location.longitude], 13);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add marker for listing
    L.marker([listing.location.latitude, listing.location.longitude])
      .addTo(map)
      .bindPopup(`
        <div>
          <h3 class="font-bold">${listing.title}</h3>
          <p>${listing.location.address}</p>
        </div>
      `);

    // Get user location for route planning
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userIcon = L.divIcon({
            className: 'user-location-marker',
            html: '<div style="background-color: red; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>',
            iconSize: [16, 16],
            iconAnchor: [8, 8]
          });
          
          L.marker([position.coords.latitude, position.coords.longitude], { icon: userIcon })
            .addTo(map)
            .bindPopup('Your Location');

          // Add a simple line between user and listing
          const latlngs = [
            [position.coords.latitude, position.coords.longitude],
            [listing.location.latitude, listing.location.longitude]
          ];
          
          L.polyline(latlngs, { color: 'red', weight: 3, opacity: 0.7 }).addTo(map);
          
          // Fit map to show both points
          map.fitBounds(latlngs, { padding: [20, 20] });
        },
        (error) => {
          console.log('Location access denied');
        }
      );
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    
    try {
      const contactData = {
        ...contactForm,
        listing_id: listingId
      };
      
      await axios.post(`${API}/contact-seller`, contactData);
      setContactSuccess(true);
      setShowContactForm(false);
      setContactForm({ sender_name: '', sender_email: '', message: '' });
    } catch (error) {
      setContactError(error.response?.data?.detail || 'Failed to send message');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8 text-gray-500">Listing not found.</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {listing.images.length > 0 ? (
            <div>
              <img
                src={`data:image/jpeg;base64,${listing.images[selectedImageIndex]}`}
                alt={listing.title}
                className="w-full h-64 lg:h-96 object-cover rounded-lg mb-4"
              />
              {listing.images.length > 1 && (
                <div className="flex space-x-2 overflow-x-auto">
                  {listing.images.map((image, index) => (
                    <img
                      key={index}
                      src={`data:image/jpeg;base64,${image}`}
                      alt={`${listing.title} ${index + 1}`}
                      className={`w-20 h-20 object-cover rounded cursor-pointer ${
                        selectedImageIndex === index ? 'border-2 border-blue-500' : ''
                      }`}
                      onClick={() => setSelectedImageIndex(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 lg:h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No images available</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>
          <p className="text-4xl font-bold text-blue-600 mb-6">£{listing.price.toLocaleString()}</p>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700">Vehicle Type</h3>
              <p className="text-gray-900">{listing.vehicle_type.replace('_', ' ')}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700">Year</h3>
              <p className="text-gray-900">{listing.year}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700">Make & Model</h3>
              <p className="text-gray-900">{listing.make} {listing.model}</p>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-semibold text-gray-700">Mileage</h3>
              <p className="text-gray-900">{listing.mileage ? `${listing.mileage.toLocaleString()} miles` : 'Not specified'}</p>
            </div>
            {listing.length && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">Length</h3>
                <p className="text-gray-900">{listing.length}m</p>
              </div>
            )}
            {listing.fuel_type && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-700">Fuel Type</h3>
                <p className="text-gray-900">{listing.fuel_type}</p>
              </div>
            )}
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Description</h3>
            <p className="text-gray-900 whitespace-pre-line">{listing.description}</p>
          </div>

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-2">Location</h3>
            <p className="text-gray-900">{listing.location.address}</p>
          </div>

          {/* Contact Section */}
          <div className="border-t pt-6">
            <h3 className="font-semibold text-gray-700 mb-4">Contact Seller</h3>
            
            {contactSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Message sent successfully! The seller will receive your inquiry via email.
              </div>
            )}

            <div className="flex space-x-4">
              <button
                onClick={() => setShowContactForm(true)}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
              >
                Send Message
              </button>
              
              {listing.show_phone && listing.seller_phone && (
                <a
                  href={`tel:${listing.seller_phone}`}
                  className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700"
                >
                  Call: {listing.seller_phone}
                </a>
              )}
            </div>

            {showContactForm && (
              <div className="mt-6 bg-gray-50 p-6 rounded-lg">
                <h4 className="font-semibold mb-4">Send a Message</h4>
                {contactError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {contactError}
                  </div>
                )}
                <form onSubmit={handleContactSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Name</label>
                    <input
                      type="text"
                      required
                      value={contactForm.sender_name}
                      onChange={(e) => setContactForm({ ...contactForm, sender_name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Your Email</label>
                    <input
                      type="email"
                      required
                      value={contactForm.sender_email}
                      onChange={(e) => setContactForm({ ...contactForm, sender_email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                    <textarea
                      required
                      rows={4}
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Hi, I'm interested in your listing..."
                    />
                  </div>
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700"
                    >
                      Send Message
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowContactForm(false)}
                      className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="mt-8">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Location & Route</h3>
        <div ref={mapRef} className="w-full h-96 rounded-lg"></div>
        <p className="text-sm text-gray-600 mt-2">
          Red line shows approximate route from your location to the listing. Allow location access for route display.
        </p>
      </div>
    </div>
  );
};

const CreateListing = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    vehicle_type: '',
    make: '',
    model: '',
    year: '',
    mileage: '',
    length: '',
    fuel_type: '',
    location: {
      address: '',
      latitude: '',
      longitude: ''
    },
    images: [],
    show_phone: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    initializeMap();
  }, [user, navigate]);

  const initializeMap = () => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([54.5, -3], 6); // UK center
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Add click handler for location selection
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      
      // Remove existing marker
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      
      // Add new marker
      markerRef.current = L.marker([lat, lng]).addTo(map);
      
      // Update form data
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          latitude: lat.toFixed(6),
          longitude: lng.toFixed(6)
        }
      }));

      // Reverse geocode to get address
      fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
        .then(response => response.json())
        .then(data => {
          if (data.display_name) {
            setFormData(prev => ({
              ...prev,
              location: {
                ...prev.location,
                address: data.display_name
              }
            }));
          }
        })
        .catch(error => console.error('Geocoding error:', error));
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target.result.split(',')[1]; // Remove data:image/...;base64, prefix
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, base64]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const submitData = {
        ...formData,
        price: parseFloat(formData.price),
        year: parseInt(formData.year),
        mileage: formData.mileage ? parseInt(formData.mileage) : null,
        length: formData.length ? parseFloat(formData.length) : null,
        location: {
          address: formData.location.address,
          latitude: parseFloat(formData.location.latitude),
          longitude: parseFloat(formData.location.longitude)
        }
      };

      await axios.post(`${API}/listings`, submitData);
      setSuccess(true);
      setTimeout(() => {
        navigate('/my-listings');
      }, 2000);
    } catch (error) {
      setError(error.response?.data?.detail || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-green-100 border border-green-400 text-green-700 px-6 py-4 rounded-lg text-center">
          <h2 className="text-xl font-semibold mb-2">Listing Created Successfully!</h2>
          <p>Redirecting to your listings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Create New Listing</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="e.g., 2020 Airstream Classic Travel Trailer"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price (£) *</label>
            <input
              type="number"
              required
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="25000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Vehicle Type *</label>
            <select
              required
              value={formData.vehicle_type}
              onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select type</option>
              <option value="caravan">Caravan</option>
              <option value="motorhome">Motorhome</option>
              <option value="camper_van">Camper Van</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Year *</label>
            <input
              type="number"
              required
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="2020"
              min="1950"
              max="2025"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Make *</label>
            <input
              type="text"
              required
              value={formData.make}
              onChange={(e) => setFormData({ ...formData, make: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Airstream"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Model *</label>
            <input
              type="text"
              required
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Classic"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mileage</label>
            <input
              type="number"
              value={formData.mileage}
              onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="50000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Length (meters)</label>
            <input
              type="number"
              step="0.1"
              value={formData.length}
              onChange={(e) => setFormData({ ...formData, length: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="7.5"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Fuel Type</label>
            <select
              value={formData.fuel_type}
              onChange={(e) => setFormData({ ...formData, fuel_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select fuel type</option>
              <option value="diesel">Diesel</option>
              <option value="petrol">Petrol</option>
              <option value="hybrid">Hybrid</option>
              <option value="electric">Electric</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
          <textarea
            required
            rows={6}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="Describe your vehicle, its condition, features, and any additional information..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          {formData.images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={`data:image/jpeg;base64,${image}`}
                    alt={`Upload ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
          <input
            type="text"
            value={formData.location.address}
            onChange={(e) => setFormData({ 
              ...formData, 
              location: { ...formData.location, address: e.target.value }
            })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
            placeholder="Click on the map to set location or enter address manually"
          />
          <div ref={mapRef} className="w-full h-64 rounded-lg border"></div>
          <p className="text-sm text-gray-600 mt-2">Click on the map to select your location</p>
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="show_phone"
            checked={formData.show_phone}
            onChange={(e) => setFormData({ ...formData, show_phone: e.target.checked })}
            className="mr-2"
          />
          <label htmlFor="show_phone" className="text-sm text-gray-700">
            Show my phone number to potential buyers
          </label>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Creating Listing...' : 'Create Listing'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/listings')}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-md hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

const MyListings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchMyListings();
  }, [user, navigate]);

  const fetchMyListings = async () => {
    try {
      const response = await axios.get(`${API}/my-listings`);
      setListings(response.data);
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleListingClick = (listingId) => {
    navigate(`/listings/${listingId}`);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
        <Link
          to="/create-listing"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          Create New Listing
        </Link>
      </div>

      {listings.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-500 mb-4">You haven't created any listings yet.</div>
          <Link
            to="/create-listing"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Create Your First Listing
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing.id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleListingClick(listing.id)}
            >
              {listing.images.length > 0 && (
                <img
                  src={`data:image/jpeg;base64,${listing.images[0]}`}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{listing.title}</h3>
                <p className="text-2xl font-bold text-blue-600 mb-2">£{listing.price.toLocaleString()}</p>
                <p className="text-gray-600 mb-2">{listing.year} {listing.make} {listing.model}</p>
                <p className="text-gray-500 text-sm mb-3">{listing.location.address}</p>
                <div className="flex justify-between items-center">
                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                    {listing.vehicle_type.replace('_', ' ')}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    listing.is_active 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {listing.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/listings" element={<Listings />} />
            <Route path="/listings/:listingId" element={<ListingDetail />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/my-listings" element={<MyListings />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
