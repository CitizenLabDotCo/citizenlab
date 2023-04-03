export const eventFileData = {
  id: 'e728fcde-785b-4835-8e7e-8881206f2056',
  type: 'file',
  attributes: {
    file: {
      url: 'http://dummy/uploads/document.docx',
    },
    ordering: null,
    name: 'document.docx',
    size: 4310,
    created_at: '2023-03-02T09:12:53.162Z',
    updated_at: '2023-03-02T09:12:53.162Z',
  },
};

export default jest.fn(() => {
  return { data: { data: eventFileData } };
});
