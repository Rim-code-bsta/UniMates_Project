import React, { useState } from 'react';
import { Volume2, VolumeX, Eye, LogOut, Beaker } from 'lucide-react';
import { User } from '../types';
import { simulateIncomingMessage, simulateIncomingRequest } from '../services/dbService';

interface SettingsProps {
  currentUser: User | null;
  onLogout: () => void;
}

const Settings: React.FC<SettingsProps> = ({ currentUser, onLogout }) => {
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [highContrast, setHighContrast] = useState(false);

  // Apply High Contrast Mock (In a real app, this would toggle a CSS class on body)
  const toggleContrast = () => {
    setHighContrast(!highContrast);
    // document.body.classList.toggle('high-contrast');
  };

  return (
    <div className="p-6 pb-24 max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">Settings</h1>

      <div className="space-y-6">
        
        {/* Accessibility Section */}
        <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Accessibility</h2>
          
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${ttsEnabled ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                {ttsEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">Text-to-Speech</h3>
                <p className="text-xs text-slate-500">Read profile and messages aloud</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={ttsEnabled} onChange={() => setTtsEnabled(!ttsEnabled)} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="border-t border-slate-50 my-2"></div>

          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${highContrast ? 'bg-primary-100 text-primary-600' : 'bg-slate-100 text-slate-500'}`}>
                <Eye size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-800">High Contrast</h3>
                <p className="text-xs text-slate-500">Increase visibility of text</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={highContrast} onChange={toggleContrast} />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>
        </div>

        {/* Demo Tools */}
        {currentUser && (
            <div className="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 shadow-sm">
                <h2 className="text-sm font-bold text-indigo-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Beaker size={16} /> Demo Tools
                </h2>
                <div className="space-y-3">
                    <button 
                        onClick={() => simulateIncomingMessage(currentUser.id)}
                        className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl border border-indigo-200 shadow-sm hover:bg-indigo-100 transition-all text-sm"
                    >
                        Simulate Incoming Message
                    </button>
                    <button 
                        onClick={() => simulateIncomingRequest(currentUser.id)}
                        className="w-full py-3 bg-white text-indigo-600 font-bold rounded-xl border border-indigo-200 shadow-sm hover:bg-indigo-100 transition-all text-sm"
                    >
                        Simulate Match Request
                    </button>
                </div>
            </div>
        )}

        {/* Account Actions */}
        <button 
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl border border-red-200 text-red-600 font-bold hover:bg-red-50 transition-colors bg-white shadow-sm"
        >
          <LogOut size={20} />
          Sign Out
        </button>

        <p className="text-center text-xs text-slate-400 mt-6">
          UniMates v1.0.0 • Made for AUI
        </p>
      </div>
    </div>
  );
};

export default Settings;