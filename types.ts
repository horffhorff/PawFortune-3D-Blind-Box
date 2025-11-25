export type ZodiacSign = 'Aries' | 'Taurus' | 'Gemini' | 'Cancer' | 'Leo' | 'Virgo' | 'Libra' | 'Scorpio' | 'Sagittarius' | 'Capricorn' | 'Aquarius' | 'Pisces';
export type ChineseZodiac = 'Rat' | 'Ox' | 'Tiger' | 'Rabbit' | 'Dragon' | 'Snake' | 'Horse' | 'Goat' | 'Monkey' | 'Rooster' | 'Dog' | 'Pig';

export interface UserProfile {
  zodiac: ZodiacSign;
  chineseZodiac: ChineseZodiac;
  birthdayMonth?: string;
  birthdayDay?: string;
}

export interface FortuneData {
  animal: 'cat' | 'dog';
  title: string; // e.g., "The Yoga Master"
  actionDescription: string; // e.g., "A cat doing yoga pose"
  fortuneQuote: string; // e.g., "Take it easy, try 10mins YOGA"
  baseLabel: string; // e.g., "No Work Today"
  visualPrompt: string; // Detailed prompt for the image generator
  rarity: 'Common' | 'Rare' | 'Ultra Rare' | 'Secret';
}

export interface GeneratedFortune extends FortuneData {
  imageUrl: string;
  timestamp: number; // Epoch time for sorting
}

export enum AppState {
  IDLE = 'IDLE',
  SHAKING = 'SHAKING', // User clicked, box is shaking
  GENERATING_TEXT = 'GENERATING_TEXT', // Getting the fortune text
  GENERATING_IMAGE = 'GENERATING_IMAGE', // Getting the image
  REVEALED = 'REVEALED', // Result shown
  ERROR = 'ERROR',
}
