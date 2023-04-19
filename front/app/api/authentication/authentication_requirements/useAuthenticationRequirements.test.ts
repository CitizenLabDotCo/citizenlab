import useAuthenticationRequirements from './useAuthenticationRequirements';

import { renderHook } from '@testing-library/react-hooks';
import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { setupServer } from 'msw/node';
import { rest } from 'msw';

import {
  initiativeResponse,
  projectResponse,
  phaseResponse,
  ideaResponse,
} from './__mocks__/getAuthenticationRequirements';

const initiativesPath = '*permissions/posting_initiative/requirements';
const projectPath = '*projects/123/permissions/posting_idea/requirements';
const phasePath = '*phases/456/permissions/posting_idea/requirements';
const ideaPath = '*ideas/789/permissions/commenting_idea/requirements';

const server = setupServer(
  rest.get(initiativesPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(initiativeResponse));
  }),
  rest.get(projectPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(projectResponse));
  }),
  rest.get(phasePath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(phaseResponse));
  }),
  rest.get(ideaPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(ideaResponse));
  })
);

describe('useAuthenticationRequirements', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns initiative data correctly', async () => {
    const context = {
      type: 'initiative',
      action: 'posting_initiative',
    } as const;
    const { result, waitFor } = renderHook(
      () => useAuthenticationRequirements(context),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(initiativeResponse);
  });

  it('returns project data correctly', async () => {
    const context = {
      type: 'project',
      action: 'posting_idea',
      id: '123',
    } as const;

    const { result, waitFor } = renderHook(
      () => useAuthenticationRequirements(context),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(projectResponse);
  });

  it('returns phase data correctly', async () => {
    const context = {
      type: 'phase',
      action: 'posting_idea',
      id: '456',
    } as const;

    const { result, waitFor } = renderHook(
      () => useAuthenticationRequirements(context),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(phaseResponse);
  });

  it('returns idea data correctly', async () => {
    const context = {
      type: 'idea',
      action: 'commenting_idea',
      id: '789',
    } as const;

    // expect(result).toEqual(ideaResponse);
    const { result, waitFor } = renderHook(
      () => useAuthenticationRequirements(context),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(ideaResponse);
  });
});
