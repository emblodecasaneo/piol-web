import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { Mail, Lock, User, Phone, Eye, EyeOff, Star, CheckCircle } from 'lucide-react';
import logoBlack from '../assets/Piol-logo/vector/default-monochrome-black.svg';

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, isLoading } = useAuth();
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email || !formData.password || !formData.firstName || !formData.lastName || !formData.phone) {
      toast.showError('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.showError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password.length < 6) {
      toast.showError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      await register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        userType: 'TENANT',
      });
      toast.showSuccess('Inscription réussie !');
      navigate('/');
    } catch (error: any) {
      toast.showError(error.message || 'Erreur lors de l\'inscription');
    }
  };

  const benefits = [
    { icon: CheckCircle, text: 'Accès à des milliers de propriétés' },
    { icon: CheckCircle, text: 'Recherche avancée et filtres personnalisés' },
    { icon: CheckCircle, text: 'Notifications en temps réel' },
    { icon: CheckCircle, text: 'Support client dédié' },
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
          {/* Benefits */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-6 text-left">Pourquoi nous choisir ?</h3>
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div 
                  key={index} 
                  className="flex items-center gap-3 animate-slide-up justify-start"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <Icon className="w-5 h-5 text-white flex-shrink-0" />
                  <span className="text-white/90 text-sm font-light text-left">{benefit.text}</span>
                </div>
              );
            })}
          </div>

          {/* Testimonial */}
          <div className="mt-10 p-6 bg-white/10 backdrop-blur-sm rounded-xl animate-slide-up text-left" style={{ animationDelay: '0.4s' }}>
            <div className="flex items-center gap-1 mb-3 justify-start">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-yellow-300 text-yellow-300" />
              ))}
            </div>
            <p className="text-white/90 text-sm font-light italic mb-3 text-left">
              "J'ai trouvé mon appartement en seulement 3 jours grâce à PIOL. L'interface est intuitive et les propriétés sont bien présentées."
            </p>
            <p className="text-white/80 text-xs font-light text-left">— Marie D., Utilisatrice</p>
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
          <div className="lg:hidden mb-8 text-center">
            <img 
              src={logoBlack} 
              alt="PIOL Logo" 
              className="h-8 w-auto mx-auto mb-4"
              style={{ filter: 'brightness(0) saturate(100%) invert(11%) sepia(98%) saturate(7044%) hue-rotate(354deg) brightness(95%) contrast(106%)' }}
            />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="mb-8 text-center">
              <h2 className="text-2xl font-medium text-gray-900 mb-2">Inscription</h2>
              <p className="text-sm text-gray-600 font-light">Créez votre compte en quelques étapes</p>
            </div>

            <form onSubmit={handleRegister} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-2">
                    Prénom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                      placeholder="Prénom"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-normal text-gray-700 mb-2">
                    Nom
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                      placeholder="Nom"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                    placeholder="Entrez votre email"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                    placeholder="+237 6XX XXX XXX"
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
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                    placeholder="Au moins 6 caractères"
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

              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-12 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                    placeholder="Confirmez votre mot de passe"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-smooth"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-dark transition-all-smooth disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
              >
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 font-normal">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-primary font-medium hover:underline transition-smooth">
                  Se connecter
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

