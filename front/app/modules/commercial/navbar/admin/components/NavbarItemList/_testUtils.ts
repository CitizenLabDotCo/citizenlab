export const generateNavbarItems = (length: number) => {
  return Array(length)
    .fill(0)
    .map((_, i) => ({
      id: `_${i}`,
      attributes: {
        title_multiloc: { en: `English title ${i}` },
      },
    }));
};
