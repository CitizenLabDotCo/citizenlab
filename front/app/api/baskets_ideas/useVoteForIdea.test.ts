import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import { phasesData } from 'api/phases/__mocks__/_mockServer';

import { trackCustomerAnalyticsEvent } from 'utils/analytics';
import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import { basketsIdeasData } from './__mocks__/useBasketsIdeas';
import useVoteForIdea from './useVoteForIdea';

jest.mock('utils/analytics', () => ({
  ...jest.requireActual('utils/analytics'),
  trackCustomerAnalyticsEvent: jest.fn(),
}));

const server = setupServer(
  http.put('*baskets/ideas/:ideaId', () => {
    return HttpResponse.json({ data: basketsIdeasData }, { status: 200 });
  })
);

const phase = phasesData[0];
const basketId = basketsIdeasData.relationships.basket.data.id;

describe('useVoteForIdea', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());
  beforeEach(() => jest.mocked(trackCustomerAnalyticsEvent).mockClear());

  it('tracks the start of voting when the vote creates a basket', async () => {
    const { result } = renderHook(() => useVoteForIdea(phase), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.voteForIdea('1', 1);
    });

    await waitFor(() => expect(result.current.basketId).toBe(basketId));
    expect(trackCustomerAnalyticsEvent).toHaveBeenCalledWith('voting_started', {
      project_id: phase.relationships.project.data.id,
      phase_id: phase.id,
    });
  });

  it('does not track a start when voting into an existing basket', async () => {
    const { result } = renderHook(() => useVoteForIdea(phase), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.voteForIdea('1', 1, basketId);
    });

    await waitFor(() => expect(result.current.basketId).toBe(basketId));
    expect(trackCustomerAnalyticsEvent).not.toHaveBeenCalled();
  });
});
