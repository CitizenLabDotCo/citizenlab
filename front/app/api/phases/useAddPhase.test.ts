import { renderHook, waitFor, act } from 'utils/testUtils/rtl';
import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import { phasesData } from './__mocks__/_mockServer';
import { IUpdatedPhaseProperties } from './types';
import useAddPhase from './useAddPhase';

const phasesMutationData: IUpdatedPhaseProperties = {
  commenting_enabled: false,
  description_multiloc: { en: 'For testing purposes' },
  reacting_dislike_enabled: false,
  reacting_dislike_limited_max: 0,
  reacting_dislike_method: 'limited',
  end_at: 'one week from now',
  input_term: 'idea',
  participation_method: 'information',
  submission_enabled: false,
  presentation_mode: 'card',
  start_at: 'today',
  title_multiloc: { en: 'A Mock Information phase' },
  reacting_like_limited_max: 0,
  reacting_like_method: 'limited',
  reacting_enabled: false,
  similarity_threshold_body: 0.5,
  similarity_threshold_title: 0.5,
  similarity_enabled: true,
};

const apiPath = '*projects/:projectId/phases';

const server = setupServer(
  http.post(apiPath, () => {
    return HttpResponse.json({ data: phasesData[0] }, { status: 200 });
  })
);

describe('useAddPhase', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('mutates data correctly', async () => {
    const { result } = renderHook(() => useAddPhase(), {
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
      http.post(apiPath, () => {
        return HttpResponse.json(null, { status: 500 });
      })
    );

    const { result } = renderHook(() => useAddPhase(), {
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
