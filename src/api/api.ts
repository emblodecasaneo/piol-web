// Configuration de l'API
const API_BASE_URL = import.meta.env.DEV
  ? 'http://192.168.1.140:3001/api'
  : 'https://piol.onrender.com/api';

// Types pour l'authentification
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  phone: string;
  password: string;
  firstName: string;
  lastName: string;
  userType: 'TENANT' | 'AGENT';
  businessName?: string;
  license?: string;
  idCardNumber?: string;
}

export interface Agent {
  id: string;
  businessName: string;
  license?: string;
  isVerified: boolean;
  rating: number;
  reviewCount: number;
}

export interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  userType: 'TENANT' | 'AGENT';
  createdAt: string;
  updatedAt: string;
  agent?: Agent;
}

export interface AuthResponse {
  message: string;
  user: User;
  token: string;
}

export interface Property {
  id: string;
  title: string;
  description: string;
  type: string;
  price: number;
  deposit: number;
  fees?: number;
  address: string;
  latitude?: number;
  longitude?: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  furnished: boolean;
  airConditioned: boolean;
  parking: boolean;
  security: boolean;
  internet: boolean;
  water: boolean;
  electricity: boolean;
  images: string[];
  status: string;
  isAvailable: boolean;
  isPremium: boolean;
  city?: { id: string; name: string };
  neighborhood?: { id: string; name: string };
  locality?: { id: string; name: string };
  agent?: any;
  createdAt: string;
  updatedAt: string;
}

// Classe pour gérer les appels API (adapté pour le web avec localStorage)
class ApiService {
  private baseURL: string;

  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Méthode générique pour les requêtes
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('authToken');
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Méthodes d'authentification
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    // Sauvegarder le token dans localStorage
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Sauvegarder le token dans localStorage
    localStorage.setItem('authToken', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    return response;
  }

  async verifyToken(): Promise<{ user: User }> {
    return await this.request<{ user: User }>('/auth/verify');
  }

  async logout(): Promise<void> {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }

  // Méthodes pour le profil utilisateur
  async getProfile(): Promise<{ user: User }> {
    return await this.request<{ user: User }>('/users/profile');
  }

  async updateProfile(data: { firstName?: string; lastName?: string; phone?: string; avatar?: string }): Promise<{ user: User }> {
    const response = await this.request<{ user: User }>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    // Mettre à jour le user dans localStorage
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  // Méthodes pour les propriétés
  async getProperties(filters?: any): Promise<{ properties: Property[]; total: number }> {
    const queryParams = filters ? `?${new URLSearchParams(filters).toString()}` : '';
    return await this.request<{ properties: Property[]; total: number }>(`/properties${queryParams}`);
  }

  async getProperty(id: string): Promise<{ property: Property }> {
    return await this.request<{ property: Property }>(`/properties/${id}`);
  }

  async getNearbyProperties(latitude: number, longitude: number, radius?: number): Promise<{ properties: Property[] }> {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      ...(radius && { radius: radius.toString() })
    });
    return await this.request<{ properties: Property[] }>(`/properties/nearby?${params}`);
  }

  // Méthodes pour les favoris
  async getFavorites(): Promise<Property[]> {
    const response = await this.request<{ message: string; favorites: any[] }>('/users/favorites');
    return response.favorites.map((fav: any) => fav.property || fav);
  }

  async toggleFavorite(propertyId: string): Promise<{ isFavorite: boolean; message: string }> {
    return await this.request<any>(`/users/favorites/${propertyId}`, {
      method: 'POST',
    });
  }

  async isFavorite(propertyId: string): Promise<boolean> {
    try {
      const favorites = await this.getFavorites();
      return favorites.some((fav: any) => fav.propertyId === propertyId || fav.id === propertyId);
    } catch {
      return false;
    }
  }

  // Méthodes pour les messages
  async getMessages(): Promise<any[]> {
    try {
      const response = await this.request<any>('/messages/conversations');
      // L'API peut retourner directement un tableau ou un objet avec une propriété conversations
      if (Array.isArray(response)) {
        return response;
      }
      return response.conversations || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async getConversation(otherUserId: string, propertyId?: string): Promise<{ messages: any[] }> {
    const params = propertyId ? `?propertyId=${propertyId}` : '';
    return await this.request<{ messages: any[] }>(`/messages/conversation/${otherUserId}${params}`);
  }

  async getUnreadCount(): Promise<{ unreadCount: number }> {
    return await this.request<{ unreadCount: number }>('/messages/unread-count');
  }

  async sendMessage(messageData: { receiverId: string; content: string; propertyId?: string }): Promise<any> {
    return await this.request<any>('/messages/send', {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async markMessageAsRead(messageId: string): Promise<any> {
    try {
      return await this.request<any>(`/messages/${messageId}/read`, {
        method: 'PUT',
      });
    } catch (error) {
      console.error('Mark as read error:', error);
      return { success: false };
    }
  }

  // Méthodes pour les agents
  async getAgents(): Promise<{ agents: any[] }> {
    return await this.request<{ agents: any[] }>('/agents');
  }

  async getAgent(id: string): Promise<{ agent: any }> {
    return await this.request<{ agent: any }>(`/agents/${id}`);
  }

  // Méthodes pour les villes et quartiers
  async getCities(search?: string): Promise<{ cities: any[] }> {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return await this.request<{ cities: any[] }>(`/cities${params}`);
  }

  async getNeighborhoodsByCity(cityId: string): Promise<{ neighborhoods: any[] }> {
    return await this.request<{ neighborhoods: any[] }>(`/neighborhoods/city/${cityId}`);
  }

  // Méthodes pour les rendez-vous
  async requestAppointment(data: { agentId: string; propertyId?: string; message?: string; preferredDate?: string }): Promise<any> {
    return await this.request<any>('/appointments/request', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAppointments(status?: string): Promise<{ appointments: any[] }> {
    const params = status ? `?status=${encodeURIComponent(status)}` : '';
    return await this.request<{ appointments: any[] }>(`/appointments${params}`);
  }

  // Vérification de la santé de l'API
  async healthCheck(): Promise<any> {
    return await this.request<any>('/health');
  }
}

// Instance singleton
export const apiService = new ApiService();

export default apiService;

