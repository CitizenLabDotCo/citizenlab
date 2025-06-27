import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import { phaseResponse, ideaResponse } from './__mocks__/useCustomFieldsSchema';
import useCustomFieldsSchema from './useCustomFieldsSchema';

const phasePath = '*phases/456/permissions/posting_idea/schema';
const ideaPath = '*ideas/789/permissions/commenting_idea/schema';

const server = setupServer(
  http.get(phasePath, () => {
    return HttpResponse.json(phaseResponse, { status: 200 });
  }),
  http.get(ideaPath, () => {
    return HttpResponse.json(ideaResponse, { status: 200 });
  })
);

describe('useCustomFieldsSchema', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns phase data correctly', async () => {
    const context = {
      type: 'phase',
      action: 'posting_idea',
      id: '456',
    } as const;

    const { result } = renderHook(() => useCustomFieldsSchema(context), {
      wrapper: createQueryClientWrapper(),
    });

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
    const { result } = renderHook(() => useCustomFieldsSchema(context), {
      wrapper: createQueryClientWrapper(),
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(ideaResponse);
  });
});
