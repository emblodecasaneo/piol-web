import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { apiService } from '../api/api';
import { ArrowLeft, Send, User as UserIcon } from 'lucide-react';
import { useToast } from '../contexts/ToastContext';
import { useAuth } from '../contexts/AuthContext';

interface Message {
  id: string;
  content: string;
  senderId: string;
  recipientId: string;
  propertyId?: string;
  createdAt: string;
  read: boolean;
}

export default function ConversationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState('');
  const [otherUser, setOtherUser] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (id) {
      loadConversation();
    }
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadConversation = async () => {
    try {
      setLoading(true);
      if (id) {
        const response = await apiService.getConversation(id);
        setMessages(response.messages || []);
        
        // Récupérer les infos de l'autre utilisateur depuis les messages
        if (response.messages && response.messages.length > 0) {
          const firstMessage = response.messages[0];
          const otherUserId = firstMessage.senderId === user?.id ? firstMessage.recipientId : firstMessage.senderId;
          
          // Pour l'instant, on simule (à adapter selon votre API)
          setOtherUser({ id: otherUserId, firstName: 'Agent', lastName: '' });
        } else {
          setOtherUser({ id, firstName: 'Agent', lastName: '' });
        }
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
      toast.showError('Erreur lors du chargement de la conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || !id) return;

    try {
      setSending(true);
      await apiService.sendMessage({
        recipientId: id,
        content: message.trim(),
      });
      setMessage('');
      await loadConversation();
    } catch (error) {
      console.error('Error sending message:', error);
      toast.showError('Erreur lors de l\'envoi du message');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <Layout showHero={false}>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHero={false}>
      <div className="flex flex-col h-[calc(100vh-200px)] w-full px-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-4 p-4 flex items-center gap-4">
          <button
            onClick={() => navigate('/messages')}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              {otherUser?.avatar ? (
                <img
                  src={otherUser.avatar}
                  alt={otherUser.firstName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <UserIcon className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h1 className="font-medium text-gray-900 text-sm">
                {otherUser?.firstName} {otherUser?.lastName}
              </h1>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="space-y-4">
          {messages.map((msg) => {
            const isOwn = msg.senderId === user?.id;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-md px-4 py-2 rounded-lg ${
                    isOwn
                      ? 'bg-primary text-white'
                      : 'bg-white text-gray-900 border border-gray-200'
                  }`}
                >
                  <p>{msg.content}</p>
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
        </div>

        {/* Input */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mt-4 p-4">
          <form onSubmit={handleSend} className="flex gap-4">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Tapez un message..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
              disabled={sending}
            />
            <button
              type="submit"
              disabled={!message.trim() || sending}
              className="px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Send className="w-5 h-5" />
              {sending ? 'Envoi...' : 'Envoyer'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
}

