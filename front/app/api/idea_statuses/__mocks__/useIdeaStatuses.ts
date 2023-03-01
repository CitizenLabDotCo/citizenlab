export const ideaStatusesData = [
  {
    id: '1',
    type: 'idea_status',
    attributes: {
      code: 'new',
      name_multiloc: {
        en: 'New',
      },
      color: '#FF0000',
      ordering: 1,
      created_at: '2021-03-03T09:00:00.000Z',
      updated_at: '2021-03-03T09:00:00.000Z',
    },
  },
  {
    id: '2',
    type: 'idea_status',
    attributes: {
      code: 'in_progress',
      name_multiloc: {
        en: 'In progress',
      },
      color: '#00FF00',
      ordering: 2,
      created_at: '2021-03-03T09:00:00.000Z',
      updated_at: '2021-03-03T09:00:00.000Z',
    },
  },
];

export default jest.fn(() => {
  return { data: { data: ideaStatusesData } };
});
