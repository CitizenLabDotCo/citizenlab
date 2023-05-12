export const phaseFilesData = [
  {
    id: '158898ed-46b6-4527-ad8b-096604b4de2d',
    type: 'file',
    attributes: {
      file: {
        url: 'url/test.xlsx',
      },
      ordering: null,
      name: 'test.xlsx',
      size: 4369,
      created_at: '2023-03-01T03:34:20.022Z',
      updated_at: '2023-03-01T03:34:20.022Z',
    },
  },
  {
    id: '678898ed-46b6-4527-ad8b-096604b4dcyt',
    type: 'file',
    attributes: {
      file: {
        url: 'url/test2.xlsx',
      },
      ordering: null,
      name: 'test2.xlsx',
      size: 4369,
      created_at: '2023-03-01T03:34:20.022Z',
      updated_at: '2023-03-01T03:34:20.022Z',
    },
  },
];

export default jest.fn(() => {
  return { data: { data: phaseFilesData } };
});
