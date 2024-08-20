import React, { createContext, useState, useContext } from 'react';

interface ErrorToReadContextType {
  errorToReadId: string | null; // Holds the ID of the error message to be read out by the screen reader
  announceError: (id: string) => void;
}

// Create a context to manage the ID of the error message that should be read out.
// We use because we need a way to specify which error message is read out.
const ErrorToReadContext = createContext<ErrorToReadContextType | undefined>(
  undefined
);

export const ErrorToReadProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [errorToReadId, setErrorToReadId] = useState<string | null>(null);

  const announceError = (id: string) => {
    // Temporarily clear the errorToReadId to ensure re-reading
    setErrorToReadId(null);

    // Set the errorToReadId after a small delay to trigger re-reading
    setTimeout(() => {
      setErrorToReadId(id);
    }, 100); // Small delay to ensure the DOM has updated
  };

  return (
    <ErrorToReadContext.Provider value={{ errorToReadId, announceError }}>
      {children}
    </ErrorToReadContext.Provider>
  );
};

// Hook to access and use the error message ID context
export const useErrorToRead = () => {
  const context = useContext(ErrorToReadContext);
  if (!context) {
    throw new Error(
      'useErrorToRead must be used within an ErrorToReadProvider'
    );
  }
  return context;
};
