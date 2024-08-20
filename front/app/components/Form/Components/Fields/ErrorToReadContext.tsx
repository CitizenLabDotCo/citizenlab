import React, { createContext, useState, useContext } from 'react';

interface ErrorToReadContextType {
  errorToReadId: string | null;
  setErrorToReadId: (id: string | null) => void;
}

const ErrorToReadContext = createContext<ErrorToReadContextType | undefined>(
  undefined
);

export const ErrorToReadProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [errorToReadId, setErrorToReadId] = useState<string | null>(null);

  return (
    <ErrorToReadContext.Provider value={{ errorToReadId, setErrorToReadId }}>
      {children}
    </ErrorToReadContext.Provider>
  );
};

export const useErrorToRead = () => {
  const context = useContext(ErrorToReadContext);
  if (!context) {
    throw new Error(
      'useErrorToRead must be used within an ErrorToReadProvider'
    );
  }
  return context;
};
