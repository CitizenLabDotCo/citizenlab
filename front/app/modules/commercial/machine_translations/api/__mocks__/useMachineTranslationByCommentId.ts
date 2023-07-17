export const machineTranslationData = {
  id: '44c71081-7413-4b39-885d-232e78b2df53',
  type: 'machine_translation',
  attributes: {
    attribute_name: 'body_multiloc',
    translation: 'test translation',
    locale_to: 'nl-BE',
  },
};

export default jest.fn(() => {
  return { data: { data: machineTranslationData } };
});
