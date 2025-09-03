import { SchemaResponse } from '../types';

export const projectResponse: SchemaResponse = {
  data: {
    type: 'schema',
    attributes: {
      json_schema_multiloc: {
        en: {
          type: 'object',
          additionalProperties: false,
          properties: {
            field_1: {
              type: 'string',
            },
            field_2: {
              type: 'string',
            },
          },
          required: ['field_2'],
        },
      },
      ui_schema_multiloc: {
        en: {
          type: 'VerticalLayout',
          options: {
            formId: 'user-form',
          },
          elements: [],
        },
      },
    },
  },
};

export const phaseResponse: SchemaResponse = {
  data: {
    type: 'schema',
    attributes: {
      json_schema_multiloc: {
        en: {
          type: 'object',
          additionalProperties: false,
          properties: {
            field_3: {
              type: 'string',
            },
            field_4: {
              type: 'string',
            },
          },
          required: ['field_3'],
        },
      },
      ui_schema_multiloc: {
        en: {
          type: 'VerticalLayout',
          options: {
            formId: 'user-form',
          },
          elements: [],
        },
      },
    },
  },
};

export const ideaResponse: SchemaResponse = {
  data: {
    type: 'schema',
    attributes: {
      json_schema_multiloc: {
        en: {
          type: 'object',
          additionalProperties: false,
          properties: {
            field_3: {
              type: 'string',
            },
            field_4: {
              type: 'string',
            },
          },
          required: ['field_4'],
        },
      },
      ui_schema_multiloc: {
        en: {
          type: 'VerticalLayout',
          options: {
            formId: 'user-form',
          },
          elements: [],
        },
      },
    },
  },
};
