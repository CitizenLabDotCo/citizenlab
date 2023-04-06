import { renderHook } from '@testing-library/react-hooks';

import useIdeaJsonFormSchema from './useIdeaJsonFormSchema';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const projectPath = '*projects/:projectId/custom_fields/json_forms_schema';
const phasePath = '*phases/:phaseId/custom_fields/json_forms_schema';
const inputPath = '*ideas/:inputId/json_forms_schema';

const schemaData = {
  data: {
    type: 'json_forms_schema',
    attributes: {
      json_schema_multiloc: {
        en: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title_multiloc: {
              type: 'object',
              minProperties: 1,
              properties: {
                en: { type: 'string', minLength: 10, maxLength: 80 },
              },
            },
            body_multiloc: {
              type: 'object',
              minProperties: 1,
              properties: {
                en: { type: 'string', minLength: 40 },
              },
            },
          },
          required: ['title_multiloc', 'body_multiloc'],
        },
      },
      ui_schema_multiloc: {
        en: {
          type: 'Categorization',
          options: { formId: 'idea-form', inputTerm: 'idea' },
          elements: [
            {
              type: 'Category',
              label: 'What is your idea?',
              options: {
                id: '5962086a-853a-4bea-930b-3d0eaf349fdb',
                description: '',
              },
              elements: [
                {
                  type: 'VerticalLayout',
                  options: { input_type: 'text_multiloc', render: 'multiloc' },
                  elements: [
                    {
                      type: 'Control',
                      scope: '#/properties/title_multiloc/properties/en',
                      label: 'Title',
                      options: {
                        description: '',
                        isAdminField: false,
                        hasRule: false,
                        answer_visible_to: 'public',
                        trim_on_blur: true,
                        locale: 'en',
                      },
                    },
                  ],
                },

                {
                  type: 'VerticalLayout',
                  options: { input_type: 'html_multiloc', render: 'multiloc' },
                  elements: [
                    {
                      type: 'Control',
                      scope: '#/properties/body_multiloc/properties/en',
                      label: 'Description',
                      options: {
                        description: '',
                        isAdminField: false,
                        hasRule: false,
                        answer_visible_to: 'public',
                        render: 'WYSIWYG',
                        locale: 'en',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      },
    },
  },
};

const server = setupServer();

describe('useIdeaJsonFormSchema', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly with projectId', async () => {
    server.use(
      rest.get(projectPath, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: schemaData }));
      })
    );
    const { result, waitFor } = renderHook(
      () => useIdeaJsonFormSchema({ projectId: 'projectId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(schemaData);
  });

  it('returns data correctly with phaseId', async () => {
    server.use(
      rest.get(phasePath, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: schemaData }));
      })
    );
    const { result, waitFor } = renderHook(
      () => useIdeaJsonFormSchema({ phaseId: 'phaseId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(schemaData);
  });

  it('returns data correctly with inputId', async () => {
    server.use(
      rest.get(inputPath, (_req, res, ctx) => {
        return res(ctx.status(200), ctx.json({ data: schemaData }));
      })
    );
    const { result, waitFor } = renderHook(
      () => useIdeaJsonFormSchema({ inputId: 'inputId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(schemaData);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.get(projectPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
      () => useIdeaJsonFormSchema({ projectId: 'projectId' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });
});
