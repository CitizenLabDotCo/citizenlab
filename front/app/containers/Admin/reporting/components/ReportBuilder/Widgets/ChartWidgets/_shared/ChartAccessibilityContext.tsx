import React, { createContext, useContext, ReactNode } from 'react';

interface ChartAccessibilityContextType {
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

const ChartAccessibilityContext = createContext<
  ChartAccessibilityContextType | undefined
>(undefined);

interface ChartAccessibilityProviderProps {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  children: ReactNode;
}

export const ChartAccessibilityProvider = ({
  ariaLabel,
  ariaDescribedBy,
  children,
}: ChartAccessibilityProviderProps) => {
  return (
    <ChartAccessibilityContext.Provider
      value={{
        ariaLabel,
        ariaDescribedBy,
      }}
    >
      {children}
    </ChartAccessibilityContext.Provider>
  );
};

export const useChartAccessibility = () => {
  const context = useContext(ChartAccessibilityContext);
  if (context === undefined) {
    return {};
  }
  return context;
};
