
import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../store/ThemeContext';
import clsx from 'clsx';

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      className={clsx(
        "relative w-16 h-9 rounded-full p-1 flex items-center transition-colors duration-500 border",
        isDark ? "bg-[#0A0E27] border-white/10" : "bg-blue-100 border-blue-200"
      )}
      aria-label="Toggle Theme"
    >
      {/* Track Icons */}
      <div className="absolute inset-0 flex justify-between items-center px-2 pointer-events-none">
        <Sun size={14} className={clsx("transition-opacity duration-300", isDark ? "opacity-40 text-yellow-500" : "opacity-0")} />
        <Moon size={14} className={clsx("transition-opacity duration-300", isDark ? "opacity-0" : "opacity-40 text-indigo-500")} />
      </div>

      {/* Sliding Knob */}
      <motion.div
        className={clsx(
          "w-7 h-7 rounded-full shadow-lg flex items-center justify-center z-10",
          isDark ? "bg-[#1e1e24]" : "bg-white"
        )}
        layout
        transition={{
          type: "spring",
          stiffness: 700,
          damping: 30
        }}
        animate={{
          x: isDark ? 30 : 0
        }}
      >
        <AnimateIcon isDark={isDark} />
      </motion.div>
    </button>
  );
};

const AnimateIcon = ({ isDark }: { isDark: boolean }) => (
  <motion.div
    key={isDark ? "moon" : "sun"}
    initial={{ rotate: -180, opacity: 0 }}
    animate={{ rotate: 0, opacity: 1 }}
    exit={{ rotate: 180, opacity: 0 }}
    transition={{ duration: 0.3 }}
  >
    {isDark ? (
      <Moon size={14} className="text-indigo-400" />
    ) : (
      <Sun size={14} className="text-yellow-500" />
    )}
  </motion.div>
);

export default ThemeToggle;
