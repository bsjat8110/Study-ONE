import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { en } from './en';
import { hi } from './hi';

type Language = 'en' | 'hi';

interface I18nState {
  lang: Language;
  t: typeof en;
  setLanguage: (lang: Language) => void;
}

export const useI18n = create<I18nState>()(
  persist(
    (set) => ({
      lang: 'en',
      t: en,
      setLanguage: (lang) => set({ lang, t: lang === 'en' ? en : hi }),
    }),
    {
      name: 'study-one-i18n',
      version: 1, // BUMPING VERSION to force clear old localStorage cache
      partialize: (state) => ({ lang: state.lang }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          useI18n.setState({ t: state.lang === 'en' ? en : hi });
        }
      },
      migrate: (persistedState: any, version: number) => {
        // For old versions (0 or undefined), just keep the language and discard everything else
        return {
          lang: persistedState?.lang || 'en',
          t: persistedState?.lang === 'hi' ? hi : en,
        } as I18nState;
      },
    }
  )
);

// Alias for backward compatibility
export const useLang = useI18n;
