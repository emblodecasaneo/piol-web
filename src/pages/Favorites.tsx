import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiService } from '../api/api';
import type { Property } from '../api/api';
import { Heart, MapPin, Bed, Bath, Square } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function FavoritesPage() {
  const navigate = useNavigate();
  const toast = useToast();
  const [favorites, setFavorites] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const favs = await apiService.getFavorites();
      setFavorites(favs);
    } catch (error) {
      console.error('Error loading favorites:', error);
      toast.showError('Erreur lors du chargement des favoris');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async (propertyId: string) => {
    try {
      await apiService.toggleFavorite(propertyId);
      await loadFavorites();
      toast.showSuccess('Favori retiré');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.showError('Erreur lors de la modification du favori');
    }
  };

  return (
    <Layout showHero={false}>
      <div className="w-full px-6">
        <div className="mb-8">
          <h1 className="text-xl font-medium text-gray-900 mb-2">Mes favoris</h1>
          <p className="text-gray-600 text-sm">Vos propriétés favorites</p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Chargement...</p>
          </div>
        ) : favorites.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((property) => (
              <div
                key={property.id}
                onClick={() => navigate(`/properties/${property.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden border border-gray-100 group relative"
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleFavorite(property.id);
                  }}
                  className="absolute top-3 right-3 z-10 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full p-2 shadow-sm hover:bg-white transition-colors"
                >
                  <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                </button>
                
                <div className="relative h-64 overflow-hidden">
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
                </div>
                
                <div className="p-5">
                  <h3 className="font-medium text-base text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                    {property.title}
                  </h3>
                  <div className="flex items-center gap-2 text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="line-clamp-1">{property.address}</span>
                  </div>
                  <p className="text-2xl font-bold text-primary mb-4">
                    {property.price.toLocaleString()} <span className="text-sm text-gray-600 font-normal">FCFA/mois</span>
                  </p>
                  <div className="flex items-center gap-4 pt-4 border-t border-gray-100 text-sm text-gray-600">
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
            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg font-medium mb-2">Aucun favori pour le moment</p>
            <p className="text-gray-500 text-sm mb-6">Commencez à ajouter des propriétés à vos favoris</p>
            <button
              onClick={() => navigate('/search')}
              className="px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium"
            >
              Rechercher des propriétés
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}


