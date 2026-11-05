type ClaimToken = {
  token: string;
  expiryDate: string;
};

let claimToken: ClaimToken | null = null;

export const storeClaimToken = (token: string, expiryDate: string) => {
  claimToken = { token, expiryDate };
};

export const clearClaimToken = () => {
  claimToken = null;
};

// The backend accepts an array of claim tokens,
// even though for now we only support one claim token at the
// time in the FE.
export const getClaimTokens = (): string[] => {
  const isExpired = (claimToken: ClaimToken) => {
    return new Date(claimToken.expiryDate) <= new Date();
  };

  if (!claimToken || isExpired(claimToken)) return [];

  return [claimToken.token];
};
