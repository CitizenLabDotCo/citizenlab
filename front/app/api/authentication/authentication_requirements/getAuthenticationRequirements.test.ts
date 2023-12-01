import getAuthenticationRequirements from './getAuthenticationRequirements';

import { setupServer } from 'msw/node';

import endpoints, {
  initiativeResponse,
  phaseResponse,
  ideaResponse,
} from './__mocks__/_mockServer';

const server = setupServer(
  endpoints['GET permissions/posting_initiative/requirements'],
  endpoints['GET phases/:phaseId/permissions/posting_idea/requirements'],
  endpoints['GET ideas/:ideaId/permissions/commenting_idea/requirements']
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
