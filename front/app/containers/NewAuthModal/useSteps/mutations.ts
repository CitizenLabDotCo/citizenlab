export const createAccount = (_email: string, _password?: string) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1500));
};

export const confirmCode = (_code: string) => {
  return new Promise((resolve) => setTimeout(() => resolve(true), 1500));
};
