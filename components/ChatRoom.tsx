import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, Message } from '../types';
import { getMatches, getUsers, getMessages, sendMessage, reportUser } from '../services/dbService';
import { generateIcebreaker } from '../services/geminiService';
import { ArrowLeft, Send, MoreVertical, Flag, Shield, X, AlertTriangle, Check, Loader2 } from 'lucide-react';

interface ChatRoomProps {
  currentUser: User;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ currentUser }) => {
  const { matchId } = useParams<{ matchId: string }>();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [partner, setPartner] = useState<User | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [icebreaker, setIcebreaker] = useState('');
  
  // Report Modal State
  const [isReportModalOpen, setReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('Harassment');
  const [reportDescription, setReportDescription] = useState('');
  const [reportPassword, setReportPassword] = useState('');
  const [reportError, setReportError] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const [submittingReport, setSubmittingReport] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!matchId) return;

    // Load initial data
    const loadData = () => {
        const matches = getMatches();
        const match = matches.find(m => m.id === matchId);
        if (!match) {
        navigate('/matches');
        return;
        }

        const partnerId = match.senderId === currentUser.id ? match.receiverId : match.senderId;
        const allUsers = getUsers();
        const foundPartner = allUsers.find(u => u.id === partnerId);
        setPartner(foundPartner || null);

        const msgs = getMessages(matchId);
        setMessages(msgs);
    };

    loadData();
    const interval = window.setInterval(loadData, 3000); // Poll for new messages

    return () => clearInterval(interval);
  }, [matchId, currentUser, navigate]);

  useEffect(() => {
    // Scroll to bottom on new messages
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    // Generate icebreaker if no messages
    if (messages.length === 0 && partner) {
      generateIcebreaker(partner.interests).then(setIcebreaker);
    }
  }, [partner, messages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !matchId) return;

    sendMessage(matchId, currentUser.id, newMessage);
    setNewMessage('');
    // Optimistic update
    setMessages(prev => [...prev, {
        id: `temp_${Date.now()}`,
        matchId,
        senderId: currentUser.id,
        content: newMessage,
        timestamp: new Date().toISOString(),
        read: false
    }]);
  };

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReportError('');
    setReportSuccess('');
    setSubmittingReport(true);

    if (!partner) return;

    // Simulate network delay for verification
    setTimeout(() => {
        try {
            reportUser(currentUser.id, partner.id, reportReason, reportDescription, reportPassword);
            setReportSuccess('User has been reported. Admins will review this case.');
            setReportDescription('');
            setReportPassword('');
            setTimeout(() => {
                setReportModalOpen(false);
                setReportSuccess('');
            }, 2000);
        } catch (err: any) {
            setReportError(err.message);
        } finally {
            setSubmittingReport(false);
        }
    }, 1000);
  };

  if (!partner) return <div className="p-10 text-center">Loading chat...</div>;

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-md mx-auto relative">
      {/* Header */}
      <div className="px-4 py-3 bg-white border-b border-slate-200 flex items-center justify-between shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/matches')} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <img src={`https://picsum.photos/seed/${partner.id}/100/100`} className="w-10 h-10 rounded-full object-cover" alt="" />
            <div>
              <h2 className="font-bold text-slate-800 leading-tight">{partner.fullName}</h2>
              <p className="text-xs text-slate-500">{partner.major}</p>
            </div>
          </div>
        </div>
        <div className="relative">
          <button onClick={() => setShowMenu(!showMenu)} className="p-2 hover:bg-slate-100 rounded-full text-slate-600">
            <MoreVertical size={20} />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 z-20 animate-fade-in">
              <button 
                onClick={() => { setShowMenu(false); setReportModalOpen(true); }}
                className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm font-medium"
              >
                <Flag size={16} /> Report User
              </button>
              <button 
                onClick={() => { setShowMenu(false); navigate(`/user/${partner.id}`); }}
                className="w-full px-4 py-3 text-left text-slate-600 hover:bg-slate-50 flex items-center gap-2 text-sm font-medium"
              >
                <Shield size={16} /> View Profile
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && icebreaker && (
          <div className="bg-gradient-to-r from-primary-50 to-secondary-50 p-4 rounded-xl border border-primary-100 mx-4 my-6 text-center">
            <p className="text-xs font-bold text-primary-600 uppercase mb-1">AI Icebreaker</p>
            <p className="text-slate-700 text-sm italic">"{icebreaker}"</p>
            <button 
              onClick={() => setNewMessage(icebreaker)}
              className="mt-3 text-xs bg-white border border-primary-200 text-primary-600 px-3 py-1.5 rounded-full font-semibold"
            >
              Use this starter
            </button>
          </div>
        )}

        {messages.map((msg) => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                isMe 
                  ? 'bg-primary-600 text-white rounded-br-none' 
                  : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 bg-slate-100 rounded-xl border-none outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          />
          <button 
            type="submit" 
            disabled={!newMessage.trim()}
            className="p-3 bg-slate-900 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-800 transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </form>

      {/* Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl overflow-hidden">
            <div className="bg-red-50 p-6 flex items-start gap-4 border-b border-red-100">
              <div className="p-3 bg-red-100 text-red-600 rounded-full">
                <AlertTriangle size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900">Report User</h3>
                <p className="text-sm text-red-700 mt-1">Help us keep the community safe.</p>
              </div>
              <button onClick={() => setReportModalOpen(false)} className="text-red-400 hover:text-red-700">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleReportSubmit} className="p-6 space-y-4">
              {reportError && (
                 <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl flex items-start gap-2 border border-red-100">
                    <AlertTriangle size={16} className="mt-0.5"/> {reportError}
                 </div>
              )}
              {reportSuccess && (
                 <div className="p-3 bg-green-50 text-green-600 text-sm rounded-xl flex items-start gap-2 border border-green-100">
                    <Check size={16} className="mt-0.5"/> {reportSuccess}
                 </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Reason</label>
                <select 
                  value={reportReason}
                  onChange={(e) => setReportReason(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500 outline-none"
                >
                  <option value="Harassment">Harassment</option>
                  <option value="Spam">Spam</option>
                  <option value="Inappropriate Content">Inappropriate Content</option>
                  <option value="Fake Profile">Fake Profile</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea 
                  value={reportDescription}
                  onChange={(e) => setReportDescription(e.target.value)}
                  placeholder="Please describe what happened..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500 outline-none resize-none h-24"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Your Password</label>
                <input 
                  type="password"
                  value={reportPassword}
                  onChange={(e) => setReportPassword(e.target.value)}
                  placeholder="Required for verification"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-red-500 outline-none"
                  required
                />
                <p className="text-[10px] text-slate-400 mt-1">We require password confirmation to prevent abuse.</p>
              </div>

              <button 
                type="submit"
                disabled={submittingReport || !!reportSuccess}
                className="w-full bg-red-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-red-600/20 hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
              >
                {submittingReport ? <Loader2 className="animate-spin" /> : 'Submit Report'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRoom;