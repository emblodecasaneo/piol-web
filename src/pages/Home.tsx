import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiService } from '../api/api';
import type { Property } from '../api/api';
import { MapPin, Bed, Bath, Square, Heart, Sparkles, TrendingUp, Clock, ArrowRight, ChevronLeft, ChevronRight, GitCompare } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useCompare } from '../contexts/CompareContext';

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
  badge: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { addToCompare, isInCompare } = useCompare();
  const [properties, setProperties] = useState<Property[]>([]);
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselSlides: CarouselSlide[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920',
      title: 'Des espaces de vie accueillants',
      subtitle: 'Découvrez des propriétés qui redéfinissent votre cadre de vie',
      badge: '🏠 Bien-être & Confort'
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920',
      title: 'Votre logement idéal vous attend',
      subtitle: 'Explorez notre sélection exclusive de propriétés premium',
      badge: '✨ Sélection Premium'
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920',
      title: 'Commencer votre nouvelle vie',
      subtitle: 'Trouvez la maison parfaite pour vos rêves et votre famille',
      badge: '🌟 Nouveau Départ'
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920',
      title: 'Luxe et confort réunis',
      subtitle: 'Des propriétés d\'exception pour une vie d\'exception',
      badge: '💎 Élégance'
    }
  ];

  useEffect(() => {
    loadProperties();
  }, []);

  useEffect(() => {
    // Auto-play carousel
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const loadProperties = async () => {
    try {
      setLoading(true);
      const response = await apiService.getProperties({ limit: '10', page: '1' });
      const allProperties = response.properties || [];
      setProperties(allProperties);
      setFeaturedProperties(allProperties.slice(0, 3));
    } catch (error) {
      console.error('Error loading properties:', error);
      toast.showError('Erreur lors du chargement des propriétés');
    } finally {
      setLoading(false);
    }
  };


  const currentSlideData = carouselSlides[currentSlide];

  return (
    <Layout showHero={false}>
      {/* Animated Carousel Hero */}
      <section className="relative h-[600px] flex items-center justify-center overflow-hidden animate-fade-in">
        {/* Carousel Images */}
        {carouselSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 bg-cover bg-center transition-all duration-1000 ${
              index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
            }`}
            style={{
              backgroundImage: `url(${slide.image})`,
              transition: 'opacity 1s ease-in-out, transform 8s ease-out'
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-pulse"></div>
          </div>
        ))}

        {/* Floating Shapes */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

        {/* Content with Animated Text */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div key={currentSlide} className="text-slide-up">
            <button className="mb-6 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium hover:bg-white/30 hover:scale-105 transition-all-smooth shadow-lg border border-white/20 animate-scale-in">
              {currentSlideData.badge}
            </button>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-medium text-white mb-6 leading-tight drop-shadow-2xl text-glow">
              {currentSlideData.title}
            </h1>
            <p className="text-lg sm:text-xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed font-light animate-slide-up">
              {currentSlideData.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-scale-in">
              <button
                onClick={() => navigate('/search')}
                className="px-10 py-4 bg-primary text-white rounded-xl font-medium text-base hover:bg-primary-dark hover:scale-105 transition-all-smooth shadow-2xl hover:shadow-primary/50 flex items-center gap-2 group"
              >
                <span>Explorer maintenant</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => navigate('/search')}
                className="px-10 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl font-medium text-base border-2 border-white/40 hover:bg-white/20 hover:scale-105 transition-all-smooth shadow-xl"
              >
                Découvrir plus
              </button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all-smooth hover:scale-110 shadow-lg border border-white/20"
          aria-label="Slide précédent"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 p-3 bg-white/20 backdrop-blur-md text-white rounded-full hover:bg-white/30 transition-all-smooth hover:scale-110 shadow-lg border border-white/20"
          aria-label="Slide suivant"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 flex gap-2">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all-smooth ${
                index === currentSlide
                  ? 'w-8 bg-white shadow-lg'
                  : 'w-2 bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Aller au slide ${index + 1}`}
            />
          ))}
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
            <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
          </div>
        </div>
      </section>

      <div className="w-full px-6 py-12 animate-fade-in">
        {/* Stats Banner */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 animate-slide-down">
          <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-2xl p-6 border border-primary/20 hover:shadow-lg transition-all-smooth">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-xl font-medium text-gray-900">{properties.length}+</p>
                <p className="text-sm text-gray-600 font-light">Propriétés disponibles</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-2xl p-6 border border-blue-200/50 hover:shadow-lg transition-all-smooth">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-xl font-medium text-gray-900">24/7</p>
                <p className="text-sm text-gray-600 font-light">Support disponible</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl p-6 border border-green-200/50 hover:shadow-lg transition-all-smooth">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-xl font-medium text-gray-900">100%</p>
                <p className="text-sm text-gray-600 font-light">Satisfaction garantie</p>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Properties */}
        <section className="mb-16">
          <div className="mb-8 text-center animate-slide-up">
            <div className="inline-flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-2xl font-medium text-gray-900">Propriétés en vedette</h2>
            </div>
            <p className="text-gray-600 text-sm">Découvrez nos meilleures sélections</p>
          </div>
          
          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-primary mx-auto"></div>
              <p className="mt-4 text-gray-600">Chargement des propriétés...</p>
            </div>
          ) : featuredProperties.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.map((property, index) => (
                <div
                  key={property.id}
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all-smooth cursor-pointer overflow-hidden border border-gray-100 group card-enter hover-lift relative"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10 pointer-events-none"></div>
                  
                  {/* Image Container */}
                  <div className="relative h-64 overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Square className="w-16 h-16 text-gray-400" />
                      </div>
                    )}
                    {/* Gradient Overlay Bottom */}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent"></div>
                    
                    {/* Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="bg-primary text-white px-3 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" />
                        En vedette
                      </span>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="absolute top-3 right-3 flex gap-2 z-20">
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
                        className={`w-10 h-10 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all-smooth shadow-lg ${
                          isInCompare(property.id)
                            ? 'bg-primary text-white'
                            : 'bg-white/95 text-gray-600 hover:bg-white'
                        }`}
                        title={isInCompare(property.id) ? 'Déjà dans la comparaison' : 'Ajouter à la comparaison'}
                      >
                        <GitCompare className={`w-5 h-5 ${isInCompare(property.id) ? 'text-white' : ''}`} />
                      </button>
                      {/* Favorite Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle favorite
                        }}
                        className="w-10 h-10 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all-smooth shadow-lg"
                      >
                        <Heart className="w-5 h-5 text-gray-600 group-hover:text-primary transition-colors" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 relative z-10 bg-white">
                    <h3 className="font-medium text-base text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-smooth">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mb-4">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      <span className="line-clamp-1">{property.address}</span>
                    </div>
                    <p className="text-2xl font-medium text-primary mb-4">
                      {property.price.toLocaleString()} <span className="text-sm text-gray-600 font-light">FCFA/mois</span>
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
                          <Bed className="w-4 h-4 text-primary" />
                          <span className="font-medium">{property.bedrooms}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
                          <Bath className="w-4 h-4 text-primary" />
                          <span className="font-medium">{property.bathrooms}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-50 rounded-lg">
                          <Square className="w-4 h-4 text-primary" />
                          <span className="font-medium">{property.area} m²</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* View More Button */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2 text-primary font-medium text-sm group-hover:gap-3 transition-all-smooth">
                        <span>Voir les détails</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
              <Square className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Aucune propriété disponible</p>
              <p className="text-gray-500 text-sm mt-2">Revenez plus tard pour découvrir nos nouvelles propriétés</p>
            </div>
          )}
        </section>

        {/* Recent Properties */}
        {properties.length > featuredProperties.length && (
          <section className="animate-slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="mb-8 text-center">
              <div className="inline-flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-medium text-gray-900">Ajoutées récemment</h2>
              </div>
              <p className="text-gray-600 text-sm">Les dernières propriétés disponibles</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {properties.slice(3, 6).map((property, index) => (
                <div
                  key={property.id}
                  onClick={() => navigate(`/properties/${property.id}`)}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-all-smooth cursor-pointer overflow-hidden border border-gray-100 group card-enter hover-lift relative"
                  style={{ animationDelay: `${index * 0.1 + 0.5}s` }}
                >
                  {/* New Badge */}
                  <div className="absolute top-3 left-3 z-20">
                    <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      Nouveau
                    </span>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="absolute top-3 right-3 flex gap-2 z-20">
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
                      className={`w-9 h-9 backdrop-blur-sm rounded-full flex items-center justify-center hover:scale-110 transition-all-smooth shadow-lg ${
                        isInCompare(property.id)
                          ? 'bg-primary text-white'
                          : 'bg-white/95 text-gray-600 hover:bg-white'
                      }`}
                      title={isInCompare(property.id) ? 'Déjà dans la comparaison' : 'Ajouter à la comparaison'}
                    >
                      <GitCompare className={`w-4 h-4 ${isInCompare(property.id) ? 'text-white' : ''}`} />
                    </button>
                  </div>
                  
                  <div className="relative h-56 overflow-hidden">
                    {property.images && property.images.length > 0 ? (
                      <img
                        src={property.images[0]}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        <Square className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/30 to-transparent"></div>
                  </div>
                  <div className="p-5 relative z-10 bg-white">
                    <h3 className="font-medium text-base text-gray-900 mb-2 line-clamp-1 group-hover:text-primary transition-smooth">
                      {property.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-600 text-xs mb-3">
                      <MapPin className="w-3 h-3 text-gray-400" />
                      <span className="line-clamp-1">{property.address}</span>
                    </div>
                    <p className="text-2xl font-medium text-primary mb-3">
                      {property.price.toLocaleString()} <span className="text-xs text-gray-600 font-light">FCFA/mois</span>
                    </p>
                    <div className="flex items-center gap-3 text-xs text-gray-600 pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        <Bed className="w-3 h-3 text-primary" />
                        <span className="font-medium">{property.bedrooms} ch.</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Bath className="w-3 h-3 text-primary" />
                        <span className="font-medium">{property.bathrooms} s.b.</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Square className="w-3 h-3 text-primary" />
                        <span className="font-medium">{property.area} m²</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}

