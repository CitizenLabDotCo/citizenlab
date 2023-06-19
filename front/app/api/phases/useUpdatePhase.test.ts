import { renderHook, act } from '@testing-library/react-hooks';

import useUpdatePhase from './useUpdatePhase';

import { setupServer } from 'msw/node';
import { rest } from 'msw';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { phasesData } from './__mocks__/usePhases';

import { IUpdatedPhaseProperties } from './types';

const phasesMutationData: IUpdatedPhaseProperties = {
  commenting_enabled: false,
  description_multiloc: { en: 'For testing purposes' },
  reacting_dislike_enabled: false,
  reacting_dislike_limited_max: 0,
  reacting_dislike_method: 'limited',
  end_at: 'one week from now',
  input_term: 'idea',
  participation_method: 'information',
  posting_enabled: false,
  presentation_mode: 'card',
  start_at: 'today',
  title_multiloc: { en: 'A Mock Information phase' },
  reacting_like_limited_max: 0,
  reacting_like_method: 'limited',
  reacting_enabled: false,
};

const apiPath = '*phases/:phaseId';

const server = setupServer(
  rest.patch(apiPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json({ data: phasesData[0] }));
  })
);

describe('useUpdatePhase', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result, waitFor } = renderHook(() => useUpdatePhase(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: 'phaseId',
        ...phasesMutationData,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toEqual(phasesData[0]);
  });

  it('returns error correctly', async () => {
    server.use(
      rest.patch(apiPath, (_req, res, ctx) => {
        return res(ctx.status(500));
      })
    );

    const { result, waitFor } = renderHook(() => useUpdatePhase(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: 'phaseId',
        ...phasesMutationData,
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.error).toBeDefined();
  });
});
