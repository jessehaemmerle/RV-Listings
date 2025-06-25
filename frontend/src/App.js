import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './App.css';
import { TranslationProvider, useTranslation } from './translations/TranslationContext';
import { useAdConfig } from './components/AdConfig';
import { BannerAd, SidebarAd, NativeAd } from './components/GoogleAds';
import { AdConfigProvider } from './components/AdConfig';
import CreateListing from './components/CreateListing';
import MyListings from './components/MyListings';
import CookieConsent from './components/CookieConsent';
import Impressum from './components/Impressum';
import Datenschutz from './components/Datenschutz';
import AGB from './components/AGB';
import PrivacySettings from './components/PrivacySettings';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
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
      return { success: false, error: error.response?.data?.detail || 'Anmeldung fehlgeschlagen' };
    }
  };

  const register = async (userData) => {
    try {
      await axios.post(`${API}/register`, userData);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.response?.data?.detail || 'Registrierung fehlgeschlagen' };
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

// Export useAuth hook for use in other components
export { useAuth };

// Language Switcher Component
const LanguageSwitcher = () => {
  const { language, changeLanguage, availableLanguages } = useTranslation();

  return (
    <div className="flex items-center space-x-2">
      <select
        value={language}
        onChange={(e) => changeLanguage(e.target.value)}
        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
      >
        {availableLanguages.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.name}
          </option>
        ))}
      </select>
    </div>
  );
};

// Components
const Navbar = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu when clicking outside
  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2" onClick={closeMobileMenu}>
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">WM</span>
              </div>
              <span className="text-lg md:text-xl font-bold text-gray-900">{t('nav.brand')}</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/listings" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
              {t('nav.browseLisings')}
            </Link>
            {user ? (
              <>
                <Link to="/create-listing" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  {t('nav.postListing')}
                </Link>
                <Link to="/my-listings" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  {t('nav.myListings')}
                </Link>
                <Link to="/privacy" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  🔒 Datenschutz
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
                        {t('nav.logout')}
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                  {t('nav.login')}
                </Link>
                <Link to="/register" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">
                  {t('nav.register')}
                </Link>
              </>
            )}
            <LanguageSwitcher />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Hauptmenü öffnen</span>
              {!isMobileMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200 shadow-lg">
          {/* Main Navigation */}
          <Link
            to="/listings"
            className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
            onClick={closeMobileMenu}
          >
            📋 {t('nav.browseLisings')}
          </Link>

          {user ? (
            <>
              {/* Authenticated User Menu */}
              <div className="border-t border-gray-200 pt-2">
                <div className="flex items-center px-3 py-2">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {user.full_name?.charAt(0) || 'U'}
                      </span>
                    </div>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-800">{user.full_name}</div>
                    <div className="text-xs text-gray-500">{user.email}</div>
                  </div>
                </div>
              </div>

              <Link
                to="/create-listing"
                className="bg-blue-600 text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                ➕ {t('nav.postListing')}
              </Link>

              <Link
                to="/my-listings"
                className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                📄 {t('nav.myListings')}
              </Link>

              <Link
                to="/privacy"
                className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                🔒 Datenschutz
              </Link>

              <button
                onClick={() => {
                  logout();
                  closeMobileMenu();
                }}
                className="text-red-600 hover:text-red-700 hover:bg-red-50 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
              >
                🚪 {t('nav.logout')}
              </button>
            </>
          ) : (
            <>
              {/* Guest User Menu */}
              <Link
                to="/login"
                className="text-gray-700 hover:text-blue-600 hover:bg-gray-50 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                🔑 {t('nav.login')}
              </Link>

              <Link
                to="/register"
                className="bg-blue-600 text-white hover:bg-blue-700 block px-3 py-2 rounded-md text-base font-medium"
                onClick={closeMobileMenu}
              >
                👤 {t('nav.register')}
              </Link>
            </>
          )}

          {/* Legal Links */}
          <div className="border-t border-gray-200 pt-2">
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Rechtliches</div>
            </div>
            <Link
              to="/impressum"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 block px-3 py-2 rounded-md text-sm"
              onClick={closeMobileMenu}
            >
              ℹ️ Impressum
            </Link>
            <Link
              to="/datenschutz"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 block px-3 py-2 rounded-md text-sm"
              onClick={closeMobileMenu}
            >
              🛡️ Datenschutz
            </Link>
            <Link
              to="/agb"
              className="text-gray-600 hover:text-gray-800 hover:bg-gray-50 block px-3 py-2 rounded-md text-sm"
              onClick={closeMobileMenu}
            >
              📜 AGB
            </Link>
          </div>

          {/* Language Switcher */}
          <div className="border-t border-gray-200 pt-2">
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">Sprache</div>
              <div className="mt-2">
                <LanguageSwitcher />
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const Hero = () => {
  const { t } = useTranslation();
  
  return (
    <div className="relative h-96 bg-gray-900">
      <img
        src="https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7"
        alt="Wohnmobil Abenteuer"
        className="w-full h-full object-cover opacity-70"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">{t('hero.title')}</h1>
          <p className="text-xl md:text-2xl mb-8">{t('hero.subtitle')}</p>
          <Link
            to="/listings"
            className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition duration-300"
          >
            {t('hero.browseButton')}
          </Link>
        </div>
      </div>
    </div>
  );
};

const Home = () => {
  const { t } = useTranslation();
  const { shouldShowAd, getAdSlot } = useAdConfig();
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
      
      {/* Banner Ad after Hero */}
      {shouldShowAd('homepage', 'banner') && (
        <BannerAd adSlot={getAdSlot('banner')} className="container mx-auto px-4" />
      )}
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('home.mainTitle')}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                {t('home.description')}
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total_listings || 0}</div>
                <div className="text-gray-600">{t('home.stats.activeListings')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{stats.total_users || 0}</div>
                <div className="text-gray-600">{t('home.stats.registeredUsers')}</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">24/7</div>
                <div className="text-gray-600">{t('home.stats.supportAvailable')}</div>
              </div>
            </div>

            {/* Native Ad between stats and features */}
            {shouldShowAd('homepage', 'native') && (
              <div className="mb-16">
                <NativeAd 
                  adSlot={getAdSlot('native')} 
                  title="Empfohlene Wohnmobil-Services"
                />
              </div>
            )}

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('home.features.locationSearch.title')}</h3>
                <p className="text-gray-600">{t('home.features.locationSearch.description')}</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('home.features.advancedFilters.title')}</h3>
                <p className="text-gray-600">{t('home.features.advancedFilters.description')}</p>
              </div>
              
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">{t('home.features.directContact.title')}</h3>
                <p className="text-gray-600">{t('home.features.directContact.description')}</p>
              </div>
            </div>
          </div>

          {/* Sidebar with Ad */}
          <div className="lg:col-span-1">
            {shouldShowAd('homepage', 'sidebar') && (
              <div className="sticky top-8">
                <SidebarAd adSlot={getAdSlot('sidebar')} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Login = () => {
  const { t } = useTranslation();
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('auth.login.title')}</h2>
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
              placeholder={t('auth.login.username')}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
          </div>
          <div>
            <input
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('auth.login.password')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? t('auth.login.signingIn') : t('auth.login.signIn')}
          </button>
          <div className="text-center">
            <Link to="/register" className="text-blue-600 hover:text-blue-500">
              {t('auth.login.noAccount')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const Register = () => {
  const { t } = useTranslation();
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
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">{t('auth.register.title')}</h2>
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
              placeholder={t('auth.register.fullName')}
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
            />
            <input
              type="text"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('auth.register.username')}
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            />
            <input
              type="email"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('auth.register.email')}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="tel"
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('auth.register.phone')}
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            />
            <input
              type="password"
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder={t('auth.register.password')}
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? t('auth.register.creatingAccount') : t('auth.register.register')}
          </button>
          <div className="text-center">
            <Link to="/login" className="text-blue-600 hover:text-blue-500">
              {t('auth.register.hasAccount')}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// Map Component
const MapComponent = ({ listings, userLocation, onListingClick }) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView([51.505, -0.09], 6);
    mapInstanceRef.current = map;

    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: t('map.attribution')
    }).addTo(map);

    // Add markers for listings
    listings.forEach(listing => {
      if (listing.location.latitude && listing.location.longitude) {
        const marker = L.marker([listing.location.latitude, listing.location.longitude])
          .addTo(map)
          .bindPopup(`
            <div>
              <h3 class="font-bold">${listing.title}</h3>
              <p>${t('common.currency')}${listing.price.toLocaleString()}</p>
              <button onclick="window.selectListing('${listing.id}')" class="bg-blue-600 text-white px-2 py-1 rounded text-sm mt-2">${t('map.viewDetails')}</button>
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
        .bindPopup(t('map.yourLocation'));
    }

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [listings, userLocation, t]);

  // Global function for popup button clicks
  window.selectListing = (listingId) => {
    if (onListingClick) {
      onListingClick(listingId);
    }
  };

  return <div ref={mapRef} className="w-full h-96 rounded-lg"></div>;
};

const Listings = () => {
  const { t } = useTranslation();
  const { shouldShowAd, getAdSlot, adConfig } = useAdConfig();
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

  // Function to insert ads between listings
  const getListingsWithAds = () => {
    if (!shouldShowAd('listings', 'inFeed') || !adConfig.showInFeedAds) {
      return listings.map((listing, index) => ({ type: 'listing', data: listing, key: `listing-${index}` }));
    }

    const result = [];
    let adCount = 0;
    const maxAds = adConfig.maxInFeedAds || 3;
    const frequency = adConfig.adFrequency || 4;

    listings.forEach((listing, index) => {
      result.push({ type: 'listing', data: listing, key: `listing-${index}` });

      // Insert ad after every nth listing
      if ((index + 1) % frequency === 0 && adCount < maxAds) {
        result.push({ 
          type: 'ad', 
          data: { adSlot: getAdSlot('inFeed') }, 
          key: `ad-${adCount}` 
        });
        adCount++;
      }
    });

    return result;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">{t('listings.title')}</h1>
            <button
              onClick={() => setShowMap(!showMap)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              {showMap ? t('listings.hideMap') : t('listings.showMap')}
            </button>
          </div>

          {/* Banner Ad */}
          {shouldShowAd('listings', 'banner') && (
            <BannerAd adSlot={getAdSlot('banner')} className="mb-8" />
          )}

          {/* Search Results Ad */}
          {shouldShowAd('listings', 'searchResults') && filters.search_text && (
            <SearchResultsAd adSlot={getAdSlot('searchResults')} className="mb-8" />
          )}

          {/* Filters */}
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('listings.filters.vehicleType')}</label>
                <select
                  value={filters.vehicle_type}
                  onChange={(e) => handleFilterChange('vehicle_type', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">{t('listings.filters.allTypes')}</option>
                  <option value="caravan">{t('listings.filters.caravan')}</option>
                  <option value="motorhome">{t('listings.filters.motorhome')}</option>
                  <option value="camper_van">{t('listings.filters.camperVan')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('listings.filters.minPrice')}</label>
                <input
                  type="number"
                  value={filters.min_price}
                  onChange={(e) => handleFilterChange('min_price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="€0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('listings.filters.maxPrice')}</label>
                <input
                  type="number"
                  value={filters.max_price}
                  onChange={(e) => handleFilterChange('max_price', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="€100.000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{t('listings.filters.searchText')}</label>
                <input
                  type="text"
                  value={filters.search_text}
                  onChange={(e) => handleFilterChange('search_text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder={t('listings.filters.searchPlaceholder')}
                />
              </div>
            </div>
            <div className="mt-4 flex space-x-4">
              <button
                onClick={fetchListings}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                {t('listings.filters.applyFilters')}
              </button>
              <button
                onClick={() => {
                  setFilters({ vehicle_type: '', min_price: '', max_price: '', search_text: '' });
                  fetchListings();
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400"
              >
                {t('listings.filters.clearFilters')}
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

          {/* Listings Grid with Ads */}
          {loading ? (
            <div className="text-center py-8">
              <div className="text-lg">{t('common.loading')}</div>
            </div>
          ) : listings.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-lg text-gray-600">{t('listings.noListings')}</div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {getListingsWithAds().map((item) => (
                item.type === 'listing' ? (
                  <div key={item.key} className="bg-white rounded-lg shadow-md overflow-hidden">
                    {item.data.images && item.data.images.length > 0 && (
                      <img
                        src={`data:image/jpeg;base64,${item.data.images[0]}`}
                        alt={item.data.title}
                        className="w-full h-48 object-cover"
                      />
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{item.data.title}</h3>
                      <p className="text-2xl font-bold text-blue-600 mb-2">
                        {t('common.currency')}{item.data.price.toLocaleString()}
                      </p>
                      <div className="text-sm text-gray-600 space-y-1">
                        <p>{t('listings.card.year')}: {item.data.year}</p>
                        <p>{t('listings.card.mileage')}: {item.data.mileage} {t('common.km')}</p>
                        <p>{t('listings.card.location')}: {item.data.location.address}</p>
                      </div>
                      <div className="mt-4 flex space-x-2">
                        <button
                          onClick={() => navigate(`/listings/${item.data.id}`)}
                          className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                        >
                          {t('listings.card.viewDetails')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={item.key} className="md:col-span-2">
                    <InFeedAd adSlot={item.data.adSlot} />
                  </div>
                )
              ))}
            </div>
          )}
        </div>

        {/* Sidebar with Ads */}
        <div className="lg:col-span-1">
          <div className="sticky top-8 space-y-6">
            {shouldShowAd('listings', 'sidebar') && (
              <SidebarAd adSlot={getAdSlot('sidebar')} />
            )}
            
            {/* Additional sidebar content can go here */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold mb-4">Beliebte Suchbegriffe</h3>
              <div className="flex flex-wrap gap-2">
                {['Wohnwagen', 'Wohnmobil', 'Campervan', 'Adria', 'Dethleffs', 'Hobby'].map(tag => (
                  <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Ad */}
      <MobileStickyAd show={shouldShowAd('listings', 'mobileSticky')} adSlot={getAdSlot('mobileSticky')} />
    </div>
  );
};

// Add other components (ListingDetails, CreateListing, MyListings) here with German translations...
// For brevity, I'll add a placeholder that shows the German translations are being used

const ListingDetails = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchListing();
  }, [id]);

  const fetchListing = async () => {
    try {
      const response = await axios.get(`${API}/listings/${id}`);
      setListing(response.data);
    } catch (error) {
      console.error('Failed to fetch listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactLoading(true);
    
    try {
      await axios.post(`${API}/contact-seller`, {
        listing_id: id,
        ...contactForm
      });
      setContactSuccess(true);
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">{t('common.loading')}</div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">{t('errors.notFound')}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/listings')}
        className="mb-4 text-blue-600 hover:text-blue-700"
      >
        ← {t('listingDetails.backToListings')}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images */}
        <div>
          {listing.images && listing.images.length > 0 && (
            <img
              src={`data:image/jpeg;base64,${listing.images[0]}`}
              alt={listing.title}
              className="w-full h-96 object-cover rounded-lg"
            />
          )}
        </div>

        {/* Details */}
        <div>
          <h1 className="text-3xl font-bold mb-4">{listing.title}</h1>
          <p className="text-3xl font-bold text-blue-600 mb-6">
            {t('common.currency')}{listing.price.toLocaleString()}
          </p>

          <div className="space-y-4 mb-6">
            <h2 className="text-xl font-semibold">{t('listingDetails.specifications')}</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div><strong>{t('listings.filters.vehicleType')}:</strong> {t(`listings.filters.${listing.vehicle_type}`)}</div>
              <div><strong>{t('listings.card.year')}:</strong> {listing.year}</div>
              <div><strong>{t('listings.card.mileage')}:</strong> {listing.mileage} {t('common.km')}</div>
              <div><strong>Marke:</strong> {listing.make}</div>
              <div><strong>Modell:</strong> {listing.model}</div>
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{t('listingDetails.description')}</h2>
            <p className="text-gray-700">{listing.description}</p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold mb-2">{t('listingDetails.location')}</h2>
            <p className="text-gray-700">{listing.location.address}</p>
          </div>
        </div>
      </div>

      {/* Contact Form */}
      <div className="mt-12 max-w-2xl">
        <h2 className="text-2xl font-bold mb-6">{t('listingDetails.contactForm.title')}</h2>
        
        {contactSuccess ? (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {t('listingDetails.contactForm.success')}
          </div>
        ) : (
          <form onSubmit={handleContactSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('listingDetails.contactForm.name')}
              </label>
              <input
                type="text"
                required
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('listingDetails.contactForm.email')}
              </label>
              <input
                type="email"
                required
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('listingDetails.contactForm.message')}
              </label>
              <textarea
                required
                rows={4}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder={t('listingDetails.contactForm.messagePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              type="submit"
              disabled={contactLoading}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {contactLoading ? t('listingDetails.contactForm.sending') : t('listingDetails.contactForm.sendMessage')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// Footer Component with Legal Links
const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="md:col-span-1">
            <h3 className="text-lg font-semibold mb-4">Wohnmobil-Kleinanzeigen</h3>
            <p className="text-gray-300 text-sm">
              Ihre Plattform für Wohnmobile, Wohnwagen und Campervans in Österreich.
            </p>
          </div>

          {/* Quick Links - Mobile Optimized */}
          <div className="md:col-span-1">
            <h4 className="text-md font-semibold mb-4">Schnellzugriff</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/listings" className="text-gray-300 hover:text-white flex items-center">
                  <span className="mr-2">📋</span>
                  Anzeigen durchsuchen
                </Link>
              </li>
              <li>
                <Link to="/create-listing" className="text-gray-300 hover:text-white flex items-center">
                  <span className="mr-2">➕</span>
                  Anzeige erstellen
                </Link>
              </li>
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white flex items-center">
                  <span className="mr-2">👤</span>
                  Registrieren
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal - Mobile Optimized */}
          <div className="md:col-span-1">
            <h4 className="text-md font-semibold mb-4">Rechtliches</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/impressum" className="text-gray-300 hover:text-white flex items-center">
                  <span className="mr-2">ℹ️</span>
                  Impressum
                </Link>
              </li>
              <li>
                <Link to="/datenschutz" className="text-gray-300 hover:text-white flex items-center">
                  <span className="mr-2">🛡️</span>
                  Datenschutz
                </Link>
              </li>
              <li>
                <Link to="/agb" className="text-gray-300 hover:text-white flex items-center">
                  <span className="mr-2">📜</span>
                  AGB
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-gray-300 hover:text-white flex items-center">
                  <span className="mr-2">🔒</span>
                  Privacy
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact - Mobile Optimized */}
          <div className="md:col-span-1">
            <h4 className="text-md font-semibold mb-4">Kontakt</h4>
            <div className="text-gray-300 text-sm space-y-2">
              <div className="flex items-center">
                <span className="mr-2">📧</span>
                <span>info@[ihre-domain].at</span>
              </div>
              <div className="flex items-center">
                <span className="mr-2">📞</span>
                <span>+43 [IHRE NUMMER]</span>
              </div>
              <div className="flex items-start">
                <span className="mr-2 mt-1">📍</span>
                <div>
                  <div>[IHRE ADRESSE]</div>
                  <div>[PLZ] [ORT], Österreich</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6">
          <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0">
            <p className="text-gray-400 text-sm text-center md:text-left">
              © {new Date().getFullYear()} [IHR FIRMENNAME]. Alle Rechte vorbehalten.
            </p>
            <div className="flex flex-wrap justify-center md:justify-end gap-4">
              <span className="text-gray-400 text-xs flex items-center">
                <span className="mr-1">🇦🇹</span>
                Made in Austria
              </span>
              <span className="text-gray-400 text-xs flex items-center">
                <span className="mr-1">🔒</span>
                DSGVO-konform
              </span>
              <span className="text-gray-400 text-xs flex items-center">
                <span className="mr-1">🛡️</span>
                SSL-verschlüsselt
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Quick Actions Bar */}
      <div className="md:hidden bg-gray-900 border-t border-gray-700">
        <div className="grid grid-cols-4 gap-1 p-2">
          <Link
            to="/"
            className="flex flex-col items-center py-2 px-1 text-gray-300 hover:text-white"
          >
            <span className="text-lg mb-1">🏠</span>
            <span className="text-xs">Home</span>
          </Link>
          <Link
            to="/listings"
            className="flex flex-col items-center py-2 px-1 text-gray-300 hover:text-white"
          >
            <span className="text-lg mb-1">🔍</span>
            <span className="text-xs">Suchen</span>
          </Link>
          <Link
            to="/create-listing"
            className="flex flex-col items-center py-2 px-1 text-gray-300 hover:text-white"
          >
            <span className="text-lg mb-1">➕</span>
            <span className="text-xs">Inserieren</span>
          </Link>
          <Link
            to="/privacy"
            className="flex flex-col items-center py-2 px-1 text-gray-300 hover:text-white"
          >
            <span className="text-lg mb-1">👤</span>
            <span className="text-xs">Profil</span>
          </Link>
        </div>
      </div>
    </footer>
  );
};
const CreateListingPlaceholder = () => {
  const { t } = useTranslation();
  return <CreateListing />;
};

const MyListingsPlaceholder = () => {
  const { t } = useTranslation();
  return <MyListings />;
};

const App = () => {
  return (
    <TranslationProvider>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/listings" element={<Listings />} />
              <Route path="/listings/:id" element={<ListingDetails />} />
              <Route path="/create-listing" element={<CreateListingPlaceholder />} />
              <Route path="/my-listings" element={<MyListingsPlaceholder />} />
              <Route path="/impressum" element={<Impressum />} />
              <Route path="/datenschutz" element={<Datenschutz />} />
              <Route path="/agb" element={<AGB />} />
              <Route path="/privacy" element={<PrivacySettings />} />
            </Routes>
            <Footer />
            <CookieConsent />
          </div>
        </Router>
      </AuthProvider>
    </TranslationProvider>
  );
};

export default App;