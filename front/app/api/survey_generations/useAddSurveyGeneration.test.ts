import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor, act } from 'utils/testUtils/rtl';

import useAddSurveyGeneration from './useAddSurveyGeneration';

const apiPath = '*phases/:phaseId/survey_generations';

const server = setupServer(
  http.post(apiPath, () => {
    return new HttpResponse(null, { status: 202 });
  })
);

describe('useAddSurveyGeneration', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('sends the prompt, locale and files', async () => {
    let requestBody: unknown;
    server.use(
      http.post(apiPath, async ({ request }) => {
        requestBody = await request.json();
        return new HttpResponse(null, { status: 202 });
      })
    );

    const { result } = renderHook(() => useAddSurveyGeneration(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: 'phase-1',
        prompt: 'A survey about the park',
        locale: 'en',
        fileIds: ['file-1'],
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(requestBody).toEqual({
      survey_generation: {
        prompt: 'A survey about the park',
        locale: 'en',
        file_ids: ['file-1'],
      },
    });
  });

  it('returns error correctly', async () => {
    server.use(
      http.post(apiPath, () => {
        return HttpResponse.json(
          { errors: { base: [{ error: 'generation_in_progress' }] } },
          { status: 409 }
        );
      })
    );

    const { result } = renderHook(() => useAddSurveyGeneration(), {
      wrapper: createQueryClientWrapper(),
    });

    act(() => {
      result.current.mutate({
        phaseId: 'phase-1',
        prompt: 'A survey about the park',
        locale: 'en',
        fileIds: [],
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
