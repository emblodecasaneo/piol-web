import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiService } from '../api/api';
import type { Property } from '../api/api';
import { ArrowLeft, Heart, MapPin, Phone, Mail, Bed, Bath, Square, Car, Wifi, Shield, Eye, Star, Navigation, Map as MapIcon, X, ZoomIn, ChevronLeft, ChevronRight, GitCompare } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';
import { useCompare } from '../contexts/CompareContext';
import BudgetCalculator from '../components/BudgetCalculator';
import NeighborhoodScoreCard from '../components/NeighborhoodScoreCard';

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { isAuthenticated } = useAuth();
  const { addToCompare, isInCompare } = useCompare();
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);

  useEffect(() => {
    if (id) {
      loadProperty();
    }
  }, [id]);

  useEffect(() => {
    if (property?.agent?.id) {
      loadReviews();
    }
  }, [property?.agent?.id]);

  // Navigation clavier pour le modal d'images
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (selectedImageIndex === null || !property?.images) return;
      
      if (e.key === 'Escape') {
        setSelectedImageIndex(null);
        setZoomLevel(1);
      } else if (e.key === 'ArrowLeft' && property.images.length > 1) {
        setSelectedImageIndex((prev) => 
          prev !== null ? (prev - 1 + property.images!.length) % property.images!.length : 0
        );
        setZoomLevel(1);
      } else if (e.key === 'ArrowRight' && property.images.length > 1) {
        setSelectedImageIndex((prev) => 
          prev !== null ? (prev + 1) % property.images!.length : 0
        );
        setZoomLevel(1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImageIndex, property?.images]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProperty(id!);
      setProperty(response.property);
      
      // Vérifier si en favori
      const favorite = await apiService.isFavorite(id!);
      setIsFavorite(favorite);
    } catch (error) {
      console.error('Error loading property:', error);
      toast.showError('Erreur lors du chargement de la propriété');
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async () => {
    if (!property?.agent?.id) return;
    
    try {
      setReviewsLoading(true);
      // TODO: Implémenter getAgentReviews dans apiService si nécessaire
      // const response = await apiService.getAgentReviews(property.agent.id, 1, 5);
      // setReviews(response.reviews || []);
      setReviews([]);
    } catch (error) {
      console.error('Error loading reviews:', error);
    } finally {
      setReviewsLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!property) return;
    
    try {
      await apiService.toggleFavorite(property.id);
      setIsFavorite(!isFavorite);
      toast.showSuccess(isFavorite ? 'Favori retiré' : 'Ajouté aux favoris');
    } catch (error) {
      console.error('Error toggling favorite:', error);
      toast.showError('Erreur lors de la modification du favori');
    }
  };

  const handleContactAgent = () => {
    if (!property?.agent?.user?.id) {
      toast.showError('Impossible de contacter l\'agent pour cette propriété');
      return;
    }
    
    // Vérifier si l'utilisateur est connecté
    if (!isAuthenticated) {
      toast.showWarning('Vous devez créer un compte pour contacter le propriétaire');
      navigate('/register', { state: { returnTo: `/properties/${id}`, message: 'Créez un compte pour contacter le propriétaire' } });
      return;
    }
    
    // Naviguer vers Messages avec les informations du bailleur pour ouvrir automatiquement la conversation
    navigate('/messages', { 
      state: { 
        agentId: property.agent.user.id,
        propertyId: property.id,
        propertyTitle: property.title,
        propertyImages: property.images,
        agentInfo: {
          id: property.agent.user.id,
          firstName: property.agent.user.firstName || '',
          lastName: property.agent.user.lastName || '',
          avatar: property.agent.user.avatar,
          businessName: property.agent.businessName,
          isVerified: property.agent.isVerified,
          phone: property.agent.user.phone
        }
      } 
    });
  };

  const getPropertyTypeLabel = (type: string) => {
    const types: { [key: string]: string } = {
      'APPARTEMENT': 'Appartement',
      'VILLA': 'Villa',
      'STUDIO': 'Studio',
      'MAISON': 'Maison',
      'CHAMBRE': 'Chambre',
      'DUPLEX': 'Duplex',
    };
    return types[type?.toUpperCase()] || type || 'Propriété';
  };

  if (loading) {
    return (
      <Layout showHero={false}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-primary"></div>
        </div>
      </Layout>
    );
  }

  if (!property) {
    return (
      <Layout showHero={false}>
        <div className="text-center py-20">
          <p className="text-gray-600 mb-4">Propriété introuvable</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all-smooth font-medium text-sm hover:shadow-lg"
          >
            Retour à l'accueil
          </button>
        </div>
      </Layout>
    );
  }

  // Accès sécurisé aux propriétés étendues (compatibilité avec mobile)
  const extendedProperty = property as any;
  const neighborhoodScore = extendedProperty?.neighborhood?.score;
  const views = extendedProperty?.views || 0;
  const favoriteCount = extendedProperty?.favoriteCount || 0;
  const reviewCount = extendedProperty?.reviewCount || 0;
  const latitude = extendedProperty?.latitude;
  const longitude = extendedProperty?.longitude;

  return (
    <Layout showHero={false}>
      <div className="w-full px-6 max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="mb-6 flex items-center gap-4 animate-slide-down">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100  mt-4 rounded-lg transition-all-smooth hover:scale-105"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 mt-4">
            <h1 className="text-xl font-medium text-gray-900">Détails de la propriété</h1>
          </div>
          <div className="flex items-center gap-2">
            {/* Compare Button */}
            <button
              onClick={() => {
                if (!property) return;
                if (isInCompare(property.id)) {
                  toast.showInfo('Déjà dans la comparaison');
                } else if (addToCompare(property)) {
                  toast.showSuccess('Ajouté à la comparaison');
                } else {
                  toast.showWarning('Maximum 3 propriétés à comparer');
                }
              }}
              className={`p-2 rounded-lg transition-all-smooth hover:scale-110 ${
                property && isInCompare(property.id)
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
              title={property && isInCompare(property.id) ? 'Déjà dans la comparaison' : 'Ajouter à la comparaison'}
            >
              <GitCompare className={`w-5 h-5 ${property && isInCompare(property.id) ? 'text-white' : 'text-gray-400 hover:text-primary'}`} />
            </button>
            {/* Favorite Button */}
            <button
              onClick={handleToggleFavorite}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all-smooth hover:scale-110"
            >
              <Heart className={`w-6 h-6 transition-all-smooth ${isFavorite ? 'fill-red-500 text-red-500 animate-pulse' : 'text-gray-400 hover:text-red-500'}`} />
            </button>
          </div>
        </div>

        {/* Images Gallery */}
        {property.images && property.images.length > 0 && (
          <div className="mb-8 animate-slide-up">
            {property.images.length === 1 ? (
              <div 
                className="relative group overflow-hidden rounded-2xl shadow-xl cursor-zoom-in"
                onClick={() => setSelectedImageIndex(0)}
              >
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-full rounded-2xl object-cover h-[400px] group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-5 h-5" />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2" style={{ gridAutoRows: 'minmax(0, auto)' }}>
                {/* Grande image à gauche */}
                <div 
                  className="md:col-span-2 md:row-span-2 h-[400px] group overflow-hidden rounded-2xl shadow-xl relative cursor-zoom-in"
                  onClick={() => setSelectedImageIndex(0)}
                  style={{ minHeight: '400px' }}
                >
                  <img
                    src={property.images[0]}
                    alt={`${property.title} - Image 1`}
                    className="w-full h-full rounded-2xl object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  <div className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <ZoomIn className="w-5 h-5" />
                  </div>
                  {property.images.length > 1 && (
                    <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      +{property.images.length - 1} photos
                    </div>
                  )}
                </div>
                {/* Deux images plus petites à droite */}
                {property.images.slice(1, 3).map((image, index) => (
                  <div 
                    key={index + 1} 
                    className="h-[calc((400px-16px)/2)] group overflow-hidden rounded-2xl shadow-lg relative cursor-zoom-in"
                    onClick={() => setSelectedImageIndex(index + 1)}
                    style={{ minHeight: 'calc((400px - 16px) / 2)' }}
                  >
                    <img
                      src={image}
                      alt={`${property.title} - Image ${index + 2}`}
                      className="w-full h-full rounded-2xl object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                    <div className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <ZoomIn className="w-4 h-4" />
                    </div>
                  </div>
                ))}
                {/* Si plus de 3 images, ajouter une grille supplémentaire */}
                {property.images.length > 3 && (
                  <div className="md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                    {property.images.slice(3).map((image, index) => (
                      <div 
                        key={index + 3} 
                        className="h-48 group overflow-hidden rounded-xl shadow-md relative cursor-zoom-in"
                        onClick={() => setSelectedImageIndex(index + 3)}
                      >
                        <img
                          src={image}
                          alt={`${property.title} - Image ${index + 4}`}
                          className="w-full h-full rounded-xl object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
                        <div className="absolute top-2 right-2 bg-black/50 text-white p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <ZoomIn className="w-3 h-3" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Image Zoom Modal */}
        {selectedImageIndex !== null && property.images && (
          <div 
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 animate-fade-in"
            onClick={() => {
              setSelectedImageIndex(null);
              setZoomLevel(1);
            }}
          >
            <button
              onClick={() => {
                setSelectedImageIndex(null);
                setZoomLevel(1);
              }}
              className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition-colors z-10"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            {/* Previous Button */}
            {property.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => 
                    prev !== null ? (prev - 1 + property.images!.length) % property.images!.length : 0
                  );
                  setZoomLevel(1);
                }}
                className="absolute left-4 text-white p-3 rounded-full hover:bg-white/20 transition-colors z-10"
                aria-label="Image précédente"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}

            {/* Next Button */}
            {property.images.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImageIndex((prev) => 
                    prev !== null ? (prev + 1) % property.images!.length : 0
                  );
                  setZoomLevel(1);
                }}
                className="absolute right-4 text-white p-3 rounded-full hover:bg-white/20 transition-colors z-10"
                aria-label="Image suivante"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}

            {/* Zoomed Image */}
            <div 
              className="max-w-7xl max-h-[90vh] overflow-auto cursor-zoom-out"
              onClick={(e) => e.stopPropagation()}
              onWheel={(e) => {
                e.preventDefault();
                setZoomLevel((prev) => {
                  const newZoom = prev + (e.deltaY > 0 ? -0.1 : 0.1);
                  return Math.max(1, Math.min(3, newZoom));
                });
              }}
            >
              <img
                src={property.images[selectedImageIndex]}
                alt={`${property.title} - Image ${selectedImageIndex + 1}`}
                className="w-full h-auto rounded-lg transition-transform duration-300"
                style={{ transform: `scale(${zoomLevel})` }}
              />
            </div>

            {/* Zoom Controls */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md rounded-full px-4 py-2 flex items-center gap-4 z-10">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((prev) => Math.max(1, prev - 0.25));
                }}
                className="text-white p-1 rounded hover:bg-white/20 transition-colors"
                aria-label="Zoom arrière"
              >
                <ZoomIn className="w-4 h-4 rotate-180" />
              </button>
              <span className="text-white text-sm font-medium min-w-[3rem] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomLevel((prev) => Math.min(3, prev + 0.25));
                }}
                className="text-white p-1 rounded hover:bg-white/20 transition-colors"
                aria-label="Zoom avant"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Image Counter */}
            {property.images.length > 1 && (
              <div className="absolute bottom-4 right-4 bg-white/10 backdrop-blur-md text-white px-3 py-1 rounded-full text-sm font-medium z-10">
                {selectedImageIndex + 1} / {property.images.length}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Header Block - Titre, Prix et Infos principales */}
            <div className="animate-slide-up bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="inline-block mb-3">
                    <span className="bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-medium">
                      {getPropertyTypeLabel(property.type)}
                    </span>
                  </div>
                  <h1 className="text-2xl font-medium text-gray-900 mb-4">{property.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 mb-3">
                    <div className="flex items-baseline gap-2">
                      <p className="text-3xl font-medium text-primary">
                        {property.price.toLocaleString()}
                      </p>
                      <span className="text-base text-gray-600 font-normal">FCFA/mois</span>
                    </div>
                    {property.deposit && property.deposit > 0 && (
                      <div className="text-gray-600 text-sm bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                        Caution: {property.deposit.toLocaleString()} FCFA
                      </div>
                    )}
                  </div>
                </div>
                {/* Stats rapides */}
                {(views > 0 || favoriteCount > 0) && (
                  <div className="flex flex-col gap-2 text-right">
                    {views > 0 && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Eye className="w-4 h-4" />
                        <span>{views} vues</span>
                      </div>
                    )}
                    {favoriteCount > 0 && (
                      <div className="flex items-center gap-2 text-gray-600 text-sm">
                        <Heart className="w-4 h-4" />
                        <span>{favoriteCount} favoris</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Localisation */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all-smooth animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-medium text-gray-900">Localisation</h2>
              </div>
              <p className="text-gray-900 font-medium mb-1">{property.address}</p>
              <p className="text-gray-600 text-sm">
                {property.neighborhood?.name || ''}
                {property.locality ? ` (${property.locality.name})` : ''}, {property.city?.name || ''}
              </p>
              
              {/* Boutons Points d'intérêt et Itinéraire */}
              {latitude && longitude && (
                <div className="flex gap-3 mt-4">
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
                      window.open(url, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition font-medium text-sm"
                  >
                    <MapIcon className="w-4 h-4" />
                    Lieux proches
                  </button>
                  <button
                    onClick={() => {
                      const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
                      window.open(url, '_blank');
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-primary rounded-lg hover:bg-gray-200 transition font-medium text-sm border border-gray-200"
                  >
                    <Navigation className="w-4 h-4" />
                    Itinéraire
                  </button>
                </div>
              )}
            </div>

            {/* Caractéristiques */}
            <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all-smooth animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Square className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-lg font-medium text-gray-900">Caractéristiques</h2>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl border border-primary/20 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Square className="w-6 h-6 text-primary" />
                  </div>
                  <span className="text-2xl font-medium text-gray-900">{getPropertyTypeLabel(property.type)}</span>
                  <span className="text-xs text-gray-600 font-light">Type</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl border border-blue-200/50 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    <Bed className="w-6 h-6 text-blue-600" />
                  </div>
                  <span className="text-2xl font-medium text-gray-900">{property.bedrooms}</span>
                  <span className="text-xs text-gray-600 font-light">Chambres</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-xl border border-purple-200/50 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                    <Bath className="w-6 h-6 text-purple-600" />
                  </div>
                  <span className="text-2xl font-medium text-gray-900">{property.bathrooms}</span>
                  <span className="text-xs text-gray-600 font-light">Salles de bain</span>
                </div>
                <div className="flex flex-col items-center gap-2 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-xl border border-green-200/50 hover:scale-105 transition-transform">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                    <Square className="w-6 h-6 text-green-600" />
                  </div>
                  <span className="text-2xl font-medium text-gray-900">{property.area}</span>
                  <span className="text-xs text-gray-600 font-light">m²</span>
                </div>
              </div>
            </div>

            {/* Description */}
            {property.description && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all-smooth animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Square className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">Description</h2>
                </div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{property.description}</p>
              </div>
            )}

            {/* Équipements */}
            {(property.furnished || property.airConditioned || property.parking || 
              property.security || property.internet || property.water || property.electricity) && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all-smooth animate-slide-up" style={{ animationDelay: '0.4s' }}>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-primary" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">Équipements</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {property.furnished && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl border border-green-200/50 hover:scale-105 transition-transform">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">Meublé</span>
                    </div>
                  )}
                  {property.airConditioned && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200/50 hover:scale-105 transition-transform">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">Climatisé</span>
                    </div>
                  )}
                  {property.parking && (
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20 hover:scale-105 transition-transform">
                      <Car className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-gray-700">Parking</span>
                    </div>
                  )}
                  {property.security && (
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20 hover:scale-105 transition-transform">
                      <Shield className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-gray-700">Sécurité</span>
                    </div>
                  )}
                  {property.internet && (
                    <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl border border-primary/20 hover:scale-105 transition-transform">
                      <Wifi className="w-4 h-4 text-primary" />
                      <span className="text-sm font-medium text-gray-700">Internet</span>
                    </div>
                  )}
                  {property.water && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200/50 hover:scale-105 transition-transform">
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">Eau courante</span>
                    </div>
                  )}
                  {property.electricity && (
                    <div className="flex items-center gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200/50 hover:scale-105 transition-transform">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-gray-700">Électricité</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Score du Quartier */}
            {neighborhoodScore && (
              <NeighborhoodScoreCard
                score={neighborhoodScore}
                neighborhoodName={property.neighborhood?.name || 'Quartier'}
                cityName={property.city?.name}
              />
            )}

            {/* Calculateur de Budget */}
            <BudgetCalculator
              propertyPrice={property.price}
              deposit={property.deposit}
              fees={extendedProperty?.fees}
              estimatedTransportCost={neighborhoodScore?.transportCost}
            />


            {/* Avis */}
            {property.agent && (
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 hover:shadow-lg transition-all-smooth animate-slide-up" style={{ animationDelay: '0.5s' }}>
                <div className="flex items-center gap-2 mb-6">
                  <div className="w-10 h-10 rounded-xl bg-yellow-50 flex items-center justify-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  </div>
                  <h2 className="text-lg font-medium text-gray-900">
                    Avis sur l'agent <span className="text-primary">({reviewCount || 0})</span>
                  </h2>
                </div>

                {reviewsLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-primary mx-auto"></div>
                    <p className="text-sm text-gray-600 mt-2">Chargement des avis...</p>
                  </div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-4">
                    {reviews.slice(0, 5).map((review, index) => (
                      <div key={review.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors animate-slide-up" style={{ animationDelay: `${0.6 + index * 0.1}s` }}>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                            <span className="text-primary font-medium text-sm">
                              {review.user?.firstName?.[0] || 'A'}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900 text-sm">
                            {review.user?.firstName} {review.user?.lastName}
                          </span>
                        </div>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 transition-all ${
                                star <= Math.round(review.rating)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-100">
                    <Star className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-600 text-sm">Aucun avis pour le moment</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 animate-slide-up" style={{ animationDelay: '0.5s' }}>
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-lg border border-gray-100 p-6 sticky top-24 hover:shadow-xl transition-all-smooth">
              <div className="mb-6">
                <h3 className="text-xl font-medium text-gray-900 mb-1">Contacter l'agent</h3>
                <p className="text-sm text-gray-600 font-light">Contactez directement</p>
              </div>
              {property.agent && (
                <div className="mb-6 p-4 bg-white rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {property.agent.user?.avatar ? (
                        <img src={property.agent.user.avatar} alt="Agent" className="w-12 h-12 rounded-full object-cover" />
                      ) : (
                        <span className="text-primary font-medium text-lg">
                          {property.agent.user?.firstName?.[0] || 'A'}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {property.agent.businessName || 
                         `${property.agent.user?.firstName || ''} ${property.agent.user?.lastName || ''}`.trim() || 
                         'Agent'}
                      </p>
                      {property.agent.isVerified && (
                        <span className="inline-flex items-center gap-1 text-xs text-primary font-medium">
                          <Shield className="w-3 h-3" />
                          Vérifié
                        </span>
                      )}
                    </div>
                  </div>
                  {property.agent.user?.phone && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-primary" />
                      {property.agent.user.phone}
                    </p>
                  )}
                </div>
              )}
              <div className="space-y-3">
                {property.agent?.user?.phone && (
                  <a
                    href={`tel:${property.agent.user.phone}`}
                    className="block w-full bg-primary text-white py-3 rounded-xl font-medium text-sm hover:bg-primary-dark transition-all-smooth flex items-center justify-center gap-2 hover:shadow-xl hover:scale-105 group"
                  >
                    <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    Appeler maintenant
                  </a>
                )}
                <button
                  onClick={handleContactAgent}
                  className="w-full bg-gradient-to-r from-gray-50 to-gray-100 text-gray-900 py-3 rounded-xl font-medium text-sm hover:from-gray-100 hover:to-gray-200 transition-all-smooth flex items-center justify-center gap-2 hover:scale-105 border border-gray-200 group"
                >
                  <Mail className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Envoyer un message
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
