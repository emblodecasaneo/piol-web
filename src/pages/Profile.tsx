import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../contexts/AuthContext';
import { apiService } from '../api/api';
import { User, Mail, Phone, Save } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phone: user.phone || '',
      });
    }
  }, [user]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      await apiService.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
      });
      await refreshUser();
      toast.showSuccess('Profil mis à jour avec succès');
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.showError(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout showHero={false}>
      <div className="w-full px-6 max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-xl font-medium text-gray-900 mb-2">Mon profil</h1>
          <p className="text-gray-600 text-sm">Gérez vos informations personnelles</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
          <form onSubmit={handleUpdate} className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center gap-6 mb-8">
              <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={`${user.firstName} ${user.lastName}`}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-12 h-12 text-primary" />
                )}
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {user?.firstName} {user?.lastName}
                </h2>
                <p className="text-gray-600 text-sm">{user?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
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
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                    required
                  />
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
                    value={formData.email}
                    disabled
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">L'email ne peut pas être modifié</p>
              </div>

              <div>
                <label className="block text-sm font-normal text-gray-700 mb-2">
                  Téléphone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-smooth"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-primary text-white py-2.5 rounded-lg font-medium text-sm hover:bg-primary-dark transition-all-smooth disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:shadow-lg"
              >
                <Save className="w-5 h-5" />
                {loading ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

