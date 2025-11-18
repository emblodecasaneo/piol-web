import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          Trouvez votre logement idéal au Cameroun
        </h1>
        <p className="text-white/90 mb-8 text-lg">
          Recherche simplifiée, résultats garantis
        </p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition"
          >
            Se connecter
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-6 py-3 bg-white/10 text-white border-2 border-white rounded-lg font-semibold hover:bg-white/20 transition"
          >
            S'inscrire
          </button>
        </div>
      </div>
    </div>
  );
}

