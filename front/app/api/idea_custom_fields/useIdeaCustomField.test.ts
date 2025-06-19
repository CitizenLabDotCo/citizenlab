import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { ideaCustomFieldsData } from './__mocks__/useIdeaCustomFields';
import useIdeaCustomField from './useIdeaCustomField';

const apiPath = '*/web_api/v1/projects/:projectId/custom_fields/:customFieldId';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: ideaCustomFieldsData[0] },
      { status: 200 }
    );
  })
);

describe('useIdeaCustomField', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result } = renderHook(
      () =>
        useIdeaCustomField({
          projectId: 'projectId',
          customFieldId: 'customFieldId',
        }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(ideaCustomFieldsData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () =>
        useIdeaCustomField({
          projectId: 'projectId',
          customFieldId: 'customFieldId',
        }),
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
