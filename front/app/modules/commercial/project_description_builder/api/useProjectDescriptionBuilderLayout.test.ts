import { renderHook } from '@testing-library/react-hooks';

import useProjectDescriptionBuilderLayout from './useProjectDescriptionBuilderLayout';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { projectDescriptionBuilderLayoutData } from './__mocks__/projectDescriptionBuilderLayout';

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
  rest.get(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: projectDescriptionBuilderLayoutData })
    );
  })
);

describe('useProjectDescriptionBuilderLayout', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const spy = jest.spyOn(global, 'fetch');
    const { result, waitFor } = renderHook(
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
      rest.get(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
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
