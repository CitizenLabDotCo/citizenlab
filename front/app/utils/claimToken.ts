const STORAGE_KEY = 'claim_tokens_with_expiration_date';
let inMemoryStorage: ClaimToken[] = [];

let localStorageAvailable: boolean | undefined = undefined;

type ClaimToken = {
  token: string;
  expirationDate: string;
};

const isClaimToken = (obj: any): obj is ClaimToken => {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    typeof obj.token === 'string' &&
    typeof obj.expirationDate === 'string'
  );
};

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

export const storeClaimToken = (claimToken: ClaimToken) => {
  const storedTokens = getUnexpiredClaimTokens();
  if (
    storedTokens
      .map((storedToken) => storedToken.token)
      .includes(claimToken.token)
  ) {
    return;
  }

  if (isLocalStorageAvailable()) {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([...storedTokens, claimToken])
    );
  } else {
    inMemoryStorage = [...storedTokens, claimToken];
  }
};

export const getUnexpiredClaimTokens = () => {
  const getClaimTokens = () => {
    if (isLocalStorageAvailable()) {
      const tokensString = localStorage.getItem(STORAGE_KEY);
      const tokens = tokensString ? JSON.parse(tokensString) : [];

      if (Array.isArray(tokens) && tokens.every(isClaimToken)) {
        return tokens;
      }

      return [];
    }

    return inMemoryStorage;
  };

  const claimTokens = getClaimTokens();

  return claimTokens.filter(
    (token) => new Date(token.expirationDate) > new Date()
  );
};

export const clearClaimTokens = () => {
  if (isLocalStorageAvailable()) {
    localStorage.removeItem(STORAGE_KEY);
  } else {
    inMemoryStorage = [];
  }
};
