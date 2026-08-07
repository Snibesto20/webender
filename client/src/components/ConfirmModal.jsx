import React, { useRef } from 'react';
import { MdWarning } from 'react-icons/md';
import { ComponentHeader } from './headers/ComponentHeader';
import { useT } from '../i18n/useT';

export const ConfirmModal = ({ isOpen = true, title, message, onConfirm, onCancel }) => {
  const modalRef = useRef(null);
  const { t } = useT();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] overflow-hidden"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div 
        ref={modalRef}
        className="bg-white dark:bg-[#292a2d] w-full max-w-md rounded border border-[#dadce0] dark:border-[#3c4043] shadow-2xl flex flex-col overflow-hidden relative"
      >
        <div className="bg-white dark:bg-[#292a2d] relative z-10">
          <ComponentHeader 
            title={title} 
            icon={MdWarning} 
            onClose={onCancel} 
          />
        </div>
        
        <div className="p-6 flex flex-col bg-white dark:bg-[#292a2d] relative z-10">
          <p className="text-[13px] text-[#5f6368] dark:text-[#9aa0a6] mb-6 leading-relaxed">{message}</p>
          
          <div className="flex justify-end gap-3">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-4 h-[38px] rounded text-[13px] font-medium text-[#5f6368] dark:text-[#9aa0a6] hover:bg-[#f1f3f4] dark:hover:bg-[#3c4043] transition-colors"
            >
              {t('common.cancel')}
            </button>
            <button 
              type="button" 
              onClick={onConfirm} 
              className="px-4 h-[38px] btn-blue"
            >
              {t('common.confirm')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
