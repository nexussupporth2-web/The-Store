import React, { useState, useEffect, useRef } from 'react';
import { Lock, KeyRound, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { computeSha256 } from '../utils/helpers';
import { StoreConfig } from '../types';

interface LockModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: StoreConfig;
  onUnlockSuccess: () => void;
}

export const LockModal: React.FC<LockModalProps> = ({
  isOpen,
  onClose,
  config,
  onUnlockSuccess,
}) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUnlock = async () => {
    if (!password) {
      setError('Please enter a password');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const hash = await computeSha256(password);
      // Check if hash matches configured pwHash, or check common demo defaults
      const isMatch =
        hash === config.pwHash ||
        password.toLowerCase() === 'admin' ||
        password.toLowerCase() === 'hearth' ||
        password === '123456';

      if (isMatch) {
        onUnlockSuccess();
        onClose();
      } else {
        setError('Wrong password. Try again or use quick unlock.');
      }
    } catch (err) {
      setError('Could not verify password on this connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickUnlock = () => {
    onUnlockSuccess();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#16231f] rounded-2xl shadow-2xl p-6 border border-gray-200 dark:border-[#263631]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="lock-modal-title"
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2.5">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: `${config.accent}25`, color: config.accent }}
            >
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 id="lock-modal-title" className="font-bold text-lg font-display text-gray-900 dark:text-gray-100">
                Designer Access
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Unlock store customization & catalog tools
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUnlock();
          }}
          className="mt-5 space-y-4"
        >
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
              Admin Password
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                id="lpw"
                type="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError(null);
                }}
                placeholder="Enter password..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#0e1815] text-gray-900 dark:text-gray-100 text-sm focus:outline-none focus:ring-2"
                style={{ outlineColor: config.accent }}
              />
              <Lock className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
            </div>
            {error && (
              <div className="mt-2 text-xs text-red-600 dark:text-red-400 flex items-center gap-1.5 font-medium">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-2 pt-1">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl font-bold text-white shadow-sm flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50"
              style={{ backgroundColor: config.brand }}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{loading ? 'Verifying...' : 'Unlock Editor'}</span>
            </button>

            {/* Quick Demo Bypass for easy testing in AI Studio */}
            <button
              type="button"
              onClick={handleQuickUnlock}
              className="w-full py-2 px-3 rounded-xl text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 transition-colors"
            >
              Demo / Owner 1-Click Access
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs font-medium text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
