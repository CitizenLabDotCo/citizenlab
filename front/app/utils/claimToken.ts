const STORAGE_KEY = 'claim_tokens';
let inMemoryStorage: string[] = [];

let localStorageAvailable: boolean | undefined = undefined;

const isLocalStorageAvailable = () => {
  if (localStorageAvailable !== undefined) {
    return localStorageAvailable;
  }

  const test = 'test';

  try {
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    localStorageAvailable = true;
  } catch (e) {
    localStorageAvailable = false;
  }

  return localStorageAvailable;
};

export const storeClaimToken = (token: string) => {
  const storedTokens = getClaimTokens();
  if (storedTokens.includes(token)) {
    return;
  }

  if (isLocalStorageAvailable()) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...storedTokens, token]));
  } else {
    inMemoryStorage = [...storedTokens, token];
  }
};

export const getClaimTokens = () => {
  if (isLocalStorageAvailable()) {
    const tokensString = localStorage.getItem(STORAGE_KEY);
    const tokens = tokensString ? JSON.parse(tokensString) : [];

    if (Array.isArray(tokens) && tokens.every((t) => typeof t === 'string')) {
      return tokens;
    }

    return [];
  }

  return inMemoryStorage;
};

export const clearClaimTokens = () => {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    inMemoryStorage = [];
  }
};
