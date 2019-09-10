export const mockQuestion = (id, titleEn, options, pcId, pcType) => ({
  id,
  attributes: {
    title_multiloc: {
      en: titleEn
    }
  },
  relationships: {
    options: {
      data: options
    },
    participation_context: {
      data: {
        id: pcId,
        type: pcType
      }
    },
  }
});
