import React, { useState } from 'react';
import { GeneratedFortune } from '../types';

interface ResultCardProps {
  data: GeneratedFortune;
  onReset: () => void;
}

const RarityColors = {
  'Common': 'bg-gray-400',
  'Rare': 'bg-blue-400',
  'Ultra Rare': 'bg-purple-500',
  'Secret': 'bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.6)]'
};

const RarityLabels = {
  'Common': '普通',
  'Rare': '稀有',
  'Ultra Rare': '史诗',
  'Secret': '隐藏（狗屎运款）'
};

export const ResultCard: React.FC<ResultCardProps> = ({ data, onReset }) => {
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Helper to wrap text for Canvas
  const wrapText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
    const words = text.split('');
    let line = '';
    let currentY = y;

    for(let n = 0; n < words.length; n++) {
      const testLine = line + words[n];
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n];
        currentY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
    return currentY + lineHeight;
  };

  const handleDownload = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Configuration
      const width = 1200;
      const imageHeight = 1200;
      const textSectionHeight = 500;
      const totalHeight = imageHeight + textSectionHeight;
      const padding = 60;

      // Set Canvas Size
      canvas.width = width;
      canvas.height = totalHeight;

      // 1. Draw Background (White card style)
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, totalHeight);

      // 2. Draw the Image
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = data.imageUrl;
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = reject;
      });
      
      ctx.drawImage(img, 0, 0, width, imageHeight);

      // 3. Draw Text Section Background (Soft Indigo Tint)
      ctx.fillStyle = '#F5F3FF'; // A very light purple/indigo
      ctx.fillRect(0, imageHeight, width, textSectionHeight);

      // Decorative line
      ctx.strokeStyle = '#818CF8'; // Indigo-400
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(padding, imageHeight + 20);
      ctx.lineTo(width - padding, imageHeight + 20);
      ctx.stroke();

      // 4. Draw Title
      ctx.fillStyle = '#312E81'; // Indigo-900
      ctx.font = 'bold 70px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(data.title, padding, imageHeight + 60);

      // 5. Draw Rarity Badge
      const rarityText = RarityLabels[data.rarity] || data.rarity;
      ctx.font = 'bold 40px "Noto Sans SC", sans-serif';
      const badgeWidth = ctx.measureText(rarityText).width + 40;
      
      // Draw badge bg
      ctx.fillStyle = data.rarity === 'Common' ? '#9CA3AF' : 
                      data.rarity === 'Rare' ? '#60A5FA' : 
                      data.rarity === 'Ultra Rare' ? '#A855F7' : '#FACC15';
      
      // Rounded rect manually
      const badgeX = width - padding - badgeWidth;
      const badgeY = imageHeight + 65;
      const badgeH = 60;
      const r = 30;
      ctx.beginPath();
      ctx.moveTo(badgeX + r, badgeY);
      ctx.lineTo(badgeX + badgeWidth - r, badgeY);
      ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY, badgeX + badgeWidth, badgeY + r);
      ctx.lineTo(badgeX + badgeWidth, badgeY + badgeH - r);
      ctx.quadraticCurveTo(badgeX + badgeWidth, badgeY + badgeH, badgeX + badgeWidth - r, badgeY + badgeH);
      ctx.lineTo(badgeX + r, badgeY + badgeH);
      ctx.quadraticCurveTo(badgeX, badgeY + badgeH, badgeX, badgeY + badgeH - r);
      ctx.lineTo(badgeX, badgeY + r);
      ctx.quadraticCurveTo(badgeX, badgeY, badgeX + r, badgeY);
      ctx.closePath();
      ctx.fill();

      // Badge Text
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(rarityText, badgeX + badgeWidth / 2, badgeY + badgeH / 2 + 2);

      // 6. Draw Action Description
      ctx.fillStyle = '#6B7280'; // Gray-500
      ctx.font = 'italic 40px "Noto Sans SC", sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(`抽到了：${data.actionDescription}`, padding, imageHeight + 150);

      // 7. Draw Fortune Quote (Wrapped)
      ctx.fillStyle = '#4F46E5'; // Indigo-600
      ctx.font = '50px "Noto Sans SC", sans-serif'; // Larger font for quote
      const quoteY = imageHeight + 230;
      wrapText(ctx, `✨ ${data.fortuneQuote}`, padding, quoteY, width - (padding * 2), 80);

      // 8. Draw Date & Branding Footer
      ctx.fillStyle = '#9CA3AF'; // Gray-400
      ctx.font = '30px "Quicksand", sans-serif';
      ctx.textAlign = 'center';
      const dateStr = new Date(data.timestamp).toLocaleDateString();
      ctx.fillText(`PawFortune 爪爪运势 • ${dateStr} •©胡子盖 horffsky@gmail.com`, width / 2, totalHeight - 50);

      // 9. Export
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `paw-fortune-${data.title}-${new Date().getTime()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error("Failed to generate image", err);
      alert("图片生成失败，请重试");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="animate-fade-in-up w-full max-w-md mx-auto bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white/50">
      
      {/* Header / Rarity */}
      <div className="relative bg-gray-50 p-4 flex justify-between items-center border-b border-gray-100">
        <span className="font-display font-bold text-xl text-gray-800 tracking-wide">{data.title}</span>
        <div className="flex items-center gap-2">
           <button 
             onClick={handleDownload}
             disabled={isDownloading}
             className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors disabled:opacity-50"
             title="下载图片卡片"
           >
             {isDownloading ? (
               <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
             ) : (
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
               </svg>
             )}
           </button>
           <span className={`px-3 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider ${RarityColors[data.rarity]}`}>
            {RarityLabels[data.rarity] || data.rarity}
          </span>
        </div>
      </div>

      {/* Image Container */}
      <div className="relative aspect-square bg-gray-100 group overflow-hidden perspective-1000">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-gray-50 to-gray-200"></div>
        
        {/* The Text Overlay "Layered" effect */}
        <div className="absolute top-4 left-0 w-full flex justify-center z-10 pointer-events-none select-none">
          <h1 
            className="text-8xl md:text-9xl font-black text-white uppercase tracking-tighter opacity-100 text-center leading-none"
            style={{ 
              maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)',
              WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,1) 40%, rgba(0,0,0,0) 70%)',
              textShadow: '0 2px 10px rgba(0,0,0,0.05)'
            }}
          >
            {data.baseLabel}
          </h1>
        </div>

        {/* 3D Base Label Overlay */}
        <div className="absolute bottom-6 left-0 w-full flex justify-center z-20 pointer-events-none">
            <div 
              className="bg-gradient-to-b from-amber-100 to-amber-200 text-amber-900/60 px-5 py-1.5 rounded shadow-lg border-t border-white/50 border-b border-amber-300/50 backdrop-blur-sm"
              style={{ transform: 'perspective(600px) rotateX(25deg)' }}
            >
              <span className="font-display font-black tracking-[0.2em] uppercase text-xs shadow-white drop-shadow-sm flex items-center gap-2">
                 {data.baseLabel}
              </span>
            </div>
        </div>

        <img 
          src={data.imageUrl} 
          alt={data.actionDescription}
          className="w-full h-full object-cover relative z-0"
        />
      </div>

      {/* Content Body */}
      <div className="p-6 text-center space-y-4 bg-white relative z-20">
        
        {/* The Action Description */}
        <p className="text-sm text-gray-500 italic">
          抽到了：{data.actionDescription}
        </p>

        {/* The Fortune Quote */}
        <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100">
          <p className="text-indigo-900 font-medium font-display text-lg leading-relaxed">
            ✨ {data.fortuneQuote}
          </p>
        </div>

        <div className="flex gap-3 mt-4">
           <button 
             onClick={handleDownload}
             disabled={isDownloading}
             className="flex-1 bg-white border-2 border-indigo-100 text-indigo-600 font-bold py-3 px-6 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
           >
             {isDownloading ? (
                <>
                  <div className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                  <span>生成中...</span>
                </>
             ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  <span>保存卡片</span>
                </>
             )}
           </button>
           <button 
             onClick={onReset}
             className="flex-[2] bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold py-3 px-6 rounded-xl hover:shadow-lg hover:scale-[1.02] transition-all active:scale-95"
           >
             再抽一次
           </button>
        </div>
      </div>
    </div>
  );
};