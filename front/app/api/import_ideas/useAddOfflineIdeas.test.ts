import { renderHook, act } from '@testing-library/react-hooks';

import useAddArea from './useAddArea';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { areasData } from './__mocks__/useAreas';

const apiPath = 'projects/:projectId/import_ideas/bulk_create';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: areasData[0] }));
  })
);

describe('useAddOfflineIdeas', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
});
