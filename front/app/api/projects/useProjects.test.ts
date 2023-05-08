import useProjects from './useProjects';

import { renderHook } from '@testing-library/react-hooks';
import { setupServer } from 'msw/node';
import { rest } from 'msw';
import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { projects } from './__mocks__/useProjects';

const apiPath = '*projects';

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(projects));
  })
);

describe('useProjects', () => {
  it('works', () => {
    // TODO
  });
});
