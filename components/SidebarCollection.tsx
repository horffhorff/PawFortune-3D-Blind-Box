import React, { useState } from 'react';
import { GeneratedFortune } from '../types';

interface SidebarCollectionProps {
  collection: GeneratedFortune[];
  onSelect: (item: GeneratedFortune) => void;
}

export const SidebarCollection: React.FC<SidebarCollectionProps> = ({ collection, onSelect }) => {
  const [startIndex, setStartIndex] = useState(0);
  const VISIBLE_COUNT = 3;

  const handleNext = () => {
    if (startIndex + VISIBLE_COUNT < collection.length) {
      setStartIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (startIndex > 0) {
      setStartIndex(prev => prev - 1);
    }
  };

  const visibleItems = collection.slice(startIndex, startIndex + VISIBLE_COUNT);

  if (collection.length === 0) return null;

  return (
    <div className="hidden lg:flex flex-col fixed right-6 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-md p-3 rounded-2xl shadow-xl border border-indigo-50 w-44 z-40 transition-all duration-300 hover:shadow-2xl">
      <div className="text-center mb-3 pb-2 border-b border-gray-100">
        <h3 className="font-display font-bold text-indigo-900 text-sm">我的收藏</h3>
        <p className="text-[10px] text-gray-400">{collection.length} 个摆件</p>
      </div>

      <div className="flex flex-col gap-3 relative min-h-[350px]">
        {/* Up Arrow */}
        {startIndex > 0 ? (
          <button 
            onClick={handlePrev} 
            className="w-full flex justify-center items-center py-1 text-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="上一页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
            </svg>
          </button>
        ) : (
           <div className="h-6"></div> // Spacer to keep layout stable
        )}

        {/* List Items */}
        <div className="flex-1 flex flex-col gap-3">
          {visibleItems.map((item, idx) => (
            <div 
              key={item.timestamp} 
              onClick={() => onSelect(item)}
              className="group bg-white rounded-xl p-2 shadow-sm border border-gray-100 flex flex-col items-center cursor-pointer hover:scale-105 hover:shadow-md hover:border-indigo-200 transition-all duration-300"
            >
              <div className="w-full aspect-square rounded-lg overflow-hidden bg-gray-50 mb-2 relative">
                <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
              </div>
              <p className="text-xs font-bold text-gray-700 text-center line-clamp-1 group-hover:text-indigo-600">{item.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{new Date(item.timestamp).toLocaleDateString()}</p>
            </div>
          ))}
          
          {/* Empty placeholders to maintain height if less than 3 items */}
          {Array.from({ length: Math.max(0, VISIBLE_COUNT - visibleItems.length) }).map((_, i) => (
             <div key={`empty-${i}`} className="flex-1 bg-gray-50/50 rounded-xl border border-dashed border-gray-200"></div>
          ))}
        </div>

        {/* Down Arrow */}
        {startIndex + VISIBLE_COUNT < collection.length ? (
          <button 
            onClick={handleNext} 
            className="w-full flex justify-center items-center py-1 text-indigo-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="下一页"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        ) : (
            <div className="h-6"></div> // Spacer
        )}
      </div>
    </div>
  );
};