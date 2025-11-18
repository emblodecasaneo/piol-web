import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { useCompare } from '../contexts/CompareContext';
import { 
  ArrowLeft, 
  Trash2, 
  Trophy, 
  X, 
  Bed, 
  Bath, 
  Square, 
  MapPin, 
  Home,
  DollarSign,
  Shield,
  Car,
  Wifi,
  CheckCircle,
  XCircle,
  Star,
  ArrowRight,
  GitCompare
} from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function ComparePage() {
  const navigate = useNavigate();
  const toast = useToast();
  const { selectedProperties, removeFromCompare, clearCompare } = useCompare();

  // Analyse du meilleur rapport qualité/prix
  const bestValue = useMemo(() => {
    if (selectedProperties.length === 0) return null;

    return selectedProperties.map(prop => {
      const totalCost = prop.price + (prop.deposit || prop.price * 2) + (prop.fees || 0);
      const score = (
        (prop.bedrooms * 20) +
        (prop.bathrooms * 15) +
        (prop.area * 0.5) +
        (prop.furnished ? 10 : 0) +
        (prop.airConditioned ? 10 : 0) +
        (prop.parking ? 5 : 0) +
        (prop.security ? 10 : 0) +
        (prop.internet ? 5 : 0) +
        ((prop.neighborhood?.score?.overall || 0) * 10)
      );
      
      const valueScore = score / (totalCost / 1000); // Score par 1000 FCFA

      return {
        id: prop.id,
        title: prop.title,
        valueScore: parseFloat(valueScore.toFixed(2)),
      };
    }).sort((a, b) => b.valueScore - a.valueScore)[0];
  }, [selectedProperties]);

  const CompareRow = ({ 
    label, 
    getValue, 
    icon: Icon 
  }: { 
    label: string; 
    getValue: (prop: any) => any; 
    icon?: any;
  }) => {
    const bestValueId = bestValue?.id;
    
    return (
      <div className="grid grid-cols-4 gap-4 py-3 border-b border-gray-100 last:border-b-0">
        <div className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        {selectedProperties.map((prop) => {
          const value = getValue(prop);
          const isBest = prop.id === bestValueId && bestValue && selectedProperties.length >= 2;
          
          return (
            <div 
              key={prop.id} 
              className={`text-center rounded-lg px-3 py-2 transition-all-smooth ${
                isBest ? 'bg-green-50 border-2 border-green-200' : 'bg-gray-50'
              }`}
            >
              <span className={`text-sm font-medium ${
                isBest ? 'text-green-700' : 'text-gray-900'
              }`}>
                {value}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  if (selectedProperties.length === 0) {
    return (
      <Layout showHero={false}>
        <div className="w-full px-6 py-12 max-w-7xl mx-auto animate-fade-in">
          <div className="flex items-center gap-4 mb-8 animate-slide-down">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all-smooth"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-medium text-gray-900">Comparer</h1>
          </div>

          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm animate-slide-up">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
              <Home className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-xl font-medium text-gray-900 mb-2">Aucune propriété à comparer</h2>
            <p className="text-gray-600 text-sm mb-4 text-center max-w-md">
              Sélectionnez 2 à 3 propriétés depuis la page d'accueil ou de recherche pour les comparer
            </p>
            <p className="text-gray-500 text-xs mb-8 text-center max-w-md flex items-center justify-center gap-2">
              <span>Cliquez sur l'icône</span>
              <GitCompare className="w-4 h-4 text-primary" />
              <span>sur les cartes de propriétés pour les ajouter à la comparaison</span>
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => navigate('/')}
                className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-all-smooth font-medium text-sm"
              >
                Retour à l'accueil
              </button>
              <button
                onClick={() => navigate('/search')}
                className="px-6 py-2.5 bg-primary text-white rounded-lg hover:bg-primary-dark transition-all-smooth font-medium text-sm"
              >
                Rechercher des propriétés
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHero={false}>
      <div className="w-full px-6 py-6 max-w-7xl mx-auto animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 animate-slide-down">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-all-smooth"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-medium text-gray-900">
              Comparaison ({selectedProperties.length})
            </h1>
          </div>
          <button
            onClick={clearCompare}
            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-all-smooth font-medium text-sm"
          >
            <Trash2 className="w-4 h-4" />
            Tout effacer
          </button>
        </div>

        {/* Meilleur rapport qualité/prix */}
        {bestValue && selectedProperties.length >= 2 && (
          <div className="mb-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl p-6 border-2 border-yellow-200 shadow-sm animate-slide-up">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-yellow-100 flex items-center justify-center">
                <Trophy className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-medium text-yellow-900 mb-1">Meilleur rapport qualité/prix</h3>
                <p className="text-sm text-yellow-800 font-medium">{bestValue.title}</p>
                <p className="text-xs text-yellow-700 mt-1">Score: {bestValue.valueScore.toFixed(2)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Images des propriétés */}
        <div className="mb-8 overflow-x-auto scrollbar-hide animate-slide-up">
          <div className="flex gap-4 pb-4" style={{ minWidth: `${selectedProperties.length * 200}px` }}>
            {selectedProperties.map((prop) => (
              <div key={prop.id} className="flex-shrink-0 w-48 relative group">
                <div className="relative h-40 rounded-xl overflow-hidden shadow-md">
                  {prop.images && prop.images.length > 0 ? (
                    <img
                      src={prop.images[0]}
                      alt={prop.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <Home className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <button
                    onClick={() => removeFromCompare(prop.id)}
                    className="absolute top-2 right-2 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white hover:scale-110 transition-all-smooth shadow-lg opacity-0 group-hover:opacity-100"
                    title="Retirer de la comparaison"
                  >
                    <X className="w-4 h-4 text-red-600" />
                  </button>
                </div>
                <h3 className="mt-3 text-sm font-medium text-gray-900 line-clamp-2">
                  {prop.title}
                </h3>
                <p className="mt-1 text-lg font-medium text-primary">
                  {prop.price.toLocaleString()} FCFA
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Tableau de comparaison */}
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Prix et Frais */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-900">Prix et Frais</h2>
            </div>
            <div className="space-y-1">
              <CompareRow
                label="Loyer mensuel"
                icon={DollarSign}
                getValue={(p) => `${p.price.toLocaleString()} FCFA`}
              />
              <CompareRow
                label="Caution"
                getValue={(p) => `${(p.deposit || p.price * 2).toLocaleString()} FCFA`}
              />
              <CompareRow
                label="Frais d'agence"
                getValue={(p) => p.fees ? `${p.fees.toLocaleString()} FCFA` : 'Inclus'}
              />
              <CompareRow
                label="Total initial"
                getValue={(p) => {
                  const total = p.price + (p.deposit || p.price * 2) + (p.fees || 0);
                  return `${total.toLocaleString()} FCFA`;
                }}
              />
            </div>
          </div>

          <div className="h-px bg-gray-200 my-6"></div>

          {/* Caractéristiques */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Home className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-900">Caractéristiques</h2>
            </div>
            <div className="space-y-1">
              <CompareRow
                label="Type"
                icon={Home}
                getValue={(p) => {
                  const types: { [key: string]: string } = {
                    'STUDIO': 'Studio',
                    'APPARTEMENT': 'Appartement',
                    'MAISON': 'Maison',
                    'CHAMBRE': 'Chambre',
                    'VILLA': 'Villa',
                    'DUPLEX': 'Duplex',
                  };
                  return types[p.type] || p.type;
                }}
              />
              <CompareRow
                label="Chambres"
                icon={Bed}
                getValue={(p) => p.bedrooms}
              />
              <CompareRow
                label="Salles de bain"
                icon={Bath}
                getValue={(p) => p.bathrooms}
              />
              <CompareRow
                label="Surface"
                icon={Square}
                getValue={(p) => `${p.area} m²`}
              />
            </div>
          </div>

          <div className="h-px bg-gray-200 my-6"></div>

          {/* Équipements */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-900">Équipements</h2>
            </div>
            <div className="space-y-1">
              <CompareRow
                label="Meublé"
                getValue={(p) => p.furnished ? (
                  <span className="flex items-center justify-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Oui
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1 text-gray-400">
                    <XCircle className="w-4 h-4" />
                    Non
                  </span>
                )}
              />
              <CompareRow
                label="Climatisé"
                getValue={(p) => p.airConditioned ? (
                  <span className="flex items-center justify-center gap-1 text-green-600">
                    <CheckCircle className="w-4 h-4" />
                    Oui
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1 text-gray-400">
                    <XCircle className="w-4 h-4" />
                    Non
                  </span>
                )}
              />
              <CompareRow
                label="Parking"
                getValue={(p) => p.parking ? (
                  <span className="flex items-center justify-center gap-1 text-green-600">
                    <Car className="w-4 h-4" />
                    Oui
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1 text-gray-400">
                    <XCircle className="w-4 h-4" />
                    Non
                  </span>
                )}
              />
              <CompareRow
                label="Sécurité"
                getValue={(p) => p.security ? (
                  <span className="flex items-center justify-center gap-1 text-green-600">
                    <Shield className="w-4 h-4" />
                    Oui
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1 text-gray-400">
                    <XCircle className="w-4 h-4" />
                    Non
                  </span>
                )}
              />
              <CompareRow
                label="Internet"
                getValue={(p) => p.internet ? (
                  <span className="flex items-center justify-center gap-1 text-green-600">
                    <Wifi className="w-4 h-4" />
                    Oui
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-1 text-gray-400">
                    <XCircle className="w-4 h-4" />
                    Non
                  </span>
                )}
              />
            </div>
          </div>

          <div className="h-px bg-gray-200 my-6"></div>

          {/* Localisation */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-medium text-gray-900">Localisation</h2>
            </div>
            <div className="space-y-1">
              <CompareRow
                label="Ville"
                icon={MapPin}
                getValue={(p) => typeof p.city === 'object' ? p.city?.name || 'N/A' : p.city || 'N/A'}
              />
              <CompareRow
                label="Quartier"
                getValue={(p) => typeof p.neighborhood === 'object' ? p.neighborhood?.name || 'N/A' : p.neighborhood || 'N/A'}
              />
              <CompareRow
                label="Adresse"
                getValue={(p) => <span className="text-xs">{p.address}</span>}
              />
            </div>
          </div>

          {/* Score du Quartier */}
          {selectedProperties.some(p => (p as any).neighborhood?.score) && (
            <>
              <div className="h-px bg-gray-200 my-6"></div>
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                  <Star className="w-5 h-5 text-primary fill-primary" />
                  <h2 className="text-lg font-medium text-gray-900">Score du Quartier</h2>
                </div>
                <div className="space-y-1">
                  <CompareRow
                    label="Score global"
                    icon={Star}
                    getValue={(p) => (p as any).neighborhood?.score?.overall ? `${(p as any).neighborhood.score.overall.toFixed(1)}/5` : 'N/A'}
                  />
                  <CompareRow
                    label="Sécurité"
                    getValue={(p) => (p as any).neighborhood?.score?.security ? `${(p as any).neighborhood.score.security.toFixed(1)}/5` : 'N/A'}
                  />
                  <CompareRow
                    label="Transport"
                    getValue={(p) => (p as any).neighborhood?.score?.accessibility ? `${(p as any).neighborhood.score.accessibility.toFixed(1)}/5` : 'N/A'}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {/* Boutons d'action */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {selectedProperties.map((prop) => (
            <button
              key={prop.id}
              onClick={() => navigate(`/properties/${prop.id}`)}
              className="flex items-center justify-between gap-4 bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-primary hover:shadow-md transition-all-smooth group"
            >
              <span className="text-sm font-medium text-gray-900 line-clamp-1 flex-1 text-left">
                {prop.title}
              </span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-primary group-hover:translate-x-1 transition-all-smooth flex-shrink-0" />
            </button>
          ))}
        </div>
      </div>
    </Layout>
  );
}

