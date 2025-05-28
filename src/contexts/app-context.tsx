
'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';

// Define a type for your context's value
// For now, it can be an empty object or have minimal properties
type AppContextType = {
  // Example: a function or a piece of state
  // greet?: () => string;
};

// Create the context with a default value
// Using undefined as default and checking in useAppContext is a common pattern
const AppContext = createContext<AppContextType | undefined>(undefined);

// Create a provider component
export function AppProvider({ children }: { children: ReactNode }) {
  // You can add state and functions here that you want to share via context
  const value: AppContextType = {
    // greet: () => 'Hello from AppContext!',
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// Create a custom hook to use the AppContext
// This hook provides a convenient way to access the context value
// and also ensures the context is used within an AppProvider
export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}
