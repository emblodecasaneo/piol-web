import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiService } from '../api/api';
import { MessageCircle, Search, Send, User as UserIcon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

interface Conversation {
  id: string;
  otherUser: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  };
  lastMessage?: {
    content: string;
    createdAt: string;
  };
  unreadCount: number;
  property?: {
    id: string;
    title: string;
    images: string[];
  };
}

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  propertyId?: string;
  createdAt: string;
  read: boolean;
}

export default function MessagesPage() {
  const { user } = useAuth();
  const toast = useToast();
  const location = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Récupérer les données passées depuis PropertyDetail
  const locationState = location.state as {
    agentId?: string;
    propertyId?: string;
    propertyTitle?: string;
    propertyImages?: string[];
    agentInfo?: {
      id: string;
      firstName: string;
      lastName: string;
      avatar?: string;
      businessName?: string;
      isVerified?: boolean;
      phone?: string;
    };
  } | null;

  useEffect(() => {
    loadConversations();
  }, []);

  // Initialiser immédiatement la nouvelle conversation si locationState existe
  useEffect(() => {
    if (locationState?.agentId && locationState?.agentInfo && !selectedConversation) {
      // Définir immédiatement les infos de l'utilisateur pour l'affichage
      setOtherUser({
        id: locationState.agentInfo.id,
        firstName: locationState.agentInfo.firstName,
        lastName: locationState.agentInfo.lastName,
        avatar: locationState.agentInfo.avatar,
        phone: locationState.agentInfo.phone,
        businessName: locationState.agentInfo.businessName,
        isVerified: locationState.agentInfo.isVerified
      });

      // Créer immédiatement une conversation temporaire pour l'affichage
      const tempConversationId = `temp-${locationState.agentId}-${locationState.propertyId}`;
      setSelectedConversation(tempConversationId);
      setMessages([]); // Pas de messages encore - nouvelle conversation
    }
  }, []); // Exécuté une seule fois au montage

  // Gérer l'ouverture automatique de la conversation existante une fois les conversations chargées
  useEffect(() => {
    if (!locationState?.agentId || loading || !selectedConversation?.startsWith('temp-')) return;
    
    // Une fois les conversations chargées, vérifier si une conversation existe déjà
    const existingConversation = conversations.find(
      conv => 
        conv.otherUser?.id === locationState.agentId &&
        conv.property?.id === locationState.propertyId
    );

    // Si une conversation existe, basculer vers la vraie conversation
    if (existingConversation) {
      setSelectedConversation(existingConversation.id);
    }
    
    // Nettoyer l'état après vérification
    window.history.replaceState({}, document.title);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      // Ne pas charger si c'est une conversation temporaire (nouvelle conversation)
      if (!selectedConversation.startsWith('temp-')) {
        loadConversation();
      }
      // Si c'est une conversation temporaire, les messages sont déjà vides et otherUser est défini
    } else {
      // Ne réinitialiser otherUser que si on n'a pas de locationState avec agentInfo
      if (!locationState?.agentInfo) {
        setMessages([]);
        setOtherUser(null);
      }
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversations = async () => {
    try {
      setLoading(true);
      const convos = await apiService.getMessages();
      setConversations(convos);
    } catch (error) {
      console.error('Error loading conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async () => {
    if (!selectedConversation) return;
    
    try {
      setMessagesLoading(true);
      
      // Si c'est une conversation temporaire (commence par "temp-")
      if (selectedConversation.startsWith('temp-')) {
        // Conversation virtuelle, pas besoin de charger les messages
        // Les messages sont vides et otherUser est déjà défini
        setMessages([]);
        return;
      }
      
      // Trouver la conversation sélectionnée par son ID
      const conversation = conversations.find(c => c.id === selectedConversation);
      if (conversation && conversation.otherUser?.id) {
        // Charger les messages avec l'ID de l'autre utilisateur
        const response = await apiService.getConversation(conversation.otherUser.id, conversation.property?.id);
        setMessages(response.messages || []);
        setOtherUser(conversation.otherUser);
      } else {
        // Si pas de conversation trouvée, essayer avec l'ID directement
        const response = await apiService.getConversation(selectedConversation);
        if (response.messages && response.messages.length > 0) {
          setMessages(response.messages || []);
          // Déduire l'autre utilisateur des messages
          const firstMessage = response.messages[0];
          const otherUserId = firstMessage.senderId === user?.id ? firstMessage.recipientId : firstMessage.senderId;
          setOtherUser({ id: otherUserId, firstName: 'Agent', lastName: '' });
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.showError('Erreur lors du chargement de la conversation');
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      setSending(true);
      
      let receiverId: string;
      let propertyId: string | undefined;

      // Si c'est une conversation temporaire (nouvelle conversation)
      if (selectedConversation.startsWith('temp-') && locationState?.agentId) {
        receiverId = locationState.agentId;
        propertyId = locationState.propertyId;
      } else {
        // Conversation existante
        const conversation = conversations.find(c => c.id === selectedConversation);
        if (!conversation || !conversation.otherUser?.id) {
          toast.showError('Conversation introuvable.');
          setSending(false);
          return;
        }
        receiverId = conversation.otherUser.id;
        propertyId = conversation.property?.id;
      }

      if (!receiverId) {
        toast.showError('Impossible d\'identifier le destinataire.');
        setSending(false);
        return;
      }

      await apiService.sendMessage({
        receiverId,
        content: newMessage.trim(),
        propertyId,
      });
      
      const wasTempConversation = selectedConversation.startsWith('temp-');
      setNewMessage('');
      
      // Si c'était une conversation temporaire (nouvelle), chercher et ouvrir la nouvelle conversation créée
      if (wasTempConversation) {
        // Attendre un peu que la conversation soit créée côté serveur
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Recharger les conversations pour récupérer la nouvelle
        const updatedConversations = await apiService.getMessages();
        setConversations(updatedConversations);
        
        // Chercher la nouvelle conversation créée
        const newConversation = updatedConversations.find(
          conv => 
            conv.otherUser?.id === receiverId &&
            conv.property?.id === propertyId
        );
        
        if (newConversation) {
          // Ouvrir la nouvelle conversation créée
          setSelectedConversation(newConversation.id);
          // Charger les messages (qui contient le message qu'on vient d'envoyer)
          const response = await apiService.getConversation(newConversation.otherUser.id, newConversation.property?.id);
          setMessages(response.messages || []);
          setOtherUser(newConversation.otherUser);
        } else if (updatedConversations.length > 0) {
          // Si on ne trouve pas, prendre la dernière conversation (normalement la nouvelle)
          const lastConversation = updatedConversations[updatedConversations.length - 1];
          setSelectedConversation(lastConversation.id);
          const response = await apiService.getConversation(lastConversation.otherUser.id, lastConversation.property?.id);
          setMessages(response.messages || []);
          setOtherUser(lastConversation.otherUser);
        }
      } else {
        // Conversation existante : recharger les conversations et les messages
        await loadConversations();
        await loadConversation();
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.showError('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  const filteredConversations = conversations.filter((conv) => {
    const propertyTitle = conv.property?.title || '';
    const otherUserName = conv.otherUser 
      ? `${conv.otherUser.firstName || ''} ${conv.otherUser.lastName || ''}`.trim()
      : '';
    const fullSearch = `${propertyTitle} ${otherUserName}`.toLowerCase();
    return fullSearch.includes(searchQuery.toLowerCase());
  });

  const selectedConv = conversations.find(c => c.id === selectedConversation);
  
  // Récupérer les informations de la propriété pour l'affichage
  const displayProperty = selectedConv?.property || (locationState?.propertyTitle ? {
    id: locationState.propertyId,
    title: locationState.propertyTitle,
    images: locationState.propertyImages || []
  } : null);
  
  // Récupérer les informations complètes de l'agent/bailleur
  const displayAgentInfo = otherUser || locationState?.agentInfo || selectedConv?.otherUser;

  return (
    <Layout showHero={false}>
      <div className="w-full flex-1 flex bg-gray-50 overflow-hidden">
        {/* Left Sidebar - Conversations List */}
        <div className={`w-full md:w-[400px] flex-shrink-0 border-r border-gray-200 flex flex-col bg-white ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-medium text-gray-900 mb-1">Messages</h1>
            <p className="text-gray-600 text-sm">Vos conversations avec les agents</p>
          </div>

          {/* Search */}
          <div className="p-4 border-b border-gray-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une conversation..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-smooth"
              />
            </div>
          </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-primary mx-auto"></div>
                  <p className="mt-4 text-gray-600">Chargement...</p>
                </div>
              ) : filteredConversations.length > 0 ? (
                <div>
                  {filteredConversations.map((conversation, index) => {
                    // Utiliser conversation.id comme identifiant unique
                    const conversationId = conversation.id;
                    const isSelected = conversationId === selectedConversation;
                    return (
                      <div key={conversation.id}>
                        <div
                          onClick={() => setSelectedConversation(conversationId)}
                          className={`p-4 cursor-pointer transition-colors border-l-4 ${
                            isSelected
                              ? 'bg-primary/5 border-primary'
                              : 'border-transparent hover:bg-gray-50'
                          }`}
                        >
                        <div className="flex items-center gap-3">
                          <div className="relative flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                              {conversation.otherUser?.avatar ? (
                                <img
                                  src={conversation.otherUser.avatar}
                                  alt={conversation.otherUser.firstName || 'User'}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <MessageCircle className="w-6 h-6 text-primary" />
                              )}
                            </div>
                            {conversation.unreadCount > 0 && !isSelected && (
                              <span className="absolute -top-1 -right-1 bg-primary text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className={`font-medium truncate ${
                                conversation.unreadCount > 0 && !isSelected
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-900'
                              }`}>
                                {conversation.property?.title || `${conversation.otherUser?.firstName || 'Utilisateur'} ${conversation.otherUser?.lastName || ''}`}
                              </h3>
                              {conversation.lastMessage && (
                                <span className={`text-xs flex-shrink-0 ml-2 ${
                                  conversation.unreadCount > 0 && !isSelected
                                    ? 'text-primary font-medium'
                                    : 'text-gray-500'
                                }`}>
                                  {new Date(conversation.lastMessage.createdAt).toLocaleDateString('fr-FR', {
                                    day: '2-digit',
                                    month: '2-digit',
                                    year: 'numeric'
                                  })}
                                </span>
                              )}
                            </div>
                            <p className={`text-xs mb-1 truncate ${
                              conversation.unreadCount > 0 && !isSelected
                                ? 'text-primary font-medium'
                                : 'text-gray-500'
                            }`}>
                              {conversation.otherUser?.firstName} {conversation.otherUser?.lastName}
                            </p>
                            {conversation.lastMessage && (
                              <p className={`text-sm truncate ${
                                conversation.unreadCount > 0 && !isSelected
                                  ? 'text-gray-900 font-medium'
                                  : 'text-gray-600'
                              }`}>
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                        </div>
                        {index < filteredConversations.length - 1 && (
                          <div className="border-b border-gray-100"></div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12 px-4">
                  <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-medium">Aucune conversation</p>
                  <p className="text-gray-500 text-sm mt-2">
                    Commencez une conversation avec un agent
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Side - Conversation Detail */}
          <div className={`flex-1 flex flex-col bg-white ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversation ? (
              <>
                {/* Header */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    {displayAgentInfo?.avatar ? (
                      <img
                        src={displayAgentInfo.avatar}
                        alt={displayAgentInfo.firstName || 'Agent'}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <UserIcon className="w-5 h-5 text-primary" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    {/* Titre de la propriété en haut */}
                    {displayProperty?.title && (
                      <h2 className="font-medium text-gray-900 text-base truncate mb-1">
                        {displayProperty.title}
                      </h2>
                    )}
                    {/* Nom du bailleur */}
                    <h3 className="text-sm font-medium text-gray-700 truncate">
                      {displayAgentInfo 
                        ? `${displayAgentInfo.firstName || ''} ${displayAgentInfo.lastName || ''}`.trim() || 
                          displayAgentInfo.businessName || 
                          'Bailleur'
                        : 'Agent'}
                    </h3>
                    {(displayAgentInfo?.phone || locationState?.agentInfo?.phone) && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {(displayAgentInfo?.phone || locationState?.agentInfo?.phone)}
                      </p>
                    )}
                    {(locationState?.agentInfo?.isVerified || displayAgentInfo?.isVerified) && (
                      <span className="inline-flex items-center gap-1 text-xs text-primary font-medium mt-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        Vérifié
                      </span>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-6 bg-gray-50/50"
                >
                  {messagesLoading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent border-primary mx-auto"></div>
                      <p className="mt-2 text-gray-600 text-sm">Chargement des messages...</p>
                    </div>
                  ) : messages.length > 0 ? (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.senderId === user?.id;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[70%] px-4 py-2 rounded-lg ${
                                isOwn
                                  ? 'bg-primary text-white rounded-br-sm'
                                  : 'bg-white text-gray-900 border border-gray-200 rounded-bl-sm'
                              }`}
                            >
                              <p className={`text-sm ${isOwn ? 'text-white' : 'text-gray-900'}`}>
                                {msg.content}
                              </p>
                              <p className={`text-xs mt-1 ${isOwn ? 'text-white/70' : 'text-gray-500'}`}>
                                {new Date(msg.createdAt).toLocaleTimeString('fr-FR', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  ) : (
                    <div className="text-center py-12 px-4 animate-fade-in">
                      <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-600 text-sm font-medium mb-2">
                        {selectedConversation?.startsWith('temp-') ? 'Nouvelle conversation' : 'Aucun message'}
                      </p>
                      {selectedConversation?.startsWith('temp-') && displayProperty?.title ? (
                        <div className="max-w-md mx-auto">
                          <p className="text-gray-600 text-sm mb-3">
                            Vous allez contacter le bailleur concernant :
                          </p>
                          <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-4">
                            <h4 className="font-medium text-gray-900 mb-1">{displayProperty.title}</h4>
                            {displayAgentInfo && (
                              <p className="text-sm text-gray-600">
                                {displayAgentInfo.firstName} {displayAgentInfo.lastName}
                              </p>
                            )}
                          </div>
                          <p className="text-gray-500 text-xs">
                            Envoyez un message pour commencer la conversation
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-xs mt-1">Envoyez le premier message</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Input */}
                <div className="p-4 border-t border-gray-200">
                  <form onSubmit={handleSend} className="flex gap-3">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez un message..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm transition-smooth"
                      disabled={sending}
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gray-50/30">
                <div className="text-center">
                  <MessageCircle className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Sélectionnez une conversation</h3>
                  <p className="text-gray-600 text-sm">Choisissez une conversation pour commencer à discuter</p>
                </div>
              </div>
            )}
          </div>
      </div>
    </Layout>
  );
}
