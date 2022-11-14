export const schema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    short_answer: {
      type: 'string',
    },
    boolean: {
      type: 'boolean',
    },
    multiple_choice: {
      type: 'string',
      oneOf: [
        {
          const: 'oranges',
          title: 'Oranges',
        },
        {
          const: 'mangoes',
          title: 'Mangoes',
        },
        {
          const: 'pineapples',
          title: 'Pineapples',
        },
      ],
    },
    areas: {
      type: 'string',
      oneOf: [
        {
          const: 'kyanja',
          title: 'Kyanja',
        },
        {
          const: 'naalya',
          title: 'Naalya',
        },
        {
          const: 'bugoloobi',
          title: 'Bugoloobi',
        },
      ],
    },
    favorite_color: {
      type: 'array',
      uniqueItems: true,
      minItems: 0,
      items: {
        type: 'string',
        oneOf: [
          {
            const: 'blue',
            title: 'Blue',
          },
          {
            const: 'red',
            title: 'Red',
          },
        ],
      },
    },
    linear_scale: {
      type: 'number',
      minimum: 1,
      maximum: 5,
    },
    number: {
      type: 'number',
    },
    location_description: {
      type: 'string',
    },
    sport: {
      type: 'string',
      oneOf: [
        {
          const: 'soccer',
          title: 'Soccer',
        },
        {
          const: 'basketball',
          title: 'Basket ball',
        },
        {
          const: 'netball',
          title: 'Netball',
        },
      ],
    },
  },
  required: [
    'short_answer',
    'multiple_choice',
    'areas',
    'favorite_color',
    'linear_scale',
    'number',
  ],
};
