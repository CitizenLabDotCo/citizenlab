import { ICustomFields } from 'api/custom_fields/types';

export const projectResponse: ICustomFields = {
  included: [],
  data: [
    {
      id: 'field_1',
      type: 'custom_field',
      attributes: {
        key: 'field_1',
        input_type: 'text',
        title_multiloc: { en: 'Field 1' },
        description_multiloc: { en: 'Description for field 1' },
        required: false,
        enabled: true,
        ordering: 1,
        logic: {},
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      },
      relationships: {
        options: { data: [] },
      },
    },
    {
      id: 'field_2',
      type: 'custom_field',
      attributes: {
        key: 'field_2',
        input_type: 'text',
        title_multiloc: { en: 'Field 2' },
        description_multiloc: { en: 'Description for field 2' },
        required: true,
        enabled: true,
        ordering: 2,
        logic: {},
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      },
      relationships: {
        options: { data: [] },
      },
    },
  ],
};

export const phaseResponse: ICustomFields = {
  included: [],
  data: [
    {
      id: 'field_3',
      type: 'custom_field',
      attributes: {
        key: 'field_3',
        input_type: 'text',
        title_multiloc: { en: 'Field 3' },
        description_multiloc: { en: 'Description for field 3' },
        required: true,
        enabled: true,
        ordering: 1,
        logic: {},
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      },
      relationships: {
        options: { data: [] },
      },
    },
    {
      id: 'field_4',
      type: 'custom_field',
      attributes: {
        key: 'field_4',
        input_type: 'text',
        title_multiloc: { en: 'Field 4' },
        description_multiloc: { en: 'Description for field 4' },
        required: false,
        enabled: true,
        ordering: 2,
        logic: {},
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      },
      relationships: {
        options: { data: [] },
      },
    },
  ],
};

export const ideaResponse: ICustomFields = {
  included: [],
  data: [
    {
      id: 'field_3',
      type: 'custom_field',
      attributes: {
        key: 'field_3',
        input_type: 'text',
        title_multiloc: { en: 'Field 3' },
        description_multiloc: { en: 'Description for field 3' },
        required: false,
        enabled: true,
        ordering: 1,
        logic: {},
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      },
      relationships: {
        options: { data: [] },
      },
    },
    {
      id: 'field_4',
      type: 'custom_field',
      attributes: {
        key: 'field_4',
        input_type: 'text',
        title_multiloc: { en: 'Field 4' },
        description_multiloc: { en: 'Description for field 4' },
        required: true,
        enabled: true,
        ordering: 2,
        logic: {},
        created_at: '2023-01-01T00:00:00.000Z',
        updated_at: '2023-01-01T00:00:00.000Z',
      },
      relationships: {
        options: { data: [] },
      },
    },
  ],
};
