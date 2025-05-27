import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import useIdeaJsonFormSchema from './useIdeaJsonFormSchema';

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
              type: 'Page',
              options: {
                id: '5962086a-853a-4bea-930b-3d0eaf349fdb',
                description: '',
                input_type: 'page',
                map_config_id: null,
                page_layout: 'default',
                title: 'What is your idea?',
              },
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
      http.get(projectPath, () => {
        return HttpResponse.json({ data: schemaData }, { status: 200 });
      })
    );
    const { result } = renderHook(
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
      http.get(phasePath, () => {
        return HttpResponse.json({ data: schemaData }, { status: 200 });
      })
    );
    const { result } = renderHook(
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
      http.get(inputPath, () => {
        return HttpResponse.json({ data: schemaData }, { status: 200 });
      })
    );
    const { result } = renderHook(
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
      http.get(projectPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
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
