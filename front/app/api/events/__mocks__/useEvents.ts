export const eventsData = [
  {
    id: '1',
    type: 'event',
    attributes: {
      project_id: '1',
      title_multiloc: {
        en: 'Council Meeting',
      },
      description_multiloc: {
        en: '<p>During this council meeting, those citizen initiatives that gained 100 reactions in less than 3 months, will be presented.</p><p>The council will then share their view on each idea.</p>',
      },
      address_1: 'Town hall',
      location_point_geojson: {
        type: 'Point',
        coordinates: [4.3517103, 50.8503396],
      },
      start_at: '2023-02-03T09:00:00.000Z',
      end_at: '2023-02-03T12:00:00.000Z',
      created_at: '2021-03-03T09:00:00.000Z',
      updated_at: '2021-03-03T09:00:00.000Z',
    },
  },
  {
    id: '2',
    type: 'event',
    attributes: {
      project_id: '2',
      title_multiloc: {
        en: 'Reacting for ideas',
      },
      description_multiloc: {
        en: 'We will be reacting for the ideas that we want to see implemented in our city.',
      },
      address_1: 'Town hall',
      location_point_geojson: {
        type: 'Point',
        coordinates: [4.3517103, 50.8503396],
      },
      start_at: '2023-03-03T09:00:00.000Z',
      end_at: '2023-03-03T12:00:00.000Z',
      created_at: '2021-03-03T09:00:00.000Z',
      updated_at: '2021-03-03T09:00:00.000Z',
    },
  },
];

export default jest.fn(() => {
  return { data: { data: eventsData } };
});
