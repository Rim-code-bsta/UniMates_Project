import React, { useEffect, useState } from 'react';
import { User, MatchPurpose, MatchRequest } from '../types';
import { getUsers, getMatches, sendMatchRequest } from '../services/dbService';
import { generateMatchReason } from '../services/geminiService';
import { Check, X, Volume2, MapPin, Sparkles, Search, SlidersHorizontal, BookOpen, Dumbbell, Coffee, Lightbulb } from 'lucide-react';

interface HomeProps {
  currentUser: User;
}

const Home: React.FC<HomeProps> = ({ currentUser }) => {
  const [potentialMatches, setPotentialMatches] = useState<(User & { matchReason?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [filterPurpose, setFilterPurpose] = useState<MatchPurpose | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    const fetchMatches = async () => {
      setLoading(true);
      const allUsers = getUsers();
      const existingMatches = getMatches();

      // Filter out self and already matched/requested users
      const availableUsers = allUsers.filter(u => {
        if (u.id === currentUser.id) return false;
        if (u.role === 'ADMIN') return false; // Hide admins
        const hasInteraction = existingMatches.some(m => 
          (m.senderId === currentUser.id && m.receiverId === u.id) ||
          (m.senderId === u.id && m.receiverId === currentUser.id)
        );
        return !hasInteraction;
      });

      // Filter by Purpose
      let filtered = availableUsers.filter(u => {
        if (filterPurpose === 'ALL') return true;
        return u.purposes.includes(filterPurpose);
      });

      // Filter by Search Query (Name, Major, Interests)
      if (searchQuery.trim()) {
          const lowerQuery = searchQuery.toLowerCase();
          filtered = filtered.filter(u => 
             u.fullName.toLowerCase().includes(lowerQuery) ||
             u.major.toLowerCase().includes(lowerQuery) ||
             u.interests.some(i => i.toLowerCase().includes(lowerQuery))
          );
      }

      // Sort by shared interests count
      const sorted = filtered.sort((a, b) => {
        const aCommon = a.interests.filter(i => currentUser.interests.includes(i)).length;
        const bCommon = b.interests.filter(i => currentUser.interests.includes(i)).length;
        return bCommon - aCommon;
      });

      // Generate AI Reasons for top 3
      const enhancedUsers = await Promise.all(sorted.slice(0, 5).map(async (u) => {
        const commonPurpose = u.purposes.find(p => currentUser.purposes.includes(p)) || u.purposes[0];
        const reason = await generateMatchReason(currentUser, u, commonPurpose);
        return { ...u, matchReason: reason };
      }));

      setPotentialMatches(enhancedUsers);
      setLoading(false);
      setActiveIndex(0); // Reset index on filter change
    };

    // Debounce search
    const timer = setTimeout(() => {
        fetchMatches();
    }, 500);

    return () => clearTimeout(timer);
  }, [currentUser, filterPurpose, searchQuery]);

  const handleAction = (action: 'accept' | 'decline') => {
    if (processing) return;
    setProcessing(true);
    const targetUser = potentialMatches[activeIndex];

    if (action === 'accept') {
      // Find the most relevant shared purpose
      const purpose = targetUser.purposes.find(p => currentUser.purposes.includes(p)) || targetUser.purposes[0];
      sendMatchRequest(currentUser.id, targetUser.id, purpose, targetUser.matchReason);
    }

    setTimeout(() => {
      setActiveIndex(prev => prev + 1);
      setProcessing(false);
    }, 300); // Visual delay
  };

  const handleSpeak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-500 font-medium">Finding your mates...</p>
      </div>
    );
  }

  const activeProfile = potentialMatches[activeIndex];

  return (
    <div className="p-4 pb-24 max-w-md mx-auto h-screen flex flex-col">
      {/* Search Bar */}
      <div className="mb-4 relative z-20">
        <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Search by major, name, or interest..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl shadow-sm outline-none focus:ring-2 focus:ring-primary-500 text-sm"
            />
        </div>
      </div>

      {/* Filter Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar z-20">
        <button 
            onClick={() => setFilterPurpose('ALL')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${filterPurpose === 'ALL' ? 'bg-slate-900 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
        >
            All Matches
        </button>
        {[MatchPurpose.STUDY, MatchPurpose.GYM, MatchPurpose.HANGOUT, MatchPurpose.PROJECT].map(p => (
             <button 
                key={p}
                onClick={() => setFilterPurpose(p)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${filterPurpose === p ? 'bg-primary-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200'}`}
            >
                {p === MatchPurpose.STUDY && <BookOpen size={12}/>}
                {p === MatchPurpose.GYM && <Dumbbell size={12}/>}
                {p === MatchPurpose.HANGOUT && <Coffee size={12}/>}
                {p === MatchPurpose.PROJECT && <Lightbulb size={12}/>}
                {p}
            </button>
        ))}
      </div>

      {/* Match Card Stack */}
      <div className="flex-1 relative w-full mt-2">
        {!activeProfile ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8 bg-white/50 border border-dashed border-slate-300 rounded-3xl">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <Search className="text-slate-400" size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">No matches found</h3>
                <p className="text-slate-500 text-sm">
                    {searchQuery ? 'Try adjusting your search terms.' : 'Try changing your filter or come back later!'}
                </p>
                {filterPurpose !== 'ALL' && (
                    <button 
                        onClick={() => setFilterPurpose('ALL')}
                        className="mt-6 px-6 py-3 bg-white border border-slate-200 rounded-xl text-slate-700 font-bold shadow-sm hover:bg-slate-50"
                    >
                        Clear Filters
                    </button>
                )}
            </div>
        ) : (
            <div className="relative h-full animate-fade-in">
                {/* Main Card */}
                <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col">
                    {/* Image Area */}
                    <div className="h-3/5 relative bg-slate-200">
                        <img 
                            src={`https://picsum.photos/seed/${activeProfile.id}/500/600`} 
                            className="w-full h-full object-cover" 
                            alt={activeProfile.fullName} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-transparent to-transparent"></div>
                        
                        <div className="absolute bottom-0 left-0 p-6 text-white w-full">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-3xl font-bold flex items-center gap-2">
                                        {activeProfile.fullName}
                                        {activeProfile.isVerified && <Sparkles size={20} className="text-blue-400" />}
                                    </h2>
                                    <p className="text-lg opacity-90 font-medium flex items-center gap-1">
                                        <MapPin size={16} /> {activeProfile.major}
                                    </p>
                                    <p className="text-sm opacity-75">{activeProfile.yearOfStudy}</p>
                                </div>
                                <button 
                                    onClick={() => handleSpeak(`${activeProfile.fullName}, ${activeProfile.major}. ${activeProfile.matchReason}`)}
                                    className="p-3 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/30 transition-colors"
                                >
                                    <Volume2 size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 p-6 flex flex-col justify-between">
                        <div>
                             {/* AI Reason Badge */}
                            {activeProfile.matchReason && (
                                <div className="bg-gradient-to-r from-primary-50 to-secondary-50 border border-primary-100 p-3 rounded-xl mb-4">
                                    <p className="text-xs font-bold text-primary-600 uppercase mb-1 flex items-center gap-1">
                                        <Sparkles size={12}/> Smart Match Analysis
                                    </p>
                                    <p className="text-slate-800 text-sm font-medium leading-snug">
                                        "{activeProfile.matchReason}"
                                    </p>
                                </div>
                            )}

                            {/* Interests */}
                            <div className="flex flex-wrap gap-2 mb-2">
                                {activeProfile.interests.slice(0, 4).map(int => (
                                    <span key={int} className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wide">
                                        {int}
                                    </span>
                                ))}
                                {activeProfile.interests.length > 4 && (
                                    <span className="px-3 py-1 bg-slate-100 text-slate-400 rounded-lg text-xs font-bold">
                                        +{activeProfile.interests.length - 4}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <button 
                                onClick={() => handleAction('decline')}
                                className="py-4 rounded-2xl border-2 border-slate-200 text-slate-500 font-bold hover:bg-slate-50 hover:border-slate-300 transition-all flex items-center justify-center gap-2"
                            >
                                <X size={24} /> Decline
                            </button>
                            <button 
                                onClick={() => handleAction('accept')}
                                className="py-4 rounded-2xl bg-slate-900 text-white font-bold shadow-xl shadow-slate-900/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            >
                                <Check size={24} /> Connect
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
      </div>
    </div>
  );
};

export default Home;