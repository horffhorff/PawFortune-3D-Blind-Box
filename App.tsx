import React, { useState, useEffect, useRef } from 'react';
import { BlindBox } from './components/BlindBox';
import { ResultCard } from './components/ResultCard';
import { UserProfileForm } from './components/UserProfileForm';
import { CollectionGallery } from './components/CollectionGallery';
import { SidebarCollection } from './components/SidebarCollection';
import { generateFortuneData, generateFortuneImage } from './services/geminiService';
import { AppState, GeneratedFortune, UserProfile, ZodiacSign, ChineseZodiac } from './types';

// Translation maps
const ZODIAC_LABELS: Record<ZodiacSign, string> = {
  'Aries': '白羊座', 'Taurus': '金牛座', 'Gemini': '双子座', 'Cancer': '巨蟹座',
  'Leo': '狮子座', 'Virgo': '处女座', 'Libra': '天秤座', 'Scorpio': '天蝎座',
  'Sagittarius': '射手座', 'Capricorn': '摩羯座', 'Aquarius': '水瓶座', 'Pisces': '双鱼座'
};
const CHINESE_ZODIAC_LABELS: Record<ChineseZodiac, string> = {
  'Rat': '鼠', 'Ox': '牛', 'Tiger': '虎', 'Rabbit': '兔', 'Dragon': '龙',
  'Snake': '蛇', 'Horse': '马', 'Goat': '羊', 'Monkey': '猴', 'Rooster': '鸡', 'Dog': '狗', 'Pig': '猪'
};

// Sound Assets
const SOUNDS = {
  SHAKE: 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3', // Rattling sound
  POP: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Pop sound
  PRINT: 'https://gfxsounds.com/wp-content/uploads/2022/11/3D-printer-printing-a-sequence.mp3', // Fairy dust / magical production
  DOG: 'https://assets.mixkit.co/active_storage/sfx/51/51-preview.mp3', // Bark
  CAT: 'https://www.orangefreesounds.com/wp-content/uploads/2022/04/Cat-sound-meow.mp3', // Meow (Fixed)
};

export default function App() {
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [fortune, setFortune] = useState<GeneratedFortune | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'HOME' | 'COLLECTION'>('HOME');
  
  // Data State
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [collection, setCollection] = useState<GeneratedFortune[]>([]);
  const [showProfileModal, setShowProfileModal] = useState(false);

  // Easter Egg State
  const errorClickCountRef = useRef(0);

  // Audio Refs
  const shakeAudio = useRef(new Audio(SOUNDS.SHAKE));
  const popAudio = useRef(new Audio(SOUNDS.POP));
  const printAudio = useRef(new Audio(SOUNDS.PRINT));
  const dogAudio = useRef(new Audio(SOUNDS.DOG));
  const catAudio = useRef(new Audio(SOUNDS.CAT));

  useEffect(() => {
    // Preload audio and set loops where necessary
    printAudio.current.loop = true;
    shakeAudio.current.loop = true;
    // Lower the volume of the print sound slightly so it's not piercing
    printAudio.current.volume = 0.5;
  }, []);

  // Load from LocalStorage
  useEffect(() => {
    try {
      const savedProfile = localStorage.getItem('pawFortuneProfile');
      if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
      }

      const savedCollection = localStorage.getItem('pawFortuneCollection');
      if (savedCollection) {
        setCollection(JSON.parse(savedCollection));
      }
    } catch (e) {
      console.warn("Failed to load from local storage", e);
    }
  }, []);

  // Check Daily Limit
  const checkDailyLimit = (): boolean => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = 'pawFortuneDailyLimit';
      const stored = localStorage.getItem(storageKey);
      
      let data = stored ? JSON.parse(stored) : { date: today, count: 0 };

      if (data.date !== today) {
        // Reset if new day
        data = { date: today, count: 0 };
      }

      if (data.count >= 3) {
        return false;
      }

      return true;
    } catch (e) {
      return true; // If storage fails, fail open
    }
  };

  const incrementDailyCount = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = 'pawFortuneDailyLimit';
      const stored = localStorage.getItem(storageKey);
      let data = stored ? JSON.parse(stored) : { date: today, count: 0 };

      if (data.date !== today) {
        data = { date: today, count: 0 };
      }
      
      data.count += 1;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
      console.warn("Could not save daily count", e);
    }
  };

  const resetDailyCount = () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const storageKey = 'pawFortuneDailyLimit';
      localStorage.setItem(storageKey, JSON.stringify({ date: today, count: 0 }));
    } catch (e) {}
  };

  const handleSaveProfile = (profile: UserProfile) => {
    setUserProfile(profile);
    try {
      localStorage.setItem('pawFortuneProfile', JSON.stringify(profile));
    } catch (e) {
      console.warn("Could not save profile", e);
    }
    setShowProfileModal(false);
  };

  const handleErrorClick = () => {
    errorClickCountRef.current += 1;
    if (errorClickCountRef.current >= 3) {
      resetDailyCount();
      setError(null);
      errorClickCountRef.current = 0;
      alert("🎉 隐藏彩蛋触发！今日额度已重置！");
    }
  };

  const handleBoxClick = async () => {
    if (appState !== AppState.IDLE && appState !== AppState.ERROR) return;

    if (!checkDailyLimit()) {
      setError("明天再来吧，不然好运都用光了 (每日限抽3次) 🌙");
      errorClickCountRef.current = 0;
      return;
    }

    if (!userProfile) {
      setShowProfileModal(true);
      return; 
    }

    try {
      // 1. Start Shaking
      setAppState(AppState.SHAKING);
      setError(null);
      shakeAudio.current.play().catch(() => {});

      // Wait for animation
      await new Promise(resolve => setTimeout(resolve, 1500));
      shakeAudio.current.pause();
      shakeAudio.current.currentTime = 0;

      // 2. Generate Text
      setAppState(AppState.GENERATING_TEXT);
      printAudio.current.play().catch(() => {});
      const textData = await generateFortuneData(userProfile);

      // 3. Generate Image
      setAppState(AppState.GENERATING_IMAGE);
      const imageBase64 = await generateFortuneImage(textData.visualPrompt, textData.baseLabel);

      printAudio.current.pause();
      printAudio.current.currentTime = 0;

      // 4. Reveal & Save
      const newFortune: GeneratedFortune = { 
        ...textData, 
        imageUrl: imageBase64,
        timestamp: Date.now()
      };
      
      setFortune(newFortune);
      popAudio.current.play().catch(() => {});

      // Play animal sound based on type immediately
      setTimeout(() => {
        if (textData.animal === 'dog') {
            dogAudio.current.currentTime = 0;
            dogAudio.current.play().catch(() => {});
        } else {
            catAudio.current.currentTime = 0;
            catAudio.current.play().catch(() => {});
        }
      }, 200);
      
      // Update Collection Safely
      // We prioritize showing the result to the user over saving history
      let updatedCollection = [newFortune, ...collection];
      
      // In-memory collection can be larger
      if (updatedCollection.length > 20) {
        updatedCollection = updatedCollection.slice(0, 20);
      }
      setCollection(updatedCollection);

      // Robust Storage Saving with Fallbacks
      // This addresses the "QuotaExceededError"
      try {
        const saveToStorage = (items: GeneratedFortune[]) => {
          localStorage.setItem('pawFortuneCollection', JSON.stringify(items));
        };

        // Strategy 1: Try saving full recent list (e.g. 10 items)
        try {
          const toSave = updatedCollection.slice(0, 10);
          saveToStorage(toSave);
        } catch (e) {
          console.warn("Storage full (Strategy 1). Trying aggressive trim.");
          
          // Strategy 2: Save minimal amount (3 items)
          try {
             const toSave = updatedCollection.slice(0, 3);
             saveToStorage(toSave);
          } catch (e2) {
             console.warn("Storage full (Strategy 2). Trying single item.");
             
             // Strategy 3: Save ONLY the current item (History is effectively disabled for previous items)
             try {
                const toSave = [newFortune];
                saveToStorage(toSave);
             } catch (e3) {
                console.error("Storage Critical: Unable to save history. LocalStorage is full.");
                // We deliberately swallow this error so the user still sees their revealed fortune
                // They just won't see it in history after refresh.
             }
          }
        }
      } catch (wrapperErr) {
        console.error("Unexpected error in storage wrapper", wrapperErr);
      }
      
      incrementDailyCount();
      setAppState(AppState.REVEALED);

    } catch (err: any) {
      console.error(err);
      shakeAudio.current.pause();
      printAudio.current.pause();
      
      setError("哎呀！盲盒机走神了，请重试！" + (err.message || ""));
      setAppState(AppState.ERROR);
    }
  };

  const handleReset = () => {
    setFortune(null);
    setAppState(AppState.IDLE);
    setError(null);
  };

  const handleSelectHistory = (item: GeneratedFortune) => {
    // Prevent interaction if busy generating
    if (appState === AppState.SHAKING || appState === AppState.GENERATING_TEXT || appState === AppState.GENERATING_IMAGE) {
      return;
    }
    setFortune(item);
    setAppState(AppState.REVEALED);
    setError(null);
  };

  const getStatusText = () => {
    switch(appState) {
      case AppState.SHAKING: return "好运加载中...";
      case AppState.GENERATING_TEXT: return "正在掐爪一算...";
      case AppState.GENERATING_IMAGE: return "3D打印显灵中...";
      default: return "点击开启今日盲盒";
    }
  };

  if (view === 'COLLECTION') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="text-center pt-8 pb-4">
          <h1 className="text-3xl font-display font-extrabold text-indigo-900">我的收藏柜 🏆</h1>
        </div>
        <CollectionGallery collection={collection} onBack={() => setView('HOME')} />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden relative">
      
      {/* Sidebar Collection (Desktop only) */}
      <SidebarCollection collection={collection} onSelect={handleSelectHistory} />

      {/* Header */}
      <div className="text-center mb-6 relative z-10">
        <h1 className="text-4xl md:text-5xl font-display font-extrabold text-indigo-900 mb-2 drop-shadow-sm">
          爪爪运势 🐾
        </h1>
        <p className="text-indigo-600 font-medium">天灵灵地灵灵 猫猫狗狗快显灵</p>
        
        {/* Footer info */}
        <div className="text-[10px] text-gray-400 font-light mt-2 mb-1">
          Powered by Gemini • ©胡子盖 horffsky@gmail.com
        </div>
        
        {/* Profile Badge */}
        {userProfile && (
           <div 
             onClick={() => setShowProfileModal(true)}
             className="mt-1 inline-flex items-center gap-2 px-4 py-1.5 bg-white/60 backdrop-blur border border-indigo-100 rounded-full cursor-pointer hover:bg-white transition-colors text-xs text-indigo-800 font-bold uppercase tracking-wider shadow-sm"
           >
             <span>✨ {ZODIAC_LABELS[userProfile.zodiac]}</span>
             <span>•</span>
             <span>{CHINESE_ZODIAC_LABELS[userProfile.chineseZodiac]} 🧧</span>
           </div>
        )}
      </div>

      {/* Main Stage */}
      <div className="w-full max-w-2xl min-h-[500px] flex flex-col items-center justify-center relative">
        
        {/* Error Message */}
        {error && (
          <div 
            onClick={handleErrorClick}
            className="mb-6 px-6 py-4 bg-red-100 text-red-700 rounded-xl border border-red-200 shadow-lg max-w-md text-center z-50 cursor-pointer select-none active:scale-95 transition-transform"
          >
            <p className="font-bold">{error}</p>
          </div>
        )}

        {/* Interaction Area */}
        {appState === AppState.REVEALED && fortune ? (
          <ResultCard data={fortune} onReset={handleReset} />
        ) : (
          <div className={`transition-all duration-500 ${appState !== AppState.IDLE && appState !== AppState.SHAKING && appState !== AppState.GENERATING_TEXT && appState !== AppState.GENERATING_IMAGE ? 'opacity-0 scale-90 blur-sm' : 'opacity-100'}`}>
            <BlindBox 
              onClick={handleBoxClick} 
              appState={appState}
              disabled={appState !== AppState.IDLE && appState !== AppState.ERROR}
            />
            <p className={`text-center mt-12 font-medium transition-all duration-300 ${appState === AppState.IDLE ? 'text-gray-500 animate-bounce' : 'text-indigo-600 animate-pulse'}`}>
              {getStatusText()}
            </p>
          </div>
        )}

      </div>

      {/* Navigation Buttons */}
      {appState === AppState.IDLE && (
        <div className="flex gap-4 mt-8">
           <button 
             onClick={() => setView('COLLECTION')}
             className="lg:hidden px-6 py-2 bg-white text-indigo-600 font-bold rounded-full shadow-md hover:shadow-lg transition-all border border-indigo-50"
           >
             📂 我的收藏
           </button>
           {!userProfile && (
             <button 
               onClick={() => setShowProfileModal(true)}
               className="px-6 py-2 bg-indigo-100 text-indigo-700 font-bold rounded-full hover:bg-indigo-200 transition-colors"
             >
               ⚙️ 设置星座
             </button>
           )}
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <UserProfileForm 
          initialProfile={userProfile} 
          onSave={handleSaveProfile} 
          onClose={() => setShowProfileModal(false)} 
        />
      )}
    </div>
  );
}