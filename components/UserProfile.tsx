import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, MatchPurpose } from '../types';
import { getUserById } from '../services/dbService';
import { ArrowLeft, MapPin, Sparkles } from 'lucide-react';

interface UserProfileProps {
  currentUser: User;
}

const UserProfile: React.FC<UserProfileProps> = ({ currentUser }) => {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (userId) {
        const foundUser = getUserById(userId);
        setUser(foundUser || null);
    }
  }, [userId]);

  if (!user) return <div className="p-10 text-center text-slate-500">User not found</div>;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Header Image */}
      <div className="h-64 relative">
        <img 
            src={`https://picsum.photos/seed/${user.id}/500/500`} 
            alt="Profile Cover" 
            className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
        <button 
            onClick={() => navigate(-1)}
            className="absolute top-6 left-6 p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition-all"
        >
            <ArrowLeft size={20} />
        </button>
        <div className="absolute bottom-6 left-6 text-white">
            <h1 className="text-3xl font-bold">{user.fullName}</h1>
            <div className="flex items-center gap-2 mt-1 opacity-90 text-sm">
                <MapPin size={16} />
                <span>{user.major} • {user.yearOfStudy}</span>
            </div>
        </div>
      </div>

      <div className="p-6 -mt-6 bg-slate-50 rounded-t-3xl relative z-10 space-y-6">
        
        {/* Verification Badge */}
        {user.isVerified && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
                <Sparkles size={12} /> Verified Student
            </div>
        )}

        {/* Bio */}
        {user.bio && (
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About</h3>
                <p className="text-slate-700 italic">"{user.bio}"</p>
            </div>
        )}

        {/* Interests */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Interests</h3>
            <div className="flex flex-wrap gap-2">
                {user.interests.map(i => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium border border-slate-100">
                        {i}
                    </span>
                ))}
            </div>
        </div>

        {/* Purposes */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Looking For</h3>
            <div className="flex flex-wrap gap-2">
                {user.purposes.map(p => (
                    <span key={p} className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-lg text-sm font-medium border border-primary-100">
                        {p}
                    </span>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;