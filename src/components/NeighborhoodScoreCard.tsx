import { Shield, MapPin, Store, Moon, Wifi, Star } from 'lucide-react';

interface NeighborhoodScore {
  id: string;
  security: number;
  accessibility: number;
  amenities: number;
  nightlife: number;
  internet: number;
  overall: number;
  totalRatings: number;
  description?: string;
  highlights?: string[];
  concerns?: string[];
  averageRent?: number;
  transportCost?: number;
  popularFor?: string[];
}

interface NeighborhoodScoreCardProps {
  score: NeighborhoodScore;
  neighborhoodName: string;
  cityName?: string;
}

const ScoreItem = ({
  icon: Icon,
  label,
  score,
  color,
}: {
  icon: any;
  label: string;
  score: number;
  color: string;
}) => {
  const percentage = (score / 5) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-5 h-5" style={{ color }} />
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <div className="relative h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${percentage}%`, backgroundColor: color }}
        />
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-gray-600">{score.toFixed(1)}/5</span>
        <span className="text-gray-500">{percentage.toFixed(0)}%</span>
      </div>
    </div>
  );
};

export default function NeighborhoodScoreCard({
  score,
  neighborhoodName,
  cityName,
}: NeighborhoodScoreCardProps) {
  const scores = [
    { icon: Shield, label: 'Sécurité', value: score.security, color: '#10B981' },
    { icon: MapPin, label: 'Accessibilité', value: score.accessibility, color: '#3B82F6' },
    { icon: Store, label: 'Commodités', value: score.amenities, color: '#F59E0B' },
    { icon: Moon, label: 'Vie nocturne', value: score.nightlife, color: '#8B5CF6' },
    { icon: Wifi, label: 'Internet', value: score.internet, color: '#EC4899' },
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Score du Quartier
          </h3>
          <p className="text-sm text-gray-600">
            {neighborhoodName}
            {cityName && `, ${cityName}`}
          </p>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-1 mb-1">
            <Star className="w-6 h-6 text-yellow-500 fill-yellow-500" />
            <span className="text-3xl font-bold text-gray-900">
              {score.overall.toFixed(1)}
            </span>
          </div>
          <p className="text-xs text-gray-500">
            {score.totalRatings} {score.totalRatings > 1 ? 'évaluations' : 'évaluation'}
          </p>
        </div>
      </div>

      <div className="space-y-4 mb-6">
        {scores.map((item) => (
          <ScoreItem
            key={item.label}
            icon={item.icon}
            label={item.label}
            score={item.value}
            color={item.color}
          />
        ))}
      </div>

      {score.description && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">{score.description}</p>
        </div>
      )}

      {score.highlights && score.highlights.length > 0 && (
        <div className="border-t border-gray-200 pt-4 mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Points forts</h4>
          <div className="flex flex-wrap gap-2">
            {score.highlights.map((highlight, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium"
              >
                {highlight}
              </span>
            ))}
          </div>
        </div>
      )}

      {score.popularFor && score.popularFor.length > 0 && (
        <div className="border-t border-gray-200 pt-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Populaire pour</h4>
          <div className="flex flex-wrap gap-2">
            {score.popularFor.map((item, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      {score.transportCost && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">Coût moyen du transport:</span>{' '}
            {score.transportCost.toLocaleString('fr-FR')} FCFA/mois
          </p>
        </div>
      )}
    </div>
  );
}

