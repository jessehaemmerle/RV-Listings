import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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

const CreateListing = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vehicle_type: '',
    make: '',
    model: '',
    year: new Date().getFullYear(),
    price: '',
    mileage: '',
    location: {
      address: '',
      latitude: '',
      longitude: ''
    },
    specifications: {
      length: '',
      width: '',
      height: '',
      weight: '',
      sleeps: '',
      fuel_type: '',
      transmission: ''
    }
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Redirect if not logged in
  React.useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleImageUpload = (files) => {
    const fileArray = Array.from(files);
    
    if (images.length + fileArray.length > 5) {
      setError('Maximaal 5 Bilder erlaubt');
      return;
    }

    fileArray.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Bilder müssen kleiner als 5MB sein');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target.result.split(',')[1];
        setImages(prev => [...prev, {
          name: file.name,
          data: base64,
          preview: e.target.result
        }]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = (e) => {
    handleImageUpload(e.target.files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageUpload(e.dataTransfer.files);
    }
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFormData(prev => ({
            ...prev,
            location: {
              ...prev.location,
              latitude: position.coords.latitude.toString(),
              longitude: position.coords.longitude.toString()
            }
          }));
        },
        (error) => {
          console.error('Standort konnte nicht ermittelt werden:', error);
        }
      );
    }
  };

  const validateForm = () => {
    if (!formData.title.trim()) return 'Titel ist erforderlich';
    if (!formData.description.trim()) return 'Beschreibung ist erforderlich';
    if (!formData.vehicle_type) return 'Fahrzeugtyp ist erforderlich';
    if (!formData.make.trim()) return 'Marke ist erforderlich';
    if (!formData.model.trim()) return 'Modell ist erforderlich';
    if (!formData.year || formData.year < 1900 || formData.year > new Date().getFullYear() + 1) {
      return 'Gültiges Baujahr ist erforderlich';
    }
    if (!formData.price || formData.price <= 0) return 'Gültiger Preis ist erforderlich';
    if (!formData.location.address.trim()) return 'Standortadresse ist erforderlich';
    
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);

    try {
      const listingData = {
        ...formData,
        price: parseFloat(formData.price),
        year: parseInt(formData.year),
        mileage: formData.mileage ? parseInt(formData.mileage) : 0,
        images: images.map(img => img.data),
        location: {
          ...formData.location,
          latitude: formData.location.latitude ? parseFloat(formData.location.latitude) : null,
          longitude: formData.location.longitude ? parseFloat(formData.location.longitude) : null,
        },
        specifications: {
          ...formData.specifications,
          length: formData.specifications.length ? parseFloat(formData.specifications.length) : null,
          width: formData.specifications.width ? parseFloat(formData.specifications.width) : null,
          height: formData.specifications.height ? parseFloat(formData.specifications.height) : null,
          weight: formData.specifications.weight ? parseFloat(formData.specifications.weight) : null,
          sleeps: formData.specifications.sleeps ? parseInt(formData.specifications.sleeps) : null,
        }
      };

      await axios.post(`${API}/listings`, listingData);
      navigate('/my-listings');
    } catch (error) {
      setError(error.response?.data?.detail || 'Fehler beim Erstellen der Anzeige');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{t('createListing.title')}</h1>
        <p className="mt-2 text-gray-600">Erstellen Sie eine neue Anzeige für Ihr Wohnmobil</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Grundlegende Informationen */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Grundlegende Informationen</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.title')} *
              </label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleInputChange}
                placeholder={t('createListing.form.titlePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.description')} *
              </label>
              <textarea
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('createListing.form.descriptionPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.vehicleType')} *
              </label>
              <select
                name="vehicle_type"
                required
                value={formData.vehicle_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('createListing.form.selectType')}</option>
                <option value="caravan">{t('listings.filters.caravan')}</option>
                <option value="motorhome">{t('listings.filters.motorhome')}</option>
                <option value="camper_van">{t('listings.filters.camperVan')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preis ({t('common.currency')}) *
              </label>
              <input
                type="number"
                name="price"
                required
                min="0"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.make')} *
              </label>
              <input
                type="text"
                name="make"
                required
                value={formData.make}
                onChange={handleInputChange}
                placeholder={t('createListing.form.makePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.model')} *
              </label>
              <input
                type="text"
                name="model"
                required
                value={formData.model}
                onChange={handleInputChange}
                placeholder={t('createListing.form.modelPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.year')} *
              </label>
              <input
                type="number"
                name="year"
                required
                min="1900"
                max={new Date().getFullYear() + 1}
                value={formData.year}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.mileage')} ({t('common.km')})
              </label>
              <input
                type="number"
                name="mileage"
                min="0"
                value={formData.mileage}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Standort */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('createListing.form.location')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adresse *
              </label>
              <input
                type="text"
                name="location.address"
                required
                value={formData.location.address}
                onChange={handleInputChange}
                placeholder="z.B. München, Deutschland"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                GPS-Koordinaten
              </label>
              <button
                type="button"
                onClick={getCurrentLocation}
                className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-200"
              >
                📍 Standort ermitteln
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.latitude')}
              </label>
              <input
                type="number"
                name="location.latitude"
                step="any"
                value={formData.location.latitude}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.longitude')}
              </label>
              <input
                type="number"
                name="location.longitude"
                step="any"
                value={formData.location.longitude}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Technische Daten */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('createListing.form.specifications.title')}</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.specifications.length')}
              </label>
              <input
                type="number"
                name="specifications.length"
                step="0.1"
                min="0"
                value={formData.specifications.length}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.specifications.width')}
              </label>
              <input
                type="number"
                name="specifications.width"
                step="0.1"
                min="0"
                value={formData.specifications.width}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.specifications.height')}
              </label>
              <input
                type="number"
                name="specifications.height"
                step="0.1"
                min="0"
                value={formData.specifications.height}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.specifications.weight')}
              </label>
              <input
                type="number"
                name="specifications.weight"
                min="0"
                value={formData.specifications.weight}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.specifications.sleeps')}
              </label>
              <input
                type="number"
                name="specifications.sleeps"
                min="1"
                max="12"
                value={formData.specifications.sleeps}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.specifications.fuel')}
              </label>
              <select
                name="specifications.fuel_type"
                value={formData.specifications.fuel_type}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Kraftstofftyp wählen</option>
                <option value="diesel">{t('specs.fuel.diesel')}</option>
                <option value="petrol">{t('specs.fuel.petrol')}</option>
                <option value="electric">{t('specs.fuel.electric')}</option>
                <option value="hybrid">{t('specs.fuel.hybrid')}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('createListing.form.specifications.transmission')}
              </label>
              <select
                name="specifications.transmission"
                value={formData.specifications.transmission}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Getriebe wählen</option>
                <option value="manual">{t('specs.transmission.manual')}</option>
                <option value="automatic">{t('specs.transmission.automatic')}</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bilder */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">{t('createListing.form.images')}</h2>
          <p className="text-sm text-gray-600 mb-4">{t('createListing.form.imageNote')}</p>
          
          {/* Drag & Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="space-y-4">
              <div className="text-4xl">📷</div>
              <div>
                <p className="text-lg font-medium">Bilder hier hinziehen oder</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
                >
                  Dateien auswählen
                </button>
              </div>
              <p className="text-sm text-gray-500">PNG, JPG bis zu 5MB • Maximal 5 Bilder</p>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Bild-Vorschau */}
          {images.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4">Hochgeladene Bilder ({images.length}/5)</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative">
                    <img
                      src={image.preview}
                      alt={`Vorschau ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Aktions-Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/my-listings')}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            {t('createListing.form.buttons.cancel')}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? t('createListing.form.buttons.publishing') : t('createListing.form.buttons.publish')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateListing;