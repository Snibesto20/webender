import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdCheckCircle, MdError, MdClose } from 'react-icons/md';

export const StatusMessage = ({ msg, type, onClose }) => {
  useEffect(() => {
    if (!msg) return;

    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, 3500);

    return () => clearTimeout(timer);
  }, [msg, onClose]);

  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 40, scale: 0.95 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className={`fixed bottom-6 right-6 z-[9999] flex flex-col rounded-lg text-[13px] border shadow-lg max-w-sm overflow-hidden min-w-[320px] ${
        isSuccess 
          ? 'bg-green-200 border-green-300 text-green-900 dark:bg-[#1c3d27] dark:border-green-800/60 dark:text-green-300' 
          : 'bg-red-200 border-red-300 text-red-900 dark:bg-[#3d1c1c] dark:border-red-800/60 dark:text-red-300'
      }`}
    >
      <div className="flex items-center gap-3 p-3.5">
        <div className="flex items-center gap-2 flex-1">
          {isSuccess ? (
            <MdCheckCircle size={18} className="text-green-700 dark:text-green-400 shrink-0" />
          ) : (
            <MdError size={18} className="text-red-700 dark:text-red-400 shrink-0" />
          )}
          <span className="font-medium leading-relaxed break-words">{msg}</span>
        </div>

        <button 
          onClick={onClose} 
          className={`p-1.5 rounded transition-all inline-flex items-center justify-center shrink-0 ${
            isSuccess
              ? 'text-green-700 dark:text-green-400 hover:bg-green-300/60 dark:hover:bg-green-900/30'
              : 'text-red-700 dark:text-red-400 hover:bg-red-300/60 dark:hover:bg-red-900/20'
          }`}
        >
          <MdClose size={16} />
        </button>
      </div>

      <div className="w-full h-[3px] bg-black/10 dark:bg-white/5 overflow-hidden relative">
        <motion.div
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: 3.5, ease: 'linear' }}
          className={`h-full absolute top-0 left-0 ${
            isSuccess ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'
          }`}
        />
      </div>
    </motion.div>
  );
};