import { renderHook, act } from '@testing-library/react-hooks';

import useAddPhase from './useAddPhase';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { phasesData } from './__mocks__/usePhases';

import { IUpdatedPhaseProperties } from './types';

const phasesMutationData: IUpdatedPhaseProperties = {
  commenting_enabled: false,
  description_multiloc: { en: 'For testing purposes' },
  downvoting_enabled: false,
  downvoting_limited_max: 0,
  downvoting_method: 'limited',
  end_at: 'one week from now',
  input_term: 'idea',
  participation_method: 'information',
  posting_enabled: false,
  presentation_mode: 'card',
  start_at: 'today',
  title_multiloc: { en: 'A Mock Information phase' },
  upvoting_limited_max: 0,
  upvoting_method: 'limited',
  voting_enabled: false,
};

const apiPath = '*projects/:projectId/phases';

const server = setupServer(
  rest.post(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: phasesData[0] }));
  })
);

describe('useAddPhase', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useAddPhase(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'projectId',
        ...phasesMutationData,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(phasesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.post(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useAddPhase(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        projectId: 'projectId',
        ...phasesMutationData,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
