import React, { useState, useEffect } from 'react';
import { UserProfile, ZodiacSign, ChineseZodiac } from '../types';

interface UserProfileFormProps {
  initialProfile: UserProfile | null;
  onSave: (profile: UserProfile) => void;
  onClose: () => void;
}

const ZODIAC_SIGNS: {value: ZodiacSign, label: string}[] = [
  { value: 'Aries', label: '白羊座 (Aries)' },
  { value: 'Taurus', label: '金牛座 (Taurus)' },
  { value: 'Gemini', label: '双子座 (Gemini)' },
  { value: 'Cancer', label: '巨蟹座 (Cancer)' },
  { value: 'Leo', label: '狮子座 (Leo)' },
  { value: 'Virgo', label: '处女座 (Virgo)' },
  { value: 'Libra', label: '天秤座 (Libra)' },
  { value: 'Scorpio', label: '天蝎座 (Scorpio)' },
  { value: 'Sagittarius', label: '射手座 (Sagittarius)' },
  { value: 'Capricorn', label: '摩羯座 (Capricorn)' },
  { value: 'Aquarius', label: '水瓶座 (Aquarius)' },
  { value: 'Pisces', label: '双鱼座 (Pisces)' }
];

const CHINESE_ZODIACS: {value: ChineseZodiac, label: string}[] = [
  { value: 'Rat', label: '鼠 (Rat)' },
  { value: 'Ox', label: '牛 (Ox)' },
  { value: 'Tiger', label: '虎 (Tiger)' },
  { value: 'Rabbit', label: '兔 (Rabbit)' },
  { value: 'Dragon', label: '龙 (Dragon)' },
  { value: 'Snake', label: '蛇 (Snake)' },
  { value: 'Horse', label: '马 (Horse)' },
  { value: 'Goat', label: '羊 (Goat)' },
  { value: 'Monkey', label: '猴 (Monkey)' },
  { value: 'Rooster', label: '鸡 (Rooster)' },
  { value: 'Dog', label: '狗 (Dog)' },
  { value: 'Pig', label: '猪 (Pig)' }
];

const getZodiacSign = (month: number, day: number): ZodiacSign | null => {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return 'Aries';
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return 'Taurus';
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return 'Gemini';
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return 'Cancer';
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return 'Leo';
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return 'Virgo';
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return 'Libra';
  if ((month === 10 && day >= 24) || (month === 11 && day <= 21)) return 'Scorpio';
  if ((month === 11 && day >= 22) || (month === 12 && day <= 21)) return 'Sagittarius';
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return 'Capricorn';
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return 'Aquarius';
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return 'Pisces';
  return null;
};

// Validate if the day exists in the month
const isValidDate = (month: number, day: number): boolean => {
  if (month < 1 || month > 12) return false;
  if (day < 1) return false;

  // Days in each month. Index 0 is dummy.
  // February is 29 to allow leap years since we don't ask for year.
  const daysInMonth = [0, 31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  
  return day <= daysInMonth[month];
};

export const UserProfileForm: React.FC<UserProfileFormProps> = ({ initialProfile, onSave, onClose }) => {
  const [zodiac, setZodiac] = useState<ZodiacSign>(initialProfile?.zodiac || 'Aries');
  const [chineseZodiac, setChineseZodiac] = useState<ChineseZodiac>(initialProfile?.chineseZodiac || 'Rat');
  const [month, setMonth] = useState<string>(initialProfile?.birthdayMonth || '');
  const [day, setDay] = useState<string>(initialProfile?.birthdayDay || '');
  const [isZodiacLocked, setIsZodiacLocked] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    const m = parseInt(month);
    const d = parseInt(day);

    if (!isNaN(m) && !isNaN(d)) {
      if (isValidDate(m, d)) {
        const sign = getZodiacSign(m, d);
        if (sign) {
          setZodiac(sign);
          setIsZodiacLocked(true);
          setDateError(null);
        }
      } else {
        // Only set error if both fields have some input to avoid annoying user while typing
        if (month.length > 0 && day.length > 0) {
           setIsZodiacLocked(false);
           // We don't show error immediately while typing, but we unlock zodiac
        }
      }
    } else {
      setIsZodiacLocked(false);
    }
  }, [month, day]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Strict Validation on Submit
    const m = parseInt(month);
    const d = parseInt(day);
    
    // Check if fields are empty
    if (!month || !day) {
       setDateError("请输入完整的生日");
       return;
    }

    if (!isValidDate(m, d)) {
      setDateError("请输入有效的日期 (例如: 2月只有28或29天)");
      return;
    }

    onSave({ 
      zodiac, 
      chineseZodiac,
      birthdayMonth: month || undefined,
      birthdayDay: day || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-6 md:p-8 w-full max-w-md shadow-2xl animate-fade-in-up border-4 border-white/50 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-display font-bold text-indigo-900 mb-2">你的运势档案</h2>
        <p className="text-gray-500 mb-6 text-sm">完善资料，让每日盲盒更懂你的命运。</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-indigo-700 font-bold mb-2 text-sm uppercase tracking-wide">生日 (Birthday)</label>
            <div className="flex gap-4">
              <div className="relative w-full">
                <input
                  type="number"
                  min="1"
                  max="12"
                  placeholder="月"
                  value={month}
                  onChange={(e) => { setMonth(e.target.value); setDateError(null); }}
                  className={`w-full p-3 rounded-xl bg-indigo-50 border text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${dateError ? 'border-red-300 bg-red-50' : 'border-indigo-100'}`}
                />
                <span className="absolute right-3 top-3 text-gray-400 text-sm">月</span>
              </div>
              <div className="relative w-full">
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="日"
                  value={day}
                  onChange={(e) => { setDay(e.target.value); setDateError(null); }}
                  className={`w-full p-3 rounded-xl bg-indigo-50 border text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${dateError ? 'border-red-300 bg-red-50' : 'border-indigo-100'}`}
                />
                <span className="absolute right-3 top-3 text-gray-400 text-sm">日</span>
              </div>
            </div>
            {dateError ? (
              <p className="text-xs text-red-500 mt-1 font-bold">{dateError}</p>
            ) : (
              <p className="text-[10px] text-gray-400 mt-1">输入生日自动锁定星座</p>
            )}
          </div>

          <div>
            <label className="block text-indigo-700 font-bold mb-2 text-sm uppercase tracking-wide">
              星座 (Western Zodiac)
              {isZodiacLocked && <span className="ml-2 text-green-600 text-xs">✓ 已根据生日自动匹配</span>}
            </label>
            <select 
              value={zodiac} 
              onChange={(e) => setZodiac(e.target.value as ZodiacSign)}
              disabled={isZodiacLocked}
              className={`w-full p-3 rounded-xl border text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-300 ${isZodiacLocked ? 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed' : 'bg-indigo-50 border-indigo-100'}`}
            >
              {ZODIAC_SIGNS.map(z => (
                <option key={z.value} value={z.value}>{z.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-indigo-700 font-bold mb-2 text-sm uppercase tracking-wide">生肖 (Chinese Zodiac)</label>
            <select 
              value={chineseZodiac} 
              onChange={(e) => setChineseZodiac(e.target.value as ChineseZodiac)}
              className="w-full p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {CHINESE_ZODIACS.map(z => (
                <option key={z.value} value={z.value}>{z.label}</option>
              ))}
            </select>
          </div>

          <div className="pt-4 flex gap-3">
             <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-xl transition-colors"
            >
              取消
            </button>
            <button 
              type="submit"
              className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 rounded-xl hover:shadow-lg transition-transform active:scale-95"
            >
              保存档案
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};