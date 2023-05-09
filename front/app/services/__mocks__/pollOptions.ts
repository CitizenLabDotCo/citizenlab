export const mockOption = (id: string, titleEn: string) => ({
  id,
  attributes: {
    title_multiloc: {
      en: titleEn,
    },
  },
});
