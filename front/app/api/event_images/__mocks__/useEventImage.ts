export const eventImageData = [
  {
    id: '30c1b604-71fd-4ac4-9cd7-3e5601d9cb0f',
    type: 'image',
    attributes: {
      ordering: null,
      created_at: '2023-02-28T05:56:37.762Z',
      updated_at: '2023-02-28T05:56:37.762Z',
      versions: {
        small: 'http://localhost:4000/uploads/small.png',
        medium: 'http://localhost:4000/uploads/medium.png',
        large: 'http://localhost:4000/uploads/large.png',
        fb: 'http://localhost:4000/uploads/fb.png',
      },
    },
  },
];

export const eventData = {
  id: 'be4efe5d-a740-4a9c-9d11-e3c90e7791cd',
  type: 'event',
  attributes: {
    title_multiloc: {
      en: 'New upcoming event',
      'fr-BE': 'New upcoming event',
      'nl-BE': 'New upcoming event',
    },
    location_multiloc: {},
    online_link: null,
    address_1: null,
    address_2_multiloc: {},
    location_point_geojson: null,
    attendees_count: 0,
    maximum_attendees: null,
    start_at: '2023-09-20T08:29:00.016Z',
    end_at: '2023-09-20T08:29:00.020Z',
    created_at: '2023-09-20T08:30:06.930Z',
    updated_at: '2023-09-20T08:30:06.930Z',
    description_multiloc: {
      en: '<p>New upcoming event</p>',
      'fr-BE': '<p>New upcoming event</p>',
      'nl-BE': '<p>New upcoming event</p>',
    },
  },
  relationships: {
    event_images: {
      data: [
        {
          id: '30c1b604-71fd-4ac4-9cd7-3e5601d9cb0f',
          type: 'image',
        },
      ],
    },
    project: {
      data: {
        id: '19ea3b6d-bae8-47c9-b9d9-834b98286b9c',
        type: 'project',
      },
    },
    user_attendance: {
      data: {
        id: 'be4efe5d-a740-4a9c-9d11-e3c90e7791cd',
        type: 'event_attendance',
      },
    },
  },
};
