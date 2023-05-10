export const mockOption = (id: string, titleEn: string, ordering: number) => ({
  type: 'option' as const,
  id,
  attributes: {
    title_multiloc: {
      en: titleEn,
    },
    ordering,
  },
});
