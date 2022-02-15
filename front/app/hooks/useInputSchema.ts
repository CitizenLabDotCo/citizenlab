import { isAdmin, isProjectModerator } from 'services/permissions/roles';
import { isNilOrError } from 'utils/helperUtils';
import useAuthUser from './useAuthUser';
import useProjectAllowedInputTopics from './useProjectAllowedInputTopics';

export default function useInputSchema(projectId: string) {
  const allowedInputTopics = useProjectAllowedInputTopics(projectId);
  const authUser = useAuthUser();

  if (isNilOrError(authUser)) {
    return {};
  }

  return {
    schema: {
      type: 'object',
      properties: {
        title_multiloc: {
          type: 'object',
          minProperties: 1,
          properties: {
            en: {
              minLength: 10,
              maxLength: 80,
              type: 'string',
            },
            'nl-BE': {
              minLength: 10,
              maxLength: 80,
              type: 'string',
            },
            'fr-BE': {
              minLength: 10,
              maxLength: 80,
              type: 'string',
            },
          },
        },
        body_multiloc: {
          type: 'object',
          minLength: 3,
          minProperties: 1,
          properties: {
            en: {
              minLength: 40,
              // NTH custom validation strips html tags before counting
              type: 'string',
            },
            'nl-BE': {
              minLength: 40,
              type: 'string',
            },
            'fr-BE': {
              minLength: 40,
              type: 'string',
            },
          },
        },
        topic_ids: {
          type: 'array',
          prefixItems: [
            { type: 'string' },
            {
              enum: !isNilOrError(allowedInputTopics)
                ? allowedInputTopics.map(({ topicData }) => topicData.id)
                : [],
            },
          ],
        },
        idea_images_attributes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              image: {
                type: 'string',
              },
            },
          },
        },
        ...(isAdmin({ data: authUser }) ||
        isProjectModerator({ data: authUser }, projectId)
          ? {
              author_id: {
                type: 'string',
                default: authUser.id,
              },
            }
          : {}),
        idea_files_attributes: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              file: {
                type: 'string',
              },
              name: {
                type: 'string',
              },
            },
          },
        },
        location_point_geojson: {
          type: 'object',
          required: ['type', 'coordinates'],
          properties: {
            type: {
              type: 'string',
              enum: ['Point'],
            },
            coordinates: {
              type: 'array',
              minItems: 2,
              items: {
                type: 'number',
              },
            },
          },
        },
        location_description: {
          type: 'string',
        },
      },
      required: ['title_multiloc', 'body_multiloc'],
    },
    uiSchema: {
      type: 'Categorization',
      options: {
        // Used as an unique id for form accessibility and testing
        formId: 'idea-form',
        // must an InputTerm, for now only supports 'idea' and 'contribution' (used for error messages)
        inputTerm: 'idea',
      },
      elements: [
        {
          type: 'Category',
          label: "What's your idea ?",
          elements: [
            {
              type: 'VerticalLayout',
              render: 'multiloc',
              label: 'Title',
              elements: [
                {
                  type: 'Control',
                  locale: 'en',
                  scope: '#/properties/title_multiloc/properties/en',
                },
                {
                  type: 'Control',
                  locale: 'nl-BE',
                  scope: '#/properties/title_multiloc/properties/nl-BE',
                },
                {
                  type: 'Control',
                  locale: 'fr-BE',
                  scope: '#/properties/title_multiloc/properties/fr-BE',
                },
              ],
            },
            isAdmin({ data: authUser }) ||
            isProjectModerator({ data: authUser }, projectId)
              ? {
                  type: 'Control',
                  label: 'Author',
                  scope: '#/properties/author_id',
                }
              : null,
            {
              type: 'VerticalLayout',
              render: 'multiloc',
              label: 'Description',
              elements: [
                {
                  type: 'Control',
                  render: 'WYSIWYG',
                  locale: 'en',
                  scope: '#/properties/body_multiloc/properties/en',
                },
                {
                  type: 'Control',
                  render: 'WYSIWYG',
                  locale: 'nl-BE',
                  scope: '#/properties/body_multiloc/properties/nl-BE',
                },
                {
                  type: 'Control',
                  render: 'WYSIWYG',
                  locale: 'fr-BE',
                  scope: '#/properties/body_multiloc/properties/fr-BE',
                },
              ],
            },
          ].filter((val) => val),
        },
        {
          type: 'Category',
          label: 'Details',
          elements: [
            {
              type: 'Control',
              label: 'Tags',
              scope: '#/properties/topic_ids',
              options: !isNilOrError(allowedInputTopics)
                ? allowedInputTopics.map(({ topicData }) => ({
                    id: topicData.id,
                    attributes: {
                      title_multiloc: topicData.attributes.title_multiloc,
                    },
                  }))
                : [],
            },
            {
              type: 'Control',
              label: 'Location',
              scope: '#/properties/location_description',
            },
          ],
        },
        {
          type: 'Category',
          label: 'Images and Attachments',
          elements: [
            {
              type: 'Control',
              label: 'Image',
              scope: '#/properties/idea_images_attributes',
            },
            {
              type: 'Control',
              label: 'Attachments',
              scope: '#/properties/idea_files_attributes',
            },
          ],
        },
      ],
    },
  };
}
