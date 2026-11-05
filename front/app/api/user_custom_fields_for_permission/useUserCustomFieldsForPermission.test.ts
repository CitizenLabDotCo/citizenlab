import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';
import { renderHook, waitFor } from 'utils/testUtils/rtl';

import {
  phaseResponse,
  ideaResponse,
} from './__mocks__/useUserCustomFieldsForPermission';
import useUserCustomFieldsForPermission from './useUserCustomFieldsForPermission';

const phasePath = '*phases/456/permissions/posting_idea/custom_fields';
const ideaPath = '*ideas/789/permissions/commenting_idea/custom_fields';

const server = setupServer(
  http.get(phasePath, () => {
    return HttpResponse.json(phaseResponse, { status: 200 });
  }),
  http.get(ideaPath, () => {
    return HttpResponse.json(ideaResponse, { status: 200 });
  })
);

describe('useUserCustomFieldsForPermission', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns phase data correctly', async () => {
    const context = {
      type: 'phase',
      action: 'posting_idea',
      id: '456',
    } as const;

    const { result } = renderHook(
      () => useUserCustomFieldsForPermission(context),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([
      expect.objectContaining({
        id: 'field_3',
        key: 'field_3',
        input_type: 'text',
        title_multiloc: { en: 'Field 3' },
        dropdown_layout: true,
        options: [],
      }),
      expect.objectContaining({
        id: 'field_4',
        key: 'field_4',
        input_type: 'text',
        title_multiloc: { en: 'Field 4' },
        dropdown_layout: true,
        options: [],
      }),
    ]);
  });

  it('returns idea data correctly', async () => {
    const context = {
      type: 'idea',
      action: 'commenting_idea',
      id: '789',
    } as const;

    const { result } = renderHook(
      () => useUserCustomFieldsForPermission(context),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual([
      expect.objectContaining({
        id: 'field_3',
        key: 'field_3',
        input_type: 'text',
        title_multiloc: { en: 'Field 3' },
        dropdown_layout: true,
        options: [],
      }),
      expect.objectContaining({
        id: 'field_4',
        key: 'field_4',
        input_type: 'text',
        title_multiloc: { en: 'Field 4' },
        dropdown_layout: true,
        options: [],
      }),
    ]);
  });
});
