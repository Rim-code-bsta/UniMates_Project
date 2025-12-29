import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, MatchStatus, MatchRequest } from '../types';
import { getMatches, getUsers, updateMatchStatus } from '../services/dbService';
import { MessageCircle, Check, X, Clock } from 'lucide-react';

interface ChatListProps {
  currentUser: User;
}

const ChatList: React.FC<ChatListProps> = ({ currentUser }) => {
  const [activeMatches, setActiveMatches] = useState<(MatchRequest & { partner: User })[]>([]);
  const [pendingRequests, setPendingRequests] = useState<(MatchRequest & { partner: User })[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'messages' | 'requests'>('messages');

  const loadData = () => {
      // Don't set loading to true on polls to avoid flicker
      const allMatches = getMatches();
      const allUsers = getUsers();

      const userMatches = allMatches.filter(m => m.senderId === currentUser.id || m.receiverId === currentUser.id);

      const processed = userMatches.map(m => {
        const partnerId = m.senderId === currentUser.id ? m.receiverId : m.senderId;
        const partner = allUsers.find(u => u.id === partnerId);
        return { ...m, partner: partner! };
      }).filter(m => m.partner); // Safety check

      setPendingRequests(processed.filter(m => m.status === MatchStatus.PENDING && m.receiverId === currentUser.id));
      setActiveMatches(processed.filter(m => m.status === MatchStatus.ACCEPTED));
      setLoading(false);
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000); // Poll for updates
    return () => clearInterval(interval);
  }, [currentUser]);

  const handleRequest = (matchId: string, status: MatchStatus) => {
    updateMatchStatus(matchId, status);
    
    // Update local state immediately
    if (status === MatchStatus.ACCEPTED) {
        const match = pendingRequests.find(m => m.id === matchId);
        if (match) {
             setPendingRequests(prev => prev.filter(m => m.id !== matchId));
             setActiveMatches(prev => [...prev, { ...match, status: MatchStatus.ACCEPTED }]);
        }
    } else {
        setPendingRequests(prev => prev.filter(m => m.id !== matchId));
    }
  };

  return (
    <div className="p-4 pt-8 pb-24 max-w-md mx-auto min-h-screen">
      <h1 className="text-2xl font-bold text-slate-800 mb-6 px-2">Connections</h1>

      <div className="flex p-1 bg-slate-200 rounded-xl mb-6">
        <button
          onClick={() => setTab('messages')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${tab === 'messages' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
        >
          Messages
        </button>
        <button
          onClick={() => setTab('requests')}
          className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${tab === 'requests' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'}`}
        >
          Requests
          {pendingRequests.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">{pendingRequests.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center pt-10"><div className="w-8 h-8 border-4 border-primary-500 rounded-full animate-spin border-t-transparent"></div></div>
      ) : (
        <div className="space-y-4">
          {tab === 'requests' && (
            <>
              {pendingRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Clock className="mx-auto mb-3 opacity-50" size={40} />
                  <p>No pending requests.</p>
                </div>
              ) : (
                pendingRequests.map(match => (
                  <div key={match.id} className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col gap-3 animate-slide-up">
                    <div className="flex items-center gap-4">
                      <img src={`https://picsum.photos/seed/${match.partner.id}/100/100`} className="w-12 h-12 rounded-full object-cover" alt="" />
                      <div>
                        <h3 className="font-bold text-slate-800">{match.partner.fullName}</h3>
                        <p className="text-xs text-slate-500">{match.partner.major}</p>
                      </div>
                    </div>
                    
                    <div className="bg-slate-50 p-3 rounded-xl text-xs text-slate-600">
                      <span className="font-semibold block mb-1 text-primary-600">Reason for matching:</span>
                      {match.aiReasoning || `Looking for ${match.purpose}`}
                    </div>

                    <div className="flex gap-2 mt-1">
                      <button 
                        onClick={() => handleRequest(match.id, MatchStatus.DECLINED)}
                        className="flex-1 py-2 rounded-xl border border-slate-200 text-slate-500 font-semibold text-sm hover:bg-slate-50"
                      >
                        Decline
                      </button>
                      <button 
                         onClick={() => handleRequest(match.id, MatchStatus.ACCEPTED)}
                         className="flex-1 py-2 rounded-xl bg-slate-900 text-white font-semibold text-sm shadow-md shadow-slate-900/10"
                      >
                        Accept
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {tab === 'messages' && (
            <>
              {activeMatches.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <MessageCircle className="mx-auto mb-3 opacity-50" size={40} />
                  <p>No connections yet. Go match!</p>
                </div>
              ) : (
                activeMatches.map(match => (
                  <Link 
                    key={match.id} 
                    to={`/chat/${match.id}`}
                    className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-transparent hover:border-slate-200 transition-all shadow-sm"
                  >
                    <div className="relative">
                       <img src={`https://picsum.photos/seed/${match.partner.id}/100/100`} className="w-14 h-14 rounded-full object-cover" alt="" />
                       <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-slate-800 truncate">{match.partner.fullName}</h3>
                        <span className="text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full whitespace-nowrap">{match.purpose}</span>
                      </div>
                      <p className="text-sm text-slate-500 truncate mt-0.5">Tap to chat...</p>
                    </div>
                  </Link>
                ))
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatList;