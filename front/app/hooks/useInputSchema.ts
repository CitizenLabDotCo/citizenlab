import { useEffect, useState } from 'react';
import {
  ideaJsonFormsSchemaStream,
  IIdeaJsonFormSchemas,
} from 'services/ideaJsonFormsSchema';
import { ITopicData } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';

export default (projectId) => {
  const [schema, setSchema] = useState<IIdeaJsonFormSchemas['schema'] | null>(
    null
  );
  const [uiSchema, setUiSchema] = useState<
    IIdeaJsonFormSchemas['ui_schema'] | null
  >(null);

  useEffect(() => {
    if (!projectId) return;

    const observable = ideaJsonFormsSchemaStream(projectId).observable;

    const subscription = observable.subscribe((response) => {
      setSchema(response.schema);
      setUiSchema(response.ui_schema);
    });

    return () => subscription.unsubscribe();
  }, [projectId]);

  return { schema, uiSchema };

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
              // TODO custom validation sanitizes html before counting
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
              enum: !isNilOrError(topics)
                ? topics
                    .filter((topic) => !isNilOrError(topic))
                    .map((topic: ITopicData) => topic.id)
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
        attachments: {
          type: 'string',
          properties: {},
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
        submit: 'ButtonBar',
        // Used as an unique id for form accessibility
        formId: 'ideaForm',
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
          ],
        },
        {
          type: 'Category',
          label: 'Details',
          elements: [
            {
              type: 'Control',
              label: 'Tags',
              scope: '#/properties/topic_ids',
              options: !isNilOrError(topics)
                ? topics
                    .filter((topic) => !isNilOrError(topic))
                    .map((topic: ITopicData) => ({
                      id: topic.id,
                      attributes: {
                        title_multiloc: topic.attributes.title_multiloc,
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
              scope: '#/properties/attachments',
            },
          ],
        },
      ],
    },
  };
};
