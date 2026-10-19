import React, { useRef } from 'react';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { StoreConfig } from '../types';

interface FooterProps {
  config: StoreConfig;
  onSecretHold: () => void;
  onOpenDesigner: () => void;
  isUnlocked: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  config,
  onSecretHold,
}) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const cleanPhone = config.phone.replace(/[^\d+]/g, '');
  const cleanWhatsApp = config.whatsapp.replace(/\D/g, '');

  const startHold = () => {
    timerRef.current = setTimeout(() => {
      onSecretHold();
    }, 5000);
  };

  const clearHold = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <footer className="mt-16 bg-white dark:bg-[#16231f] border-t border-gray-200 dark:border-[#263631] py-10 px-4 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6 text-sm text-gray-600 dark:text-gray-400">
        {/* NGO Description */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-base text-gray-900 dark:text-gray-100 font-display">
            {config.name}
          </h4>
          <p className="leading-relaxed text-gray-600 dark:text-gray-300">
            {config.ngoDescription || 'Empowering housewives and women artisans through sustainable livelihoods, artisanal skill training, and financial independence.'}
          </p>
        </div>

        {/* Contact links */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs md:text-sm pt-1">
          <a
            href={`tel:${cleanPhone}`}
            className="inline-flex items-center gap-1.5 text-gray-800 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            <span>{config.phone}</span>
          </a>

          <span className="text-gray-300 dark:text-gray-700">&bull;</span>

          <a
            href={`mailto:${config.email}`}
            className="inline-flex items-center gap-1.5 text-gray-800 dark:text-gray-200 hover:text-emerald-700 dark:hover:text-emerald-400 font-medium transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-emerald-600" />
            <span>{config.email}</span>
          </a>

          <span className="text-gray-300 dark:text-gray-700">&bull;</span>

          <a
            href={`https://wa.me/${cleanWhatsApp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 hover:underline font-semibold"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Us</span>
          </a>
        </div>

        {/* Footer bottom bar with 5-second hold */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
          <div>
            <span
              id="pw"
              onPointerDown={startHold}
              onPointerUp={clearHold}
              onPointerCancel={clearHold}
              onContextMenu={(e) => e.preventDefault()}
              className="cursor-pointer select-none py-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors inline-block"
              title="Hold for 5 seconds to access admin portal"
            >
              {config.poweredBy}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
