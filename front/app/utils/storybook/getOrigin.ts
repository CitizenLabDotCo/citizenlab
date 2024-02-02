export const getOrigin = () => {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  return 'http://localhost:6006';
};
