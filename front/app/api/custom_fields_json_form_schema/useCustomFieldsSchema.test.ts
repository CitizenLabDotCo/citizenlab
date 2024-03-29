import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import createQueryClientWrapper from 'utils/testUtils/queryClientWrapper';

import {
  initiativeResponse,
  phaseResponse,
  ideaResponse,
} from './__mocks__/useCustomFieldsSchema';
import useCustomFieldsSchema from './useCustomFieldsSchema';

const initiativesPath = '*permissions/posting_initiative/schema';
const phasePath = '*phases/456/permissions/posting_idea/schema';
const ideaPath = '*ideas/789/permissions/commenting_idea/schema';

const server = setupServer(
  rest.get(initiativesPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(initiativeResponse));
  }),
  rest.get(phasePath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(phaseResponse));
  }),
  rest.get(ideaPath, (_req, res, ctx) => {
    return res(ctx.status(200), ctx.json(ideaResponse));
  })
);

describe('useCustomFieldsSchema', () => {
  beforeAll(() => server.listen());
  afterAll(() => server.close());

  it('returns initiative data correctly', async () => {
    const context = {
      type: 'initiative',
      action: 'posting_initiative',
    } as const;
    const { result, waitFor } = renderHook(
      () => useCustomFieldsSchema(context),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(initiativeResponse);
  });

  it('returns phase data correctly', async () => {
    const context = {
      type: 'phase',
      action: 'posting_idea',
      id: '456',
    } as const;

    const { result, waitFor } = renderHook(
      () => useCustomFieldsSchema(context),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

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
    const { result, waitFor } = renderHook(
      () => useCustomFieldsSchema(context),
      {
        wrapper: createQueryClientWrapper(),
      }
    );

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toEqual(ideaResponse);
  });
});
