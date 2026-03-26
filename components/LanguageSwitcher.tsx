'use client';
import { useI18n } from '@/lib/i18n/store';

export default function LanguageSwitcher() {
  const { lang, setLanguage } = useI18n();

  const toggle = () => setLanguage(lang === 'en' ? 'hi' : 'en');

  return (
    <button
      data-testid="language-switcher"
      onClick={toggle}
      title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.04] hover:bg-primary/10 hover:border-primary/40 transition-all text-xs font-bold tracking-wider text-slate-200"
    >
      <span className="text-base leading-none">{lang === 'en' ? '🇮🇳' : '🇺🇸'}</span>
      <span>{lang === 'en' ? 'HI' : 'EN'}</span>
    </button>
  );
}
