import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiService } from '../api/api';
import type { Property } from '../api/api';
import { Search as SearchIcon, MapPin, Bed, Bath, Square, Heart, Grid, List as ListIcon, ChevronDown, Home, GitCompare } from 'lucide-react';
import { useCompare } from '../contexts/CompareContext';
import { useToast } from '../contexts/ToastContext';

export default function SearchPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { addToCompare, isInCompare } = useCompare();
  const [searchQuery, setSearchQuery] = useState('');
  const [locationQuery, setLocationQuery] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filters, setFilters] = useState({
    type: '', // Type de propriété
    bedrooms: '',
    bathrooms: '',
    minPrice: '',
    maxPrice: '',
    minArea: '',
    maxArea: '',
    furnished: false,
    airConditioned: false,
    parking: false,
    security: false,
    internet: false,
    water: false,
    electricity: false,
  });
  const [sortBy, setSortBy] = useState('relevance');

  // Recherche en temps réel avec debounce pour searchQuery et locationQuery
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch();
    }, 500); // Délai de 500ms avant de lancer la recherche

    return () => clearTimeout(timer);
  }, [searchQuery, locationQuery, filters, sortBy]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      // Combiner searchQuery et locationQuery dans le paramètre search
      const searchTerms: string[] = [];
      if (searchQuery) searchTerms.push(searchQuery);
      if (locationQuery) searchTerms.push(locationQuery);
      if (searchTerms.length > 0) {
        params.search = searchTerms.join(' ');
      }
      
      // Filtres de type et caractéristiques
      if (filters.type) params.type = filters.type;
      if (filters.bedrooms) params.bedrooms = filters.bedrooms; // Backend attend 'bedrooms' pas 'minBedrooms'
      if (filters.bathrooms) params.bathrooms = filters.bathrooms; // Backend attend 'bathrooms' pas 'minBathrooms'
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minArea) params.minArea = filters.minArea;
      if (filters.maxArea) params.maxArea = filters.maxArea;
      
      // Filtres d'équipements - le backend attend des strings 'true'/'false'
      if (filters.furnished) params.furnished = 'true';
      if (filters.airConditioned) params.airConditioned = 'true';
      if (filters.parking) params.parking = 'true';
      if (filters.security) params.security = 'true';
      if (filters.internet) params.internet = 'true';
      if (filters.water) params.water = 'true';
      if (filters.electricity) params.electricity = 'true';

      // Gestion du tri
      if (sortBy === 'priceAsc') {
        params.sortBy = 'price';
        params.sortOrder = 'asc';
      } else if (sortBy === 'priceDesc') {
        params.sortBy = 'price';
        params.sortOrder = 'desc';
      } else if (sortBy === 'dateDesc') {
        params.sortBy = 'createdAt';
        params.sortOrder = 'desc';
      } else {
        // relevance par défaut
        params.sortBy = 'createdAt';
        params.sortOrder = 'desc';
      }

      // Pagination par défaut si pas de limite
      if (!params.limit) {
        params.limit = '50'; // Limite plus élevée pour avoir plus de résultats
      }

      console.log('Search params envoyés au backend:', params); // Debug pour vérifier les paramètres envoyés

      const response = await apiService.getProperties(params);
      setProperties(response.properties || []);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilters({
      type: '',
      bedrooms: '',
      bathrooms: '',
      minPrice: '',
      maxPrice: '',
      minArea: '',
      maxArea: '',
      furnished: false,
      airConditioned: false,
      parking: false,
      security: false,
      internet: false,
      water: false,
      electricity: false,
    });
    setSearchQuery('');
    setLocationQuery('');
  };

  const hasActiveFilters = 
    filters.type || 
    filters.bedrooms || 
    filters.bathrooms ||
    filters.minPrice ||
    filters.maxPrice ||
    filters.minArea ||
    filters.maxArea ||
    filters.furnished ||
    filters.airConditioned ||
    filters.parking ||
    filters.security ||
    filters.internet ||
    filters.water ||
    filters.electricity ||
    searchQuery || 
    locationQuery;

  const getPropertyTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'STUDIO': 'Studio',
      'APPARTEMENT': 'Appartement',
      'MAISON': 'Maison',
      'CHAMBRE': 'Chambre',
      'VILLA': 'Villa',
      'DUPLEX': 'Duplex',
    };
    return labels[type] || type;
  };

  const propertyTypes = [
    { id: 'STUDIO', name: 'Studio', icon: Home },
    { id: 'CHAMBRE', name: 'Chambre', icon: Bed },
    { id: 'APPARTEMENT', name: 'Appartement', icon: Home },
    { id: 'MAISON', name: 'Maison', icon: Home },
    { id: 'VILLA', name: 'Villa', icon: Home },
    { id: 'DUPLEX', name: 'Duplex', icon: Home },
  ];

  return (
    <Layout showHero={false}>
      <div className="w-full px-6 py-6">
        {/* Main Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un bien, une ville..."
              className="w-full pl-12 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-smooth"
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <aside className="w-80 flex-shrink-0 hidden lg:block">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
              {/* Filters Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Filtres</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>

              {/* Localisation */}
              <div className="mb-6">
                <label className="block text-sm font-normal text-gray-700 mb-2">Localisation</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={locationQuery}
                    onChange={(e) => setLocationQuery(e.target.value)}
                    placeholder="Ville, quartier, code postal..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-smooth"
                  />
                </div>
              </div>

              {/* Type de propriété */}
              <div className="mb-6">
                <label className="block text-sm font-normal text-gray-700 mb-3">Type de propriété</label>
                <div className="grid grid-cols-2 gap-2">
                  {propertyTypes.map((pt) => {
                    const Icon = pt.icon;
                    return (
                      <button
                        key={pt.id}
                        type="button"
                        onClick={() => setFilters({ ...filters, type: filters.type === pt.id ? '' : pt.id })}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-normal transition-all-smooth ${
                          filters.type === pt.id
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{pt.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prix */}
              <div className="mb-6">
                <label className="block text-sm font-normal text-gray-700 mb-3">Prix mensuel (FCFA)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-smooth"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-smooth"
                  />
                </div>
              </div>

              {/* Nombre de pièces */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Nombre de pièces</label>
                <div className="grid grid-cols-5 gap-2">
                  {['1', '2', '3', '4', '5+'].map((room) => (
                    <button
                      key={room}
                      type="button"
                      onClick={() => setFilters({ ...filters, bedrooms: filters.bedrooms === room ? '' : room })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.bedrooms === room
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {room}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nombre de salles de bain */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Salles de bain</label>
                <div className="grid grid-cols-5 gap-2">
                  {['1', '2', '3', '4', '5+'].map((bath) => (
                    <button
                      key={bath}
                      type="button"
                      onClick={() => setFilters({ ...filters, bathrooms: filters.bathrooms === bath ? '' : bath })}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filters.bathrooms === bath
                          ? 'bg-primary text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {bath}
                    </button>
                  ))}
                </div>
              </div>

              {/* Surface */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Surface (m²)</label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={filters.minArea}
                    onChange={(e) => setFilters({ ...filters, minArea: e.target.value })}
                    placeholder="Min"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-smooth"
                  />
                  <input
                    type="number"
                    value={filters.maxArea}
                    onChange={(e) => setFilters({ ...filters, maxArea: e.target.value })}
                    placeholder="Max"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-smooth"
                  />
                </div>
              </div>

              {/* Équipements */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">Équipements</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.furnished}
                      onChange={(e) => setFilters({ ...filters, furnished: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Meublé</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.airConditioned}
                      onChange={(e) => setFilters({ ...filters, airConditioned: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Climatisé</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.parking}
                      onChange={(e) => setFilters({ ...filters, parking: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Parking</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.security}
                      onChange={(e) => setFilters({ ...filters, security: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Sécurité</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.internet}
                      onChange={(e) => setFilters({ ...filters, internet: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Internet</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.water}
                      onChange={(e) => setFilters({ ...filters, water: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Eau courante</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={filters.electricity}
                      onChange={(e) => setFilters({ ...filters, electricity: e.target.checked })}
                      className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                    />
                    <span className="text-sm text-gray-700">Électricité</span>
                  </label>
                </div>
              </div>
            </div>
          </aside>

          {/* Right Section - Results */}
          <div className="flex-1 min-w-0">
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-medium text-gray-900 mb-1">Résultats de recherche</h2>
                <p className="text-sm text-gray-600">
                  {properties.length} bien{properties.length > 1 ? 's' : ''} trouvé{properties.length > 1 ? 's' : ''}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'grid' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded transition-colors ${
                      viewMode === 'list' ? 'bg-white text-primary shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
                {/* Sort Dropdown */}
                <div className="relative">
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm appearance-none bg-white cursor-pointer"
                  >
                    <option value="relevance">Pertinence</option>
                    <option value="price-asc">Prix croissant</option>
                    <option value="price-desc">Prix décroissant</option>
                    <option value="recent">Plus récent</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="text-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-primary mx-auto"></div>
                <p className="mt-4 text-gray-600">Recherche en cours...</p>
              </div>
            ) : properties.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {properties.map((property) => (
                  <div
                    key={property.id}
                    onClick={() => navigate(`/properties/${property.id}`)}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 group"
                  >
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden">
                      {property.images && property.images.length > 0 ? (
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                          <Square className="w-16 h-16 text-gray-400" />
                        </div>
                      )}
                      {/* Type Tag */}
                      <span className="absolute top-3 left-3 bg-primary text-white px-3 py-1 rounded-full text-xs font-semibold">
                        {getPropertyTypeLabel(property.type)}
                      </span>
                      {/* Bailleur Tag */}
                      <span className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-700 px-3 py-1 rounded-full text-xs font-medium">
                        Bailleur
                      </span>
                      {/* Action Buttons */}
                      <div className="absolute bottom-3 right-3 flex gap-2 z-10">
                        {/* Compare Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (isInCompare(property.id)) {
                              toast.showInfo('Déjà dans la comparaison');
                            } else if (addToCompare(property)) {
                              toast.showSuccess('Ajouté à la comparaison');
                            } else {
                              toast.showWarning('Maximum 3 propriétés à comparer');
                            }
                          }}
                          className={`w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all-smooth shadow-sm ${
                            isInCompare(property.id)
                              ? 'bg-primary text-white'
                              : 'bg-white/90 text-gray-600 hover:bg-white'
                          }`}
                          title={isInCompare(property.id) ? 'Déjà dans la comparaison' : 'Ajouter à la comparaison'}
                        >
                          <GitCompare className={`w-4 h-4 ${isInCompare(property.id) ? 'text-white' : ''}`} />
                        </button>
                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            // Handle favorite
                          }}
                          className="w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-colors shadow-sm"
                        >
                          <Heart className="w-4 h-4 text-gray-600" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Content */}
                    <div className="p-4">
                      <h3 className="font-medium text-base text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                        {property.title}
                      </h3>
                      <p className="text-base font-semibold text-primary mb-2">
                        {property.price.toLocaleString()} <span className="text-sm font-normal text-gray-600">FCFA/mois</span>
                      </p>
                      <div className="flex items-center gap-1 text-gray-600 text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        <span className="line-clamp-1">{property.address}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-gray-600 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          <Bed className="w-4 h-4" />
                          <span className="font-medium">{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Bath className="w-4 h-4" />
                          <span className="font-medium">{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Square className="w-4 h-4" />
                          <span className="font-medium">{property.area} m²</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                <SearchIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-600 text-lg font-medium mb-2">Aucune propriété trouvée</p>
                <p className="text-gray-500 text-sm mb-6">Essayez de modifier vos critères de recherche</p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
                >
                  Effacer les filtres
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
