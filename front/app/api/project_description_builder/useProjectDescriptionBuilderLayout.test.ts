import { renderHook } from '@testing-library/react-hooks';

import useProjectDescriptionBuilderLayout from './useProjectDescriptionBuilderLayout';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { projectDescriptionBuilderLayoutData } from './__mocks__/projectDescriptionBuilderLayout';

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
});
