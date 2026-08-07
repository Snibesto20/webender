import React from 'react';
import { MdClose } from 'react-icons/md';

export const ComponentHeader = ({ title, icon: Icon, onClose, children }) => {
  return (
    <div className="p-4 sm:p-6 bg-white dark:bg-[#292a2d] border-b border-[#dadce0] dark:border-[#3c4043] flex justify-between items-center gap-3 shrink-0 w-full select-none">
      <div className="flex items-center gap-3 min-w-0">
        {Icon && (
          <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded shrink-0">
            <Icon size={22} className="text-[#1a73e8]" />
          </div>
        )}
        <h2 className="text-[15px] sm:text-[16px] font-medium text-[#202124] dark:text-[#e8eaed] truncate">{title}</h2>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {children}
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
          >
            <MdClose size={20} />
          </button>
        )}
      </div>
    </div>
  );
};
