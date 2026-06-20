'use client';
import { useRef, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store, initializeStoreFromLocalStorage } from '@/store';

export default function StoreProvider({ children }: { children: React.ReactNode }) {
  const initialized = useRef(false);
  
  if (!initialized.current) {
    // Run initialization once during state creation
    initializeStoreFromLocalStorage();
    initialized.current = true;
  }

  useEffect(() => {
    // Load local storage saved state upon mounting
    initializeStoreFromLocalStorage();
  }, []);

  return <Provider store={store}>{children}</Provider>;
}
