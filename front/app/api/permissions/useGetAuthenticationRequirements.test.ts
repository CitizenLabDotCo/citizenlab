import { renderHook } from '@testing-library/react-hooks';

import useGetAuthenticationRequirements from './useGetAuthenticationRequirements';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import {
  initiativeResponse,
  projectResponse,
  phaseResponse,
} from './__mocks__/useGetAuthenticationRequirements';

const initiativesPath = '*permissions/posting_initiative/requirements';
const projectPath = '*projects/123/permissions/posting_idea/requirements';
const phasePath = '*phases/456/permissions/posting_idea/requirements';

const server = setupServer(
  rest.get(initiativesPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(initiativeResponse));
  }),
  rest.get(projectPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(projectResponse));
  }),
  rest.get(phasePath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(phaseResponse));
  })
);

describe('useGetAuthenticationRequirements', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns initiative data correctly', async () => {
    const { result } = renderHook(
      () =>
        useGetAuthenticationRequirements({
          type: 'initiative',
          action: 'posting_initiative',
        }),
      { wrapper: createQueryClientWrapper() }
    );

    expect(await result.current()).toEqual(initiativeResponse);
  });

  it('returns project data correctly', async () => {
    const { result } = renderHook(
      () =>
        useGetAuthenticationRequirements({
          type: 'project',
          action: 'posting_idea',
          id: '123',
        }),
      { wrapper: createQueryClientWrapper() }
    );

    expect(await result.current()).toEqual(projectResponse);
  });

  it('returns phase data correctly', async () => {
    const { result } = renderHook(
      () =>
        useGetAuthenticationRequirements({
          type: 'phase',
          action: 'posting_idea',
          id: '456',
        }),
      { wrapper: createQueryClientWrapper() }
    );

    expect(await result.current()).toEqual(phaseResponse);
  });
});
