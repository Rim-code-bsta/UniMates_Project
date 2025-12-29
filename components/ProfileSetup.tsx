import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MatchPurpose } from '../types';
import { updateUserProfile } from '../services/dbService';
import { Dumbbell, BookOpen, Coffee, Lightbulb, Plus, X, ArrowLeft } from 'lucide-react';

interface ProfileSetupProps {
  user: User;
  onUpdateUser: (user: User) => void;
}

const ProfileSetup: React.FC<ProfileSetupProps> = ({ user, onUpdateUser }) => {
  const [step, setStep] = useState(1);
  const [selectedPurposes, setSelectedPurposes] = useState<MatchPurpose[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [currentInterest, setCurrentInterest] = useState('');
  const [bio, setBio] = useState('');
  const navigate = useNavigate();

  // Load existing data if editing
  useEffect(() => {
    if (user.purposes && user.purposes.length > 0) {
        setSelectedPurposes(user.purposes);
    }
    if (user.interests && user.interests.length > 0) {
        setInterests(user.interests);
    }
    if (user.bio) {
        setBio(user.bio);
    }
  }, [user]);

  const togglePurpose = (purpose: MatchPurpose) => {
    setSelectedPurposes(prev => 
      prev.includes(purpose) 
        ? prev.filter(p => p !== purpose)
        : [...prev, purpose]
    );
  };

  const addInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentInterest && !interests.includes(currentInterest)) {
      setInterests([...interests, currentInterest]);
      setCurrentInterest('');
    }
  };

  const removeInterest = (interest: string) => {
    setInterests(interests.filter(i => i !== interest));
  };

  const handleFinish = () => {
    const updatedUser = updateUserProfile(user.id, {
      purposes: selectedPurposes,
      interests,
      bio
    });
    onUpdateUser(updatedUser);
    navigate('/profile'); // Redirect to profile page after edit
  };

  const purposes = [
    { id: MatchPurpose.STUDY, icon: BookOpen, label: 'Study Partner', desc: 'Ace your exams together' },
    { id: MatchPurpose.GYM, icon: Dumbbell, label: 'Gym Buddy', desc: 'Stay fit and motivated' },
    { id: MatchPurpose.HANGOUT, icon: Coffee, label: 'Hangout', desc: 'Coffee, lunch, or chilling' },
    { id: MatchPurpose.PROJECT, icon: Lightbulb, label: 'Project', desc: 'Build something cool' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-6 px-6 pb-24 max-w-xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/profile')} className="p-2 hover:bg-slate-200 rounded-full">
            <ArrowLeft size={20} className="text-slate-600"/>
        </button>
        <h1 className="text-xl font-bold text-slate-800">Edit Profile</h1>
      </div>

      <div className="w-full bg-gray-200 h-2 rounded-full mb-8">
        <div 
          className="bg-primary-600 h-2 rounded-full transition-all duration-500" 
          style={{ width: `${(step / 3) * 100}%` }}
        />
      </div>

      {step === 1 && (
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">What are you looking for?</h2>
          <p className="text-slate-500 mb-6">Select all that apply. This helps us find the best matches.</p>
          
          <div className="grid grid-cols-1 gap-4">
            {purposes.map((p) => {
              const isSelected = selectedPurposes.includes(p.id);
              return (
                <button
                  key={p.id}
                  onClick={() => togglePurpose(p.id)}
                  className={`flex items-center gap-4 p-4 rounded-2xl border-2 transition-all text-left ${
                    isSelected 
                      ? 'border-primary-500 bg-primary-50' 
                      : 'border-white bg-white hover:border-slate-200 shadow-sm'
                  }`}
                >
                  <div className={`p-3 rounded-full ${isSelected ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                    <p.icon size={24} />
                  </div>
                  <div>
                    <h3 className={`font-bold ${isSelected ? 'text-primary-900' : 'text-slate-800'}`}>{p.label}</h3>
                    <p className="text-sm text-slate-500">{p.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setStep(2)}
            disabled={selectedPurposes.length === 0}
            className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-xl disabled:opacity-50"
          >
            Next Step
          </button>
        </div>
      )}

      {step === 2 && (
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">What are your interests?</h2>
          <p className="text-slate-500 mb-6">Add at least 3 interests (e.g., Anime, Chess, Coding).</p>

          <form onSubmit={addInterest} className="mb-6">
            <div className="relative">
              <input
                type="text"
                value={currentInterest}
                onChange={(e) => setCurrentInterest(e.target.value)}
                placeholder="Type and press enter..."
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              />
              <button 
                type="submit" 
                disabled={!currentInterest}
                className="absolute right-2 top-2 p-1.5 bg-slate-900 text-white rounded-lg disabled:opacity-50"
              >
                <Plus size={20} />
              </button>
            </div>
          </form>

          <div className="flex flex-wrap gap-2 mb-8">
            {interests.map((int) => (
              <span key={int} className="px-3 py-1.5 bg-white border border-slate-200 rounded-full text-slate-700 text-sm font-medium flex items-center gap-1 shadow-sm">
                {int}
                <button onClick={() => removeInterest(int)} className="text-slate-400 hover:text-red-500">
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>

          <div className="flex gap-4">
             <button
                onClick={() => setStep(1)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-xl"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={interests.length < 3}
                className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-xl disabled:opacity-50"
              >
                Next Step
              </button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="animate-slide-up">
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Almost done!</h2>
          <p className="text-slate-500 mb-6">Write a short bio to introduce yourself.</p>

          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Hi! I'm a CS student looking for..."
            className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-primary-500 bg-white resize-none"
          />

           <div className="flex gap-4 mt-8">
             <button
                onClick={() => setStep(2)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-bold py-4 rounded-xl"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                disabled={bio.length < 10}
                className="flex-[2] bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary-500/30"
              >
                Save Profile
              </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileSetup;