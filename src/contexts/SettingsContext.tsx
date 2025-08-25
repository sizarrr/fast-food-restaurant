import { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'AED';

export interface StoreInfo {
  name: string;
  addressLine1: string;
  phone: string;
}

export interface SettingsState {
  store: StoreInfo;
  currency: CurrencyCode;
  taxRatePercent: number; // e.g. 8.5 for 8.5%
  discountPercent: number; // optional global discount, default 0
  lowStockThreshold: number; // e.g. 5
}

interface SettingsContextType {
  settings: SettingsState;
  updateSettings: (partial: Partial<SettingsState>) => void;
  formatCurrency: (value: number) => string;
}

const DEFAULT_SETTINGS: SettingsState = {
  store: {
    name: 'FastFood POS',
    addressLine1: '123 Restaurant Street',
    phone: '(555) 123-4567',
  },
  currency: 'USD',
  taxRatePercent: 0,
  discountPercent: 0,
  lowStockThreshold: 5,
};

const LOCAL_STORAGE_KEY = 'ffpos_settings_v1';

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider = ({ children }: { children: ReactNode }) => {
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (!raw) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(raw) as SettingsState;
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  const updateSettings = (partial: Partial<SettingsState>) => {
    setSettings(prev => ({ ...prev, ...partial, store: { ...prev.store, ...(partial.store || {}) } }));
  };

  const formatCurrency = useMemo(() => {
    return (value: number) =>
      new Intl.NumberFormat(undefined, { style: 'currency', currency: settings.currency }).format(value);
  }, [settings.currency]);

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    formatCurrency,
  };

  return (
    <SettingsContext.Provider value={contextValue}>{children}</SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
};

