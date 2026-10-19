// Per-browser preferences. Storage can be missing or blocked (private
// windows, cleared site data), so a failed read or write is not an error.
export const readStored = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

export const writeStored = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    return;
  }
};
