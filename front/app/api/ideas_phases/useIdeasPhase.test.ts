import { renderHook } from '@testing-library/react-hooks';

import useIdeasPhase from './useIdeasPhase';
import { ideaData } from './__mocks__/useIdeaById';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

const apiPath = '*ideas/:id';

const server = setupServer(
  rest.get(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: ideaData[0] }));
  })
);
