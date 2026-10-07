import { useState, useEffect } from 'react';
import {
  getMessageRoleStyle,
  getRoleDisplayName,
  normalizeRole,
  peutSupprimerMessage
} from '../services/roles';
import { useAuth } from '../context/AuthContext';
import {
  getMessagesPartage,
  publierMessagePartage,
  supprimerMessagePartage,
} from '../services/api';

function convertirMessagePartage(message, currentUser) {
  const nomAuteur = message.auteur_nom || message.utilisateur?.nom || 'Utilisateur';
  const senderId = message.auteur_id ?? message.utilisateur_id ?? message.user_id;
  const dateMessage = message.created_at || message.date;
  const date = dateMessage ? new Date(dateMessage) : null;

  return {
    id: message.id ?? message._id,
    senderId,
    senderFirstName: message.auteur_prenom || nomAuteur,
    senderLastName: message.auteur_prenom ? (message.auteur_nom || '') : '',
    senderRole: message.auteur_role || message.role ||
      (senderId === currentUser?.id ? currentUser.role : 'MEMBRE'),
    text: message.contenu ?? message.message ?? '',
    tab: 'general',
    timestamp: date && !Number.isNaN(date.getTime())
      ? date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      : '',
  };
}

export default function EspacePartage() {
  const { utilisateurConnecte: currentUser } = useAuth();
  const [chargementMessages, setChargementMessages] = useState(true);
  const [erreurMessages, setErreurMessages] = useState('');

  // Onglet de chat actif : 'projet' | 'general' | 'annonces'
  const [activeTab, setActiveTab] = useState('projet');

  // Compteurs de messages non lus (Style WhatsApp avec pastilles rouges)
  const [unreadCounts, setUnreadCounts] = useState({
    projet: 2,   // 2 messages non lus par exemple
    general: 1,  // 1 message non lu
    annonces: 0
  });

  // Les messages projet et annonces restent locaux tant que l'API ne gère pas ces canaux.
  const [messages, setMessages] = useState([
    {
      id: 2,
      senderId: 'user-chef',
      senderFirstName: 'Ali',
      senderLastName: 'Pouye',
      senderRole: 'CHEF_DE_PROJET',
      text: 'Lancement du module React aujourd’hui. Équipe, tenez-vous prête !',
      tab: 'projet',
      timestamp: '09:30'
    },
    {
      id: 3,
      senderId: 'user-souschef',
      senderFirstName: 'Awa',
      senderLastName: 'Diop',
      senderRole: 'SOUS_CHEF_DE_PROJET',
      text: 'Tout est validé pour l’Espace de Partage !',
      tab: 'projet',
      timestamp: '09:35'
    },
    {
      id: 4,
      senderId: 'user-superadmin',
      senderFirstName: 'Rawane',
      senderLastName: 'Koné Niassy',
      senderRole: 'SUPER_ADMIN',
      text: 'Mise à jour système effectuée avec succès !',
      tab: 'annonces',
      timestamp: '08:00'
    }
  ]);

  const [newMessageText, setNewMessageText] = useState('');

  const chargerMessagesPartage = async () => {
    try {
      const data = await getMessagesPartage();
      if (!Array.isArray(data)) {
        throw new Error("Le serveur a renvoyé une liste de messages invalide.");
      }
      setMessages((messagesActuels) => [
        ...messagesActuels.filter((message) => message.tab !== 'general'),
        ...data.map((message) => convertirMessagePartage(message, currentUser)),
      ]);
      setErreurMessages('');
    } catch (error) {
      setErreurMessages(error.message || "Impossible de charger les messages.");
      console.error("Erreur de chargement des messages :", error);
    } finally {
      setChargementMessages(false);
    }
  };

  useEffect(() => {
    let annule = false;

    const chargerMessagesInitiales = async () => {
      try {
        const data = await getMessagesPartage();
        if (!Array.isArray(data)) {
          throw new Error("Le serveur a renvoyé une liste de messages invalide.");
        }
        if (annule) return;
        setMessages((messagesActuels) => [
          ...messagesActuels.filter((message) => message.tab !== 'general'),
          ...data.map((message) => convertirMessagePartage(message, currentUser)),
        ]);
        setErreurMessages('');
      } catch (error) {
        if (!annule) {
          setErreurMessages(error.message || "Impossible de charger les messages.");
          console.error("Erreur de chargement des messages :", error);
        }
      } finally {
        if (!annule) setChargementMessages(false);
      }
    };

    chargerMessagesInitiales();
    return () => {
      annule = true;
    };
  }, [currentUser]);

  // Changement d'onglet : réinitialise instantanément la pastille de notification WhatsApp
  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    setUnreadCounts(prev => ({ ...prev, [tabName]: 0 }));
  };

  // Envoi d'un nouveau message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    const contenu = newMessageText.trim();
    if (!contenu) return;

    // Seul le Super Admin a le droit d'écrire dans le canal 'annonces'
    if (activeTab === 'annonces' && normalizeRole(currentUser?.role) !== 'SUPER_ADMIN') {
      alert("Seul le Super Administrateur peut poster des annonces.");
      return;
    }

    if (activeTab === 'general') {
      try {
        await publierMessagePartage(contenu);
        setNewMessageText('');
        setChargementMessages(true);
        await chargerMessagesPartage();
      } catch (error) {
        setErreurMessages(error.message || "Impossible de publier le message.");
      }
      return;
    }

    const msg = {
      id: Date.now(),
      senderId: currentUser?.id,
      senderFirstName: currentUser?.prenom || currentUser?.nom || 'Utilisateur',
      senderLastName: currentUser?.prenom ? (currentUser?.nom || '') : '',
      senderRole: currentUser?.role || 'MEMBRE',
      text: contenu,
      tab: activeTab,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, msg]);
    setNewMessageText('');
  };

  // Suppression hiérarchique de message
  const handleDeleteMessage = async (message) => {
    if (message.tab === 'general') {
      try {
        await supprimerMessagePartage(message.id);
      } catch (error) {
        setErreurMessages(error.message || "Impossible de supprimer le message.");
        return;
      }
    }
    setMessages((prev) => prev.filter((item) => item.id !== message.id));
  };

  // Filtrage des messages pour l'canal/onglet actif
  const filteredMessages = messages.filter(m => m.tab === activeTab);

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6">

      {/* En-tête de l'Espace de Partage */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">💬 Espace de Partage & Chat</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Discutez en temps réel selon votre projet, votre équipe et votre rôle.
          </p>
        </div>

        {/* Badge du rôle de l'utilisateur connecté */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">Connecté en tant que :</span>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${getMessageRoleStyle(currentUser?.role)}`}>
            {currentUser?.prenom || currentUser?.nom || currentUser?.email || 'Utilisateur'} ({getRoleDisplayName(currentUser?.role)})
          </span>
        </div>
      </div>

      {/* BOÎTE PRINCIPALE DU CHAT */}
      <div className="flex flex-col h-[620px] border border-gray-200 dark:border-gray-700 rounded-2xl bg-gray-50 dark:bg-gray-900 shadow-md overflow-hidden">

        {/* BARRE D'ONGLETS - INSPIRÉ DE LORDS MOBILE */}
        <div className="flex flex-wrap bg-gray-200 dark:bg-gray-800 p-2 gap-2 border-b border-gray-300 dark:border-gray-700">

          {/* Onglet Chat Projet (Isolé par projet) */}
          <button
            onClick={() => handleTabChange('projet')}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'projet'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700'
            }`}
          >
            <span>📁 Chat du Projet</span>
            {unreadCounts.projet > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                {unreadCounts.projet}
              </span>
            )}
          </button>

          {/* Onglet Chat Général (Toute l'organisation/Admin) */}
          <button
            onClick={() => handleTabChange('general')}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'general'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700'
            }`}
          >
            <span>🌐 Discussion Générale</span>
            {unreadCounts.general > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                {unreadCounts.general}
              </span>
            )}
          </button>

          {/* Onglet Annonces (Super Admin) */}
          <button
            onClick={() => handleTabChange('annonces')}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              activeTab === 'annonces'
                ? 'bg-amber-500 text-white shadow-md'
                : 'bg-white/80 dark:bg-gray-700/80 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-700'
            }`}
          >
            <span>📢 Annonces Officieuses</span>
            {unreadCounts.annonces > 0 && (
              <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full animate-bounce">
                {unreadCounts.annonces}
              </span>
            )}
          </button>
        </div>

        {/* ZONE DE LISTE DES MESSAGES */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {erreurMessages && activeTab === 'general' && (
            <p role="alert" className="mb-3 text-sm text-red-600 dark:text-red-400">
              {erreurMessages}
            </p>
          )}
          {activeTab === 'general' && chargementMessages && filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
              <p>Chargement des messages...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 text-sm">
              <span className="text-3xl mb-2">📭</span>
              <p>Aucun message dans ce canal pour le moment.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isMe = msg.senderId === currentUser?.id;
              const canDelete = peutSupprimerMessage(
                currentUser?.role
              );

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  {/* Bulle de message colorée selon le rôle */}
                  <div className={`max-w-[80%] md:max-w-[65%] p-3.5 rounded-2xl border shadow-sm transition-all ${getMessageRoleStyle(msg.senderRole)}`}>

                    {/* Nom + Prénom + Rôle visible sur chaque message */}
                    <div className="flex items-center justify-between gap-4 text-xs border-b border-black/10 dark:border-white/10 pb-1 mb-1.5 font-bold">
                      <span>{msg.senderFirstName} {msg.senderLastName}</span>
                      <span className="text-[10px] uppercase tracking-wider opacity-80 px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">
                        {getRoleDisplayName(msg.senderRole)}
                      </span>
                    </div>

                    {/* Texte du message */}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                    {/* Pied du message : Heure + Bouton Supprimer hiérarchique */}
                    <div className="flex items-center justify-between text-[10px] opacity-70 mt-2 gap-4">
                      <span>{msg.timestamp}</span>

                      {canDelete && (
                        <button
                          onClick={() => handleDeleteMessage(msg)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-bold ml-2 underline transition-colors"
                          title="Supprimer selon les règles de permission"
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* ZONE DE SAISIE DE MESSAGE */}
        {activeTab === 'annonces' && normalizeRole(currentUser?.role) !== 'SUPER_ADMIN' ? (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-t border-amber-200 dark:border-amber-800/50 text-center text-xs font-medium">
            🔒 Canal de diffusion réservé au Super Administrateur. Seul le Super Admin peut écrire ici.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="p-3 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 flex gap-2">
            <input
              type="text"
              value={newMessageText}
              onChange={(e) => setNewMessageText(e.target.value)}
              placeholder={`Écrire dans ${activeTab === 'projet' ? 'le chat projet' : activeTab === 'general' ? 'le chat général' : 'annonces'}...`}
              className="flex-1 px-4 py-2.5 text-sm border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-white"
            />
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm"
            >
              Envoyer
            </button>
          </form>
        )}

      </div>
    </div>
  );
}