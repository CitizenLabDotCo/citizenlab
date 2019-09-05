const mockQuestion = (id, titleEn, options) => ({
  id,
  attributes: {
    title_multiloc: {
      en: titleEn
    }
  },
  relationships: {
    options: {
      data: options
    }
  }
});
