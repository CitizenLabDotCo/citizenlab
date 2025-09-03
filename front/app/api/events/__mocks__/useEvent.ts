import { IEventData } from '../types';

export const eventData: IEventData = {
  id: '1',
  type: 'event',
  attributes: {
    title_multiloc: {
      en: 'Council Meeting',
    },
    description_multiloc: {
      en: '<p>During this council meeting, those citizen initiatives that gained 100 reactions in less than 3 months, will be presented.</p><p>The council will then share their view on each idea.</p>',
    },
    location_multiloc: {
      en: 'Town hall',
    },
    location_point_geojson: {
      type: 'Point',
      coordinates: [4.3517103, 50.8503396],
    },
    address_1: 'Main Square',
    address_2_multiloc: {
      en: 'Main Square',
    },
    online_link: null,
    attendees_count: 50,
    maximum_attendees: 100,
    attend_button_multiloc: {
      en: 'Attend',
    },
    start_at: '2023-02-03T09:00:00.000Z',
    end_at: '2023-02-03T12:00:00.000Z',
    created_at: '2021-03-03T09:00:00.000Z',
    updated_at: '2021-03-03T09:00:00.000Z',
  },
  relationships: {
    project: {
      data: {
        id: '1',
        type: 'project',
      },
    },
    event_images: {
      data: [],
    },
    user_attendance: {
      data: {
        id: '1',
        type: 'event_attendance',
      },
    },
  },
};
