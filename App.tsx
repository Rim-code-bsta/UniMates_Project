import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, BookOpen, Dumbbell, Coffee, Heart, Calendar, 
  MessageSquare, User as UserIcon, Settings, LogOut, 
  CheckCircle, XCircle, Mic, Volume2, Sparkles, Send, 
  ChevronRight, ArrowLeft, ShieldCheck, Bell 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ConnectionPurpose, Screen, Match, Message } from './types';
import { MAJORS, INTERESTS, MOCK_USERS, INITIAL_MESSAGES } from './constants';
import { generateIcebreaker } from './services/geminiService';

// --- Components ---

const Button = ({ children, onClick, variant = 'primary', className = '', ...props }: any) => {
  const baseStyle = "px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-200",
    secondary: "bg-white text-emerald-800 border-2 border-emerald-100 hover:border-emerald-200 hover:bg-emerald-50",
    ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
    danger: "bg-red-50 text-red-600 hover:bg-red-100"
  };
  
  return (
    <button onClick={onClick} className={`${baseStyle} ${variants[variant as keyof typeof variants]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ children, className = '', ...props }: any) => (
  <div className={`bg-white/80 backdrop-blur-md border border-white/20 shadow-xl rounded-2xl p-6 ${className}`} {...props}>
    {children}
  </div>
);

// --- Main App ---

export default function App() {
  // State
  const [currentScreen, setCurrentScreen] = useState<Screen>('landing');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeMatch, setActiveMatch] = useState<User | null>(null);
  const [isTTSActive, setIsTTSActive] = useState(false);
  const [messages, setMessages] = useState<Record<string, Message[]>>(INITIAL_MESSAGES);
  const [pendingIcebreaker, setPendingIcebreaker] = useState<string>('');
  const [matches, setMatches] = useState<Match[]>([]);
  const [notifications, setNotifications] = useState<string[]>([]);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    if (activeMatch && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, activeMatch]);

  // Accessibility: Text-to-Speech Helper
  const speak = (text: string) => {
    if (!isTTSActive || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utterance);
  };

  // Mock Login
  const handleLogin = (email: string) => {
    // Simulating auth
    if (email.endsWith('@aui.ma')) {
      // Check if user exists in mock DB (usually would be an API call)
      // For this demo, we create a new profile flow
      setCurrentScreen('onboarding');
      speak("Welcome to UniMates. Please set up your profile.");
    } else {
      alert("Please use a valid Al Akhawayn University email (@aui.ma)");
    }
  };

  // Onboarding Completion
  const completeOnboarding = (data: Partial<User>) => {
    const newUser: User = {
      id: 'current-user',
      name: data.name || 'Student',
      email: data.email || 'student@aui.ma',
      major: data.major || 'Undeclared',
      year: data.year || 'Freshman',
      purpose: data.purpose || ConnectionPurpose.SOCIAL,
      interests: data.interests || [],
      bio: data.bio || 'Ready to connect!',
      avatar: 'https://picsum.photos/200/200?random=1',
      isVerified: true
    };
    setCurrentUser(newUser);
    setCurrentScreen('dashboard');
    speak(`Welcome, ${newUser.name}. Your dashboard is ready.`);
    
    // Generate some mock matches based on purpose
    const relevantMatches = MOCK_USERS.filter(u => u.purpose === newUser.purpose || u.major === newUser.major).map(u => ({
        id: `match-${u.id}`,
        users: [newUser.id, u.id] as [string, string],
        status: 'pending' as const,
        createdAt: new Date(),
        matchScore: Math.floor(Math.random() * 20) + 80 // 80-99 score
    }));
    setMatches(relevantMatches);
    setNotifications([`We found ${relevantMatches.length} potential matches for you!`]);
  };

  // Chat Logic
  const sendMessage = (text: string) => {
    if (!activeMatch || !currentUser) return;
    const matchId = `match-${activeMatch.id}`; // Simple mock ID logic
    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: currentUser.id,
      text,
      timestamp: new Date()
    };
    
    setMessages(prev => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), newMessage]
    }));
  };

  const getGeminiIcebreaker = async () => {
    if (!currentUser || !activeMatch) return;
    setPendingIcebreaker("Thinking...");
    const suggestion = await generateIcebreaker(currentUser, activeMatch);
    setPendingIcebreaker(suggestion);
  };

  // --- Screens ---

  const LandingScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-emerald-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
      <div className="absolute top-[20%] right-[-10%] w-96 h-96 bg-teal-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="z-10 text-center max-w-lg"
      >
        <div className="bg-white p-4 rounded-3xl shadow-xl w-24 h-24 mx-auto mb-8 flex items-center justify-center">
            <Users className="w-12 h-12 text-emerald-600" />
        </div>
        <h1 className="text-5xl font-bold text-slate-800 mb-6 tracking-tight">
          Uni<span className="text-emerald-600">Mates</span>
        </h1>
        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
          Combat isolation and build meaningful connections at AUI. 
          Find your study partner, gym buddy, or social circle today.
        </p>
        
        <div className="bg-white/60 backdrop-blur-sm p-1 rounded-2xl shadow-lg inline-flex">
          <input 
            type="email" 
            placeholder="student@aui.ma" 
            className="bg-transparent px-6 py-3 outline-none text-slate-700 w-64 placeholder:text-slate-400"
            id="login-email"
          />
          <Button onClick={() => {
            const email = (document.getElementById('login-email') as HTMLInputElement).value;
            handleLogin(email);
          }}>
            Get Started
          </Button>
        </div>
        <p className="mt-4 text-xs text-slate-500 flex items-center justify-center gap-1">
          <ShieldCheck className="w-3 h-3" /> Verified University Access Only
        </p>
      </motion.div>
    </div>
  );

  const OnboardingScreen = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState<Partial<User>>({});

    const steps = [
      {
        title: "Basic Info",
        content: (
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="e.g. Salma Madoud"
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Major</label>
                <select 
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    onChange={(e) => setFormData({...formData, major: e.target.value})}
                >
                    <option value="">Select Major</option>
                    {MAJORS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
            </div>
          </div>
        )
      },
      {
        title: "Your Goal",
        content: (
          <div className="grid grid-cols-1 gap-3">
             {Object.values(ConnectionPurpose).map((purpose) => (
               <button
                 key={purpose}
                 onClick={() => setFormData({...formData, purpose: purpose})}
                 className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-3 ${formData.purpose === purpose ? 'border-emerald-500 bg-emerald-50 text-emerald-800' : 'border-slate-100 hover:border-emerald-200'}`}
               >
                 <div className={`p-2 rounded-full ${formData.purpose === purpose ? 'bg-emerald-200' : 'bg-slate-100'}`}>
                    {purpose === ConnectionPurpose.STUDY && <BookOpen className="w-5 h-5" />}
                    {purpose === ConnectionPurpose.GYM && <Dumbbell className="w-5 h-5" />}
                    {purpose === ConnectionPurpose.SOCIAL && <Coffee className="w-5 h-5" />}
                    {purpose === ConnectionPurpose.HOBBY && <Heart className="w-5 h-5" />}
                    {purpose === ConnectionPurpose.EVENTS && <Calendar className="w-5 h-5" />}
                 </div>
                 <span className="font-medium">{purpose}</span>
               </button>
             ))}
          </div>
        )
      },
      {
        title: "Interests",
        content: (
            <div className="flex flex-wrap gap-2">
                {INTERESTS.map(interest => (
                    <button
                        key={interest}
                        onClick={() => {
                            const current = formData.interests || [];
                            const newInterests = current.includes(interest) 
                                ? current.filter(i => i !== interest)
                                : [...current, interest];
                            setFormData({...formData, interests: newInterests});
                        }}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            (formData.interests || []).includes(interest)
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                    >
                        {interest}
                    </button>
                ))}
            </div>
        )
      }
    ];

    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full">
            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <h2 className="text-2xl font-bold text-slate-800">{steps[step-1].title}</h2>
                    <span className="text-emerald-600 font-medium">Step {step} of 3</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${(step / 3) * 100}%` }}
                        className="h-full bg-emerald-500"
                    />
                </div>
            </div>

            <div className="min-h-[200px]">
                {steps[step-1].content}
            </div>

            <div className="flex justify-between mt-8">
                {step > 1 ? (
                    <Button variant="ghost" onClick={() => setStep(s => s - 1)}>Back</Button>
                ) : <div></div>}
                
                <Button onClick={() => {
                    if (step < 3) setStep(s => s + 1);
                    else completeOnboarding(formData);
                }}>
                    {step === 3 ? 'Finish' : 'Next'} <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </Card>
      </div>
    );
  };

  const DashboardScreen = () => {
    return (
      <div className="space-y-6">
         {/* Welcome Header */}
         <section className="bg-emerald-600 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <h2 className="text-3xl font-bold mb-2">Hello, {currentUser?.name.split(' ')[0]}!</h2>
                <p className="opacity-90">Ready to find your {currentUser?.purpose.toLowerCase()}?</p>
                <div className="flex gap-3 mt-6">
                    <Button 
                        variant="secondary" 
                        className="text-sm py-2"
                        onClick={() => setCurrentScreen('matches')}
                    >
                        Find Matches
                    </Button>
                    <button onClick={() => setIsTTSActive(!isTTSActive)} className="bg-white/20 hover:bg-white/30 p-3 rounded-xl transition">
                        {isTTSActive ? <Volume2 className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                </div>
            </div>
            <Users className="absolute right-[-20px] bottom-[-40px] w-64 h-64 text-emerald-500 opacity-50 rotate-12" />
         </section>

         {/* Notifications */}
         {notifications.length > 0 && (
             <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                 <Bell className="w-5 h-5 text-amber-600 mt-0.5" />
                 <div>
                     <h4 className="font-semibold text-amber-800">New Updates</h4>
                     <ul className="list-disc list-inside text-sm text-amber-700">
                         {notifications.map((n, i) => <li key={i}>{n}</li>)}
                     </ul>
                 </div>
             </div>
         )}

         {/* Quick Matches Preview */}
         <section>
             <h3 className="text-lg font-bold text-slate-800 mb-4 flex justify-between items-center">
                 <span>Recommended for You</span>
                 <button 
                    onClick={() => setCurrentScreen('matches')} 
                    className="text-sm text-emerald-600 font-medium hover:underline"
                >
                    See all
                </button>
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 {matches.slice(0, 2).map((match, i) => {
                     const user = MOCK_USERS.find(u => u.id === match.users[1]);
                     if (!user) return null;
                     return (
                         <Card key={i} className="flex items-center gap-4 hover:shadow-2xl transition cursor-pointer" onClick={() => {
                             setActiveMatch(user);
                             setCurrentScreen('chat');
                         }}>
                             <img src={user.avatar} alt={user.name} className="w-16 h-16 rounded-full object-cover border-2 border-emerald-100" />
                             <div>
                                 <h4 className="font-bold text-slate-800">{user.name}</h4>
                                 <p className="text-sm text-slate-500">{user.major}</p>
                                 <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                                     {match.matchScore}% Match
                                 </span>
                             </div>
                             <div className="ml-auto">
                                 <div className="bg-slate-100 p-2 rounded-full">
                                     <MessageSquare className="w-5 h-5 text-slate-400" />
                                 </div>
                             </div>
                         </Card>
                     );
                 })}
             </div>
         </section>
      </div>
    );
  };

  const MatchesScreen = () => (
    <div className="h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setCurrentScreen('dashboard')} className="p-2 hover:bg-slate-100 rounded-full">
                <ArrowLeft className="w-6 h-6 text-slate-600" />
            </button>
            <h2 className="text-2xl font-bold text-slate-800">Discover Peers</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-20">
            {matches.map((match) => {
                const user = MOCK_USERS.find(u => u.id === match.users[1]);
                if (!user) return null;
                return (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={match.id}
                        className="bg-white rounded-3xl shadow-lg overflow-hidden border border-slate-100 flex flex-col"
                    >
                        <div className="h-32 bg-gradient-to-r from-emerald-400 to-teal-500 relative">
                             <img 
                                src={user.avatar} 
                                alt={user.name} 
                                className="w-24 h-24 rounded-full border-4 border-white absolute -bottom-12 left-6 object-cover shadow-md"
                             />
                        </div>
                        <div className="pt-14 px-6 pb-6 flex-1 flex flex-col">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-1">
                                        {user.name} 
                                        {user.isVerified && <ShieldCheck className="w-4 h-4 text-emerald-500" />}
                                    </h3>
                                    <p className="text-sm text-slate-500">{user.major} • {user.year}</p>
                                </div>
                                <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full text-xs font-bold">
                                    {match.matchScore}%
                                </span>
                            </div>
                            
                            <div className="mt-4 mb-4">
                                <p className="text-sm text-slate-600 line-clamp-2 italic">"{user.bio}"</p>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-6">
                                {user.interests.slice(0,3).map(tag => (
                                    <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-md">
                                        {tag}
                                    </span>
                                ))}
                            </div>

                            <div className="mt-auto flex gap-3">
                                <Button 
                                    className="flex-1 text-sm py-2" 
                                    onClick={() => {
                                        setActiveMatch(user);
                                        setCurrentScreen('chat');
                                    }}
                                >
                                    Connect
                                </Button>
                                <Button variant="secondary" className="px-3" onClick={() => speak(`Viewing profile of ${user.name}. ${user.bio}`)}>
                                    <Volume2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                );
            })}
        </div>
    </div>
  );

  const ChatScreen = () => {
    if (!activeMatch) return null;
    const matchId = `match-${activeMatch.id}`; // In real app, find actual match ID
    const currentMessages = messages[matchId] || [];

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <button onClick={() => setCurrentScreen('dashboard')} className="md:hidden">
                        <ArrowLeft className="w-5 h-5 text-slate-500" />
                    </button>
                    <img src={activeMatch.avatar} className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <h3 className="font-bold text-slate-800 text-sm">{activeMatch.name}</h3>
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span> Online
                        </p>
                    </div>
                </div>
                <div className="flex gap-2">
                     <button 
                        onClick={getGeminiIcebreaker}
                        className="text-xs bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-full font-medium hover:bg-indigo-100 transition flex items-center gap-1"
                     >
                         <Sparkles className="w-3 h-3" /> AI Assistant
                     </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {currentMessages.length === 0 && (
                    <div className="text-center py-10 opacity-50">
                        <MessageSquare className="w-12 h-12 mx-auto mb-2 text-slate-300" />
                        <p className="text-sm text-slate-500">Start the conversation!</p>
                    </div>
                )}
                {currentMessages.map((msg, idx) => {
                    const isMe = msg.senderId === currentUser?.id;
                    return (
                        <div key={idx} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                            <div 
                                className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm ${
                                    isMe 
                                    ? 'bg-emerald-600 text-white rounded-br-none' 
                                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-bl-none'
                                }`}
                                onClick={() => isTTSActive && speak(msg.text)}
                            >
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                <div ref={chatEndRef} />
            </div>

            {/* AI Suggestion Area */}
            <AnimatePresence>
                {pendingIcebreaker && (
                    <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-indigo-50 px-4 py-3 border-t border-indigo-100"
                    >
                        <div className="flex items-start gap-3">
                            <Sparkles className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
                            <div className="flex-1">
                                <p className="text-sm text-indigo-900 font-medium mb-1">AI Suggestion:</p>
                                <p className="text-sm text-indigo-700 italic">"{pendingIcebreaker}"</p>
                            </div>
                            <button 
                                onClick={() => {
                                    if (pendingIcebreaker !== "Thinking...") {
                                        sendMessage(pendingIcebreaker);
                                        setPendingIcebreaker('');
                                    }
                                }}
                                className="text-xs bg-indigo-200 text-indigo-800 px-3 py-1 rounded-md font-semibold hover:bg-indigo-300"
                            >
                                Send
                            </button>
                            <button onClick={() => setPendingIcebreaker('')} className="text-indigo-400 hover:text-indigo-600">
                                <XCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Input Area */}
            <div className="p-3 bg-white border-t border-slate-100 flex gap-2">
                <input 
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
                    placeholder="Type a message..."
                    onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                            sendMessage((e.target as HTMLInputElement).value);
                            (e.target as HTMLInputElement).value = '';
                        }
                    }}
                    id="chat-input"
                />
                <button 
                    onClick={() => {
                        const input = document.getElementById('chat-input') as HTMLInputElement;
                        sendMessage(input.value);
                        input.value = '';
                    }}
                    className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition"
                >
                    <Send className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
  };

  const ProfileScreen = () => {
      if (!currentUser) return null;
      return (
          <div className="space-y-6">
              <Card className="text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-emerald-500 to-teal-600"></div>
                  <div className="relative pt-12">
                      <img src={currentUser.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-lg mx-auto mb-4 object-cover" />
                      <h2 className="text-2xl font-bold text-slate-800">{currentUser.name}</h2>
                      <p className="text-slate-500 mb-2">{currentUser.major} • {currentUser.year}</p>
                      <div className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-sm font-medium">
                          {currentUser.purpose}
                      </div>
                  </div>
              </Card>

              <Card>
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Account Settings</h3>
                  <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <div className="flex items-center gap-3">
                              <Volume2 className="w-5 h-5 text-slate-500" />
                              <span className="text-slate-700">Text-to-Speech</span>
                          </div>
                          <div 
                            className={`w-12 h-6 rounded-full p-1 transition-colors ${isTTSActive ? 'bg-emerald-500' : 'bg-slate-300'}`}
                            onClick={() => setIsTTSActive(!isTTSActive)}
                          >
                              <div className={`w-4 h-4 bg-white rounded-full shadow-md transform transition-transform ${isTTSActive ? 'translate-x-6' : ''}`} />
                          </div>
                      </div>
                       <div className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer">
                          <div className="flex items-center gap-3">
                              <ShieldCheck className="w-5 h-5 text-slate-500" />
                              <span className="text-slate-700">Privacy & Blocking</span>
                          </div>
                          <ChevronRight className="w-5 h-5 text-slate-400" />
                      </div>
                       <div className="flex items-center justify-between p-3 rounded-lg hover:bg-red-50 cursor-pointer group" onClick={() => {
                           setCurrentUser(null);
                           setCurrentScreen('landing');
                       }}>
                          <div className="flex items-center gap-3">
                              <LogOut className="w-5 h-5 text-red-500" />
                              <span className="text-red-600 group-hover:text-red-700">Sign Out</span>
                          </div>
                      </div>
                  </div>
              </Card>
          </div>
      )
  };

  // --- Layout Wrapper ---

  const NavItem = ({ icon: Icon, label, screen }: any) => (
      <button 
        onClick={() => setCurrentScreen(screen)}
        className={`flex flex-col items-center gap-1 p-2 transition-colors ${currentScreen === screen ? 'text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
      >
          <Icon className={`w-6 h-6 ${currentScreen === screen ? 'fill-current' : ''}`} />
          <span className="text-[10px] font-medium">{label}</span>
      </button>
  );

  if (currentScreen === 'landing') return <LandingScreen />;
  if (currentScreen === 'onboarding') return <OnboardingScreen />;

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-0 md:pl-24">
        {/* Desktop Sidebar / Mobile Bottom Nav */}
        <nav className="fixed bottom-0 left-0 right-0 md:top-0 md:right-auto md:w-24 bg-white border-t md:border-r border-slate-200 z-50 px-6 py-2 md:py-8 flex md:flex-col justify-between md:justify-start md:gap-8 items-center">
            <div className="hidden md:block mb-8">
                <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center text-white font-bold text-xl">
                    U
                </div>
            </div>
            
            <NavItem icon={BookOpen} label="Home" screen="dashboard" />
            <NavItem icon={Users} label="Matches" screen="matches" />
            <NavItem icon={UserIcon} label="Profile" screen="profile" />
            
            <div className="hidden md:flex mt-auto">
                 <button onClick={() => setIsTTSActive(!isTTSActive)} className={`p-3 rounded-xl transition ${isTTSActive ? 'bg-emerald-100 text-emerald-700' : 'text-slate-400 hover:bg-slate-100'}`}>
                    {isTTSActive ? <Volume2 className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
                 </button>
            </div>
        </nav>

        {/* Main Content Area */}
        <main className="max-w-5xl mx-auto p-4 md:p-8">
            <motion.div
                key={currentScreen}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
            >
                {currentScreen === 'dashboard' && <DashboardScreen />}
                {currentScreen === 'matches' && <MatchesScreen />}
                {currentScreen === 'chat' && <ChatScreen />}
                {currentScreen === 'profile' && <ProfileScreen />}
            </motion.div>
        </main>
    </div>
  );
}
