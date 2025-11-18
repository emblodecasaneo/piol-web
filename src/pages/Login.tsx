import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Mail, Lock, Eye, EyeOff, Home, Shield, MessageCircle } from 'lucide-react';
import logoBlack from '../assets/Piol-logo/vector/default-monochrome-black.svg';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const toast = useToast();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.showError('Veuillez remplir tous les champs');
      return;
    }

    try {
      await login(email, password);
      toast.showSuccess('Connexion réussie !');
      navigate('/');
    } catch (error: any) {
      toast.showError(error.message || 'Erreur de connexion');
    }
  };

  const features = [
    { icon: Home, title: 'Des milliers de propriétés', description: 'Trouvez le logement parfait qui correspond à vos besoins' },
    { icon: Shield, title: 'Transactions sécurisées', description: 'Vos données et vos transactions sont protégées' },
    { icon: MessageCircle, title: 'Contact direct', description: 'Communiquez directement avec les propriétaires et agents' },
  ];

  return (
    <div className="min-h-screen bg-white flex animate-fade-in">
      {/* Left Block - Informations */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary to-primary-dark text-white p-12 flex-col justify-center relative overflow-hidden">
        {/* Logo en haut à gauche */}
        <div className="absolute top-8 left-8 z-20 animate-slide-down">
          <img 
            src={logoBlack} 
            alt="PIOL Logo" 
            className="h-10 w-auto"
            style={{ filter: 'brightness(0) invert(1)' }}
          />
        </div>
        
        <div className="relative z-10 max-w-md">
          {/* Features */}
          <div className="space-y-6">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div 
                  key={index} 
                  className="flex items-start gap-4 animate-slide-up"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium mb-1 text-left">{feature.title}</h3>
                    <p className="text-white/80 text-sm font-light text-left">{feature.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mb-32 blur-3xl"></div>
        <div className="absolute top-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mt-24 blur-3xl"></div>
      </div>

      {/* Right Block - Formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 bg-gray-50">
        <div className="w-full max-w-md animate-scale-in">
          {/* Logo Mobile */}
          <div className="lg:hidden mb-8 ">
            <img 
              src={logoBlack} 
              alt="PIOL Logo" 
              className="h-8 w-auto mx-auto mb-4"
              style={{ filter: 'brightness(0) saturate(100%) invert(11%) sepia(98%) saturate(7044%) hue-rotate(354deg) brightness(95%) contrast(106%)' }}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8 ">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">Connexion</h2>
              <p className="text-sm text-gray-600 font-light">Accédez à votre compte</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                    placeholder="Entrez votre email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-12 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                    placeholder="Entrez votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-smooth"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary w-4 h-4" />
                  <span className="ml-2 text-sm text-gray-600 font-normal">Se souvenir de moi</span>
                </label>
                <a href="#" className="text-sm text-primary font-normal hover:underline transition-smooth">
                  Mot de passe oublié ?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-dark transition-all-smooth disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </button>
            </form>

            <div className="mt-6 ">
              <p className="text-sm text-gray-600 font-normal">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-primary font-medium hover:underline transition-smooth">
                  S'inscrire
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

