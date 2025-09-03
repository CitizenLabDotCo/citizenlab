import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { projectDescriptionBuilderLayoutData } from './__mocks__/projectDescriptionBuilderLayout';
import useProjectDescriptionBuilderLayout from './useProjectDescriptionBuilderLayout';

const mockProjectData = {
  id: '2',
  type: 'project',
  attributes: {
    title_multiloc: { en: 'Test Project' },
    slug: 'test',
    uses_content_builder: true,
  },
};

jest.mock('api/projects/useProjectById', () =>
  jest.fn(() => ({ data: { data: mockProjectData } }))
);

const apiPath =
  '*projects/:projectId/content_builder_layouts/project_description';

const server = setupServer(
  http.get(apiPath, () => {
    return HttpResponse.json(
      { data: projectDescriptionBuilderLayoutData },
      { status: 200 }
    );
  })
);

describe('useProjectDescriptionBuilderLayout', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const spy = jest.spyOn(global, 'fetch');
    const { result } = renderHook(
      () => useProjectDescriptionBuilderLayout('projectId'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(
      projectDescriptionBuilderLayoutData
    );
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('returns error correctly', async () => {
    server.use(
      http.get(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(
      () => useProjectDescriptionBuilderLayout('projectId'),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);
    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
    expect(result.current.isLoading).toBe(false);
  });

  it('does not make API call when uses_content_builder is false', async () => {
    const spy = jest.spyOn(global, 'fetch');
    mockProjectData.attributes.uses_content_builder = false;

    renderHook(() => useProjectDescriptionBuilderLayout('projectId'), {
      wrapper: createQueryClientWrapper(),
    });

    expect(spy).not.toHaveBeenCalled();
  });
});
