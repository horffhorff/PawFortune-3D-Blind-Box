import React, { useState } from 'react';
import { GeneratedFortune } from '../types';

interface CollectionGalleryProps {
  collection: GeneratedFortune[];
  onBack: () => void;
}

const RarityBadge = ({ rarity }: { rarity: string }) => {
  const colors = {
    'Common': 'bg-gray-400',
    'Rare': 'bg-blue-400',
    'Ultra Rare': 'bg-purple-500',
    'Secret': 'bg-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]'
  };
  const labels: Record<string, string> = {
    'Common': '普通',
    'Rare': '稀有',
    'Ultra Rare': '史诗',
    'Secret': '隐藏（狗屎运款）'
  };
  return (
    <span className={`px-2 py-0.5 rounded-full text-white text-[10px] font-bold uppercase ${colors[rarity as keyof typeof colors] || 'bg-gray-400'}`}>
      {labels[rarity] || rarity}
    </span>
  );
};

// Canvas drawing constants
const CanvasRarityColors = {
  'Common': '#9CA3AF',
  'Rare': '#60A5FA',
  'Ultra Rare': '#A855F7',
  'Secret': '#FACC15'
};

const CanvasRarityLabels: Record<string, string> = {
  'Common': '普通',
  'Rare': '稀有',
  'Ultra Rare': '史诗',
  'Secret': '隐藏（狗屎运款）'
};

export const CollectionGallery: React.FC<CollectionGalleryProps> = ({ collection, onBack }) => {
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

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

  const handleDownloadCard = async (e: React.MouseEvent, data: GeneratedFortune) => {
    e.stopPropagation();
    if (downloadingId) return;
    setDownloadingId(data.timestamp);

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
      const rarityText = CanvasRarityLabels[data.rarity] || data.rarity;
      ctx.font = 'bold 40px "Noto Sans SC", sans-serif';
      const badgeWidth = ctx.measureText(rarityText).width + 40;
      
      // Draw badge bg
      ctx.fillStyle = CanvasRarityColors[data.rarity as keyof typeof CanvasRarityColors] || '#9CA3AF';
      
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
      ctx.fillText(`PawFortune 爪爪运势 • ${dateStr} • Powered by Gemini`, width / 2, totalHeight - 50);

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
      setDownloadingId(null);
    }
  };

  // Sort collection by timestamp
  const sortedCollection = [...collection].sort((a, b) => {
    return sortOrder === 'desc' 
      ? b.timestamp - a.timestamp 
      : a.timestamp - b.timestamp;
  });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 min-h-[80vh] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="text-indigo-600 font-bold hover:underline flex items-center gap-2">
          ← 返回抽卡
        </button>
        <div className="flex items-center gap-2">
           <span className="text-sm text-gray-500">排序:</span>
           <button 
             onClick={() => setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
             className="px-3 py-1 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 uppercase hover:bg-gray-50"
           >
             {sortOrder === 'desc' ? '最新' : '最早'}
           </button>
        </div>
      </div>

      {sortedCollection.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-gray-400 space-y-4">
          <div className="text-6xl grayscale opacity-30">🕸️</div>
          <p>你的收藏柜还是空的。</p>
          <p className="text-sm">快去抽几个盲盒填充这里吧！</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {sortedCollection.map((item) => (
            <div key={item.timestamp} className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-indigo-100 group flex flex-col">
              <div className="relative aspect-square bg-gray-100 overflow-hidden">
                 <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                 <div className="absolute top-2 right-2">
                    <RarityBadge rarity={item.rarity} />
                 </div>
                 <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black/70 to-transparent p-3 pt-8">
                   <p className="text-white text-xs font-bold truncate">{item.title}</p>
                 </div>
              </div>
              <div className="p-3 flex-1 flex flex-col">
                <p className="text-[10px] text-gray-400 mb-1">{new Date(item.timestamp).toLocaleDateString()}</p>
                <p className="text-xs font-medium text-gray-800 line-clamp-2 min-h-[2.5em] leading-tight mb-2">"{item.baseLabel}"</p>
                <div className="text-[10px] text-indigo-500 bg-indigo-50 p-1.5 rounded truncate mb-3">
                  {item.fortuneQuote}
                </div>
                
                <div className="mt-auto">
                   <button 
                     onClick={(e) => handleDownloadCard(e, item)}
                     disabled={downloadingId === item.timestamp}
                     className="w-full py-1.5 bg-gray-100 hover:bg-indigo-100 text-gray-600 hover:text-indigo-600 text-xs rounded-lg font-bold transition-colors flex items-center justify-center gap-1"
                   >
                     {downloadingId === item.timestamp ? (
                       <span className="w-3 h-3 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></span>
                     ) : (
                       <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                       </svg>
                     )}
                     保存卡片
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
