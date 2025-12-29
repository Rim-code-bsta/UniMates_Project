import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User } from '../types';
import { Edit2 } from 'lucide-react';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 pb-24">
        <div className="text-center mb-8 relative">
            <div className="w-28 h-28 bg-slate-200 rounded-full mx-auto mb-4 overflow-hidden border-4 border-white shadow-lg relative group">
                <img src={`https://picsum.photos/seed/${user.id}/200/200`} alt="Profile" className="w-full h-full object-cover" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">{user.fullName}</h2>
            <p className="text-slate-500">{user.email}</p>
            
            <div className="mt-3 flex justify-center gap-2">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase tracking-wide">
                    Verified Student
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold uppercase tracking-wide">
                    {user.major}
                </span>
            </div>

            <button 
                onClick={() => navigate('/setup')}
                className="absolute top-0 right-0 p-2 bg-slate-100 text-slate-600 rounded-full hover:bg-slate-200 transition-colors"
                title="Edit Profile"
            >
                <Edit2 size={18} />
            </button>
        </div>
        
        <div className="space-y-4">
            <button 
                onClick={() => navigate('/setup')}
                className="w-full py-3 bg-slate-900 text-white font-bold rounded-xl shadow-lg shadow-slate-900/20 hover:scale-[1.01] transition-transform flex items-center justify-center gap-2"
            >
                <Edit2 size={16} /> Edit Profile
            </button>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider opacity-70">My Purposes</h3>
                <div className="flex gap-2 flex-wrap">
                    {user.purposes.map(p => <span key={p} className="text-sm bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg">{p}</span>)}
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider opacity-70">My Interests</h3>
                <div className="flex gap-2 flex-wrap">
                    {user.interests.map(i => <span key={i} className="text-sm bg-slate-50 border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg">{i}</span>)}
                </div>
            </div>

            {user.bio && (
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-700 mb-3 text-sm uppercase tracking-wider opacity-70">My Bio</h3>
                    <p className="text-slate-600 italic">"{user.bio}"</p>
                </div>
            )}
            
            <button 
                onClick={onLogout}
                className="w-full py-4 mt-4 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors"
            >
                Sign Out
            </button>
        </div>
    </div>
  );
};

export default Profile;