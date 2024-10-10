import { setupServer } from 'msw/node';

import endpoints, {
  phaseResponse,
  ideaResponse,
} from './__mocks__/_mockServer';
import getAuthenticationRequirements from './getAuthenticationRequirements';

const server = setupServer(
  endpoints['GET phases/:phaseId/permissions/posting_idea/requirements'],
  endpoints['GET ideas/:ideaId/permissions/commenting_idea/requirements']
);

describe('getAuthenticationRequirements', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

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
