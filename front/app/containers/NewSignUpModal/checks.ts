export const accountCreatedSuccessfully = () => {
  // grab authUser object from stream.ts
  // make sure it exists and has email and required fields
  return new Promise((resolve) =>
    setTimeout(() => {
      resolve(true);
    }, 1500)
  );
};

export const emailConfirmationNecessary = () => {
  return new Promise((resolve) => resolve(true));
};

export const emailConfirmedSuccessfully = () => {
  return new Promise((resolve) => resolve(true));
};
