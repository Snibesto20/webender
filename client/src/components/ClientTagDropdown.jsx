import React, { useState, useRef, useEffect } from 'react';
import { TagBadge } from './TagBadge';

export const ClientTagDropdown = ({ value, onChange, disabled, tagsList }) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Pagrindinis mygtukas */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className="input-base flex items-center justify-between bg-white dark:bg-[#202124] w-full text-left cursor-pointer disabled:cursor-not-allowed focus:border-[#1a73e8] focus:outline-none select-none"
      >
        <div className="flex items-center">
          <TagBadge tag={value} />
        </div>
        <span className={`text-[10px] text-[#5f6368] dark:text-[#9aa0a6] mr-1 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
          ▼
        </span>
      </button>

      {/* Sąrašas – sumažintas max aukštis iki max-h-44 efektyvesniam erdvės išnaudojimui */}
      <div 
        className={`absolute left-0 right-0 mt-1.5 max-h-50 overflow-y-auto bg-white dark:bg-[#2d2e31] border border-[#b8bbbf] dark:border-[#4a4d51] rounded shadow-xl z-50 custom-scrollbar divide-y divide-slate-100 dark:divide-[#3c4043] transition-all duration-200 origin-top ${
          isOpen && !disabled 
            ? 'opacity-100 scale-100 pointer-events-auto' 
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <ul className="py-0.5">
          {tagsList.map((tag) => (
            <li
              key={tag}
              onClick={() => {
                onChange(tag);
                setIsOpen(false);
              }}
              className="flex items-center px-3 py-1.5 bg-white odd:bg-slate-50/80 dark:bg-[#292a2d] dark:odd:bg-[#232427] hover:bg-blue-50/60 dark:hover:bg-[#1a73e8]/20 cursor-pointer transition-colors"
            >
              <TagBadge tag={tag} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};