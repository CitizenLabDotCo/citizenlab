export const getFontSize = (size: number, digits: number) => {
  if (size >= 34) {
    if (digits <= 2) {
      return 14;
    }

    if (digits === 3) {
      return 12;
    }

    if (digits >= 4) {
      return 11;
    }
  } else {
    if (digits <= 2) {
      return 12;
    }

    if (digits === 3) {
      return 11;
    }

    if (digits >= 4) {
      return 10;
    }
  }

  return 14;
};
