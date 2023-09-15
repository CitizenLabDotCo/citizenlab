import { renderHook } from '@testing-library/react-hooks';

import useImportedIdeaMetadata from './useImportedIdeaMetadata';
import { ideaImport } from './__mocks__/useImportedIdeaMetadata';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*idea_imports/:id';

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: ideaImport }));
  })
);

describe('useImportedIdeaMetadata', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns data correctly', async () => {
    const { result, waitFor } = renderHook(
      () => useImportedIdeaMetadata({ id: '1' }),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data?.data).toEqual(ideaImport);
  });
});
