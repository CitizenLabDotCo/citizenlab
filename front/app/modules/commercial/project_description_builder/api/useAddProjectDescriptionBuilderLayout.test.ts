import { renderHook, act } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { projectDescriptionBuilderLayoutData } from './__mocks__/projectDescriptionBuilderLayout';
import useAddProjectDescriptionBuilderLayout from './useAddProjectDescriptionBuilderLayout';

const apiPath =
  '*projects/:projectId/content_builder_layouts/project_description/upsert';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({ data: projectDescriptionBuilderLayoutData })
    );
  })
);

describe('useAddProjectDescriptionBuilderLayout', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(
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
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(
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
