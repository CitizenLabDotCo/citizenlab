import { useState } from 'react';

const readDismissed = (storageKey: string) => {
  try {
    return localStorage.getItem(storageKey) === 'true';
  } catch {
    return false;
  }
};

const useDismissed = (storageKey: string) => {
  const [dismissed, setDismissed] = useState(() => readDismissed(storageKey));

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(storageKey, 'true');
    } catch {
      return;
    }
  };

  return { dismissed, dismiss };
};

export default useDismissed;
