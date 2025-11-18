import { useState } from 'react';
import type { ReactNode } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCompare } from '../contexts/CompareContext';
import { Home, Search, MessageCircle, User, LogOut, Menu, X, ArrowRight, GitCompare, Smartphone } from 'lucide-react';
import logoBlack from '../assets/Piol-logo/vector/default-monochrome-black.svg';

interface LayoutProps {
  children: ReactNode;
  showHero?: boolean;
  heroTitle?: string;
  heroSubtitle?: string;
  heroImage?: string;
}

export default function Layout({ 
  children, 
  showHero = false, 
  heroTitle = "Des espaces de vie accueillants",
  heroSubtitle = "Découvrez des propriétés qui redéfinissent votre cadre de vie",
  heroImage = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920"
}: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { selectedProperties } = useCompare();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: '/', label: 'Accueil', icon: Home },
    { path: '/search', label: 'Rechercher', icon: Search },
    { path: '/messages', label: 'Messages', icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <img 
                src={logoBlack} 
                alt="PIOL Logo" 
                className="h-8 w-auto"
                style={{ filter: 'brightness(0) saturate(100%) invert(11%) sepia(98%) saturate(7044%) hue-rotate(354deg) brightness(95%) contrast(106%)' }}
              />
            </div>

            {/* Right Actions - Navigation + Profile */}
            <div className="flex items-center gap-2">
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center gap-1">
                {navItems.filter(item => user || item.path !== '/messages').map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.path}
                      onClick={() => {
                        if (item.path === '/messages' && !user) {
                          navigate('/login');
                        } else {
                          navigate(item.path);
                        }
                      }}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-normal transition-all-smooth ${
                        isActive(item.path)
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
                
                {/* Badge Comparateur Desktop */}
                {selectedProperties.length > 0 && (
                  <button
                    onClick={() => navigate('/compare')}
                    className={`relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-normal transition-all-smooth ${
                      isActive('/compare')
                        ? 'bg-primary/10 text-primary'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    title="Comparer les propriétés"
                  >
                    <GitCompare className="w-4 h-4" />
                    <span>Comparer</span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-white rounded-full flex items-center justify-center text-xs font-medium">
                      {selectedProperties.length}
                    </span>
                  </button>
                )}
              </nav>

              <div className="flex items-center gap-2 border-l border-gray-200 pl-3 ml-1">
                {/* Bouton Télécharger APK */}
                <a
                  href="https://drive.google.com/file/d/1sgGZ9aE8-n0CguK-FVNf4OLWeIiJk6ca/view?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-all-smooth shadow-sm hover:shadow-md"
                  title="Télécharger l'application mobile"
                >
                  <Smartphone className="w-4 h-4" />
                  <span>Télécharger</span>
                </a>
                
                {user ? (
                  <>
                    <button
                      onClick={() => navigate('/profile')}
                      className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-normal text-gray-700 hover:bg-gray-100 transition-all-smooth"
                    >
                      <User className="w-4 h-4" />
                      <span>{user.firstName || 'Profil'}</span>
                    </button>
                    <button
                      onClick={handleLogout}
                      className="p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                      title="Déconnexion"
                    >
                      <LogOut className="w-5 h-5" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => navigate('/login')}
                      className="px-4 py-2 rounded-lg text-sm font-normal text-gray-700 hover:bg-gray-100 transition-all-smooth"
                    >
                      Connexion
                    </button>
                    <button
                      onClick={() => navigate('/register')}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-all-smooth"
                    >
                      S'inscrire
                    </button>
                  </>
                )}
                
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden p-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            </div>
          </div>

              {/* Mobile Navigation */}
              {mobileMenuOpen && (
                <div className="md:hidden py-4 border-t border-gray-200">
                  <nav className="flex flex-col gap-2">
                    {navItems.filter(item => user || item.path !== '/messages').map((item) => {
                      const Icon = item.icon;
                      return (
                        <button
                          key={item.path}
                          onClick={() => {
                            if (item.path === '/messages' && !user) {
                              navigate('/login');
                            } else {
                              navigate(item.path);
                            }
                            setMobileMenuOpen(false);
                          }}
                              className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-normal transition-all-smooth ${
                                isActive(item.path)
                                  ? 'bg-primary/10 text-primary'
                                  : 'text-gray-700 hover:bg-gray-100'
                              }`}
                        >
                          <Icon className="w-5 h-5" />
                          <span>{item.label}</span>
                        </button>
                      );
                    })}
                    {/* Bouton Comparateur Mobile */}
                    {selectedProperties.length > 0 && (
                      <button
                        onClick={() => {
                          navigate('/compare');
                          setMobileMenuOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-normal transition-all-smooth ${
                          isActive('/compare')
                            ? 'bg-primary/10 text-primary'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <GitCompare className="w-5 h-5" />
                        <span>Comparer ({selectedProperties.length})</span>
                      </button>
                    )}
                    
                    {/* Bouton Télécharger APK Mobile */}
                    <a
                      href="https://drive.google.com/file/d/1sgGZ9aE8-n0CguK-FVNf4OLWeIiJk6ca/view?usp=sharing"
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-all-smooth"
                      title="Télécharger l'application mobile"
                    >
                      <Smartphone className="w-5 h-5" />
                      <span>Télécharger</span>
                    </a>
                    
                {user ? (
                  <button
                    onClick={() => {
                      navigate('/profile');
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-normal text-gray-700 hover:bg-gray-100 transition-all-smooth"
                  >
                    <User className="w-5 h-5" />
                    <span>Profil</span>
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        navigate('/login');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-normal text-gray-700 hover:bg-gray-100 transition-all-smooth"
                    >
                      <User className="w-5 h-5" />
                      <span>Connexion</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('/register');
                        setMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark transition-all-smooth"
                    >
                      <span>S'inscrire</span>
                    </button>
                  </>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      {showHero && (
        <section className="relative h-[600px] flex items-center justify-center overflow-hidden animate-fade-in">
          {/* Background Image with Parallax Effect */}
          <div 
            className="absolute inset-0 bg-cover bg-center scale-105 hover:scale-100 transition-transform duration-[10000ms]"
            style={{ backgroundImage: `url(${heroImage})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70"></div>
            {/* Animated Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 animate-pulse"></div>
          </div>

          {/* Floating Shapes */}
          <div className="absolute top-20 left-10 w-20 h-20 bg-primary/20 rounded-full blur-2xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

          {/* Content */}
          <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center animate-slide-up">
            <button className="mb-6 px-5 py-2.5 bg-white/20 backdrop-blur-md text-white rounded-full text-sm font-medium hover:bg-white/30 hover:scale-105 transition-all-smooth shadow-lg border border-white/20">
              🏠 Bien-être & Confort
            </button>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium text-white mb-6 leading-tight drop-shadow-2xl">
              {heroTitle}
            </h1>
            <p className="text-xl sm:text-2xl text-white/95 mb-10 max-w-3xl mx-auto leading-relaxed font-light">
              {heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10 animate-bounce">
            <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
              <div className="w-1.5 h-1.5 bg-white/70 rounded-full"></div>
            </div>
          </div>
        </section>
      )}

      {/* Main Content */}
      {!showHero && <div className="w-full flex-1 flex flex-col">{children}</div>}
      {showHero && <div className="pb-16">{children}</div>}

      {/* Footer */}
      <footer className="bg-primary mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            {/* Logo & Description */}
            <div className="flex items-center gap-3">
              <img 
                src={logoBlack} 
                alt="PIOL Logo" 
                className="h-6 w-auto"
                style={{ filter: 'brightness(0) invert(1)' }}
              />
              <div>
                <p className="text-white/90 text-xs">
                  Votre plateforme immobilière de confiance. Trouvez votre logement idéal en quelques clics.
                </p>
              </div>
            </div>

            {/* Navigation Links */}
            <div className="flex flex-wrap items-center gap-6 text-sm">
              {/* Liens rapides */}
              <div className="flex items-center gap-4">
                <button onClick={() => navigate('/')} className="text-white/90 hover:text-white transition-colors">
                  Accueil
                </button>
                <button onClick={() => navigate('/search')} className="text-white/90 hover:text-white transition-colors">
                  Rechercher
                </button>
                {user && (
                  <button onClick={() => navigate('/messages')} className="text-white/90 hover:text-white transition-colors">
                    Messages
                  </button>
                )}
                <button onClick={() => navigate('/messages')} className="text-white/90 hover:text-white transition-colors">
                  Nous contacter
                </button>
                {user && (
                  <button onClick={() => navigate('/profile')} className="text-white/90 hover:text-white transition-colors">
                    Mon profil
                  </button>
                )}
              </div>

              {/* Separator */}
              <div className="h-4 w-px bg-white/30"></div>

              {/* Legal & Copyright */}
              <div className="flex items-center gap-4">
                <p className="text-white/90 text-xs">
                  © {new Date().getFullYear()} PIOL. Tous droits réservés.
                </p>
                <button className="text-white/90 hover:text-white transition-colors text-xs">
                  Conditions d'utilisation
                </button>
                <button className="text-white/90 hover:text-white transition-colors text-xs">
                  Politique de confidentialité
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

