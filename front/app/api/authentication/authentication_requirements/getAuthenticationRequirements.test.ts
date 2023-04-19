import getAuthenticationRequirements from './getAuthenticationRequirements';

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

describe('getAuthenticationRequirements', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns initiative data correctly', async () => {
    const result = await getAuthenticationRequirements({
      type: 'initiative',
      action: 'posting_initiative',
    });

    expect(result).toEqual(initiativeResponse);
  });

  it('returns project data correctly', async () => {
    const result = await getAuthenticationRequirements({
      type: 'project',
      action: 'posting_idea',
      id: '123',
    });

    expect(result).toEqual(projectResponse);
  });

  it('returns phase data correctly', async () => {
    const result = await getAuthenticationRequirements({
      type: 'phase',
      action: 'posting_idea',
      id: '456',
    });

    expect(result).toEqual(phaseResponse);
  });

  it('returns idea data correctly', async () => {
    const result = await getAuthenticationRequirements({
      type: 'idea',
      action: 'commenting_idea',
      id: '789',
    });

    expect(result).toEqual(ideaResponse);
  });
});
