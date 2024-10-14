export const projectFilesData = [
  {
    id: '158898ed-46b6-4527-ad8b-096604b4de2d',
    type: 'file',
    attributes: {
      file: {
        url: 'http://localhost:4000/uploads/test.xlsx',
      },
      ordering: 3,
      name: 'test_likert_survey_results_download_2022-10-25.xlsx',
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
        url: 'http://localhost:4000/uploads/test2.xlsx',
      },
      ordering: null,
      name: 'test_likert_survey_results_download_2022-10-25.xlsx',
      size: 4369,
      created_at: '2023-03-01T03:34:20.022Z',
      updated_at: '2023-03-01T03:34:20.022Z',
    },
  },
];

export default jest.fn(() => {
  return { data: { data: projectFilesData } };
});
