import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { projectDescriptionBuilderLayoutData } from './__mocks__/projectDescriptionBuilderLayout';
import useAddProjectDescriptionBuilderLayout from './useAddProjectDescriptionBuilderLayout';

const apiPath =
  '*projects/:projectId/content_builder_layouts/project_description/upsert';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json(
      { data: projectDescriptionBuilderLayoutData },
      { status: 200 }
    );
  })
);

describe('useAddProjectDescriptionBuilderLayout', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(
      () => useAddProjectDescriptionBuilderLayout(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        projectId: 'projectId',
        enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(
      projectDescriptionBuilderLayoutData
    );
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useAddProjectDescriptionBuilderLayout(),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    act(() => {
      result.current.mutate({
        projectId: 'projectId',
        enabled: true,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
