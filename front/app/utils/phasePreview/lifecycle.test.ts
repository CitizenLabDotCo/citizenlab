import { phasesData } from 'api/phases/__mocks__/_mockServer';
import { project1 } from 'api/projects/__mocks__/_mockServer';

import { getPreviewLifecycle, previewDates, previewActions } from './lifecycle';
import { createPreviewFetch } from './runtime';
import { PreviewSession } from './session';
import { isPreviewSnapshot, object } from './types';

const now = Date.parse('2026-10-25T12:00:00Z');
const dates = { start_at: '2027-01-01T00:00:00Z', end_at: null };

it.each(['before', 'open', 'ended'] as const)(
  'simulates %s while preserving the original configuration',
  (lifecycle) => {
    const result = previewDates(dates, lifecycle, now);
    expect(getPreviewLifecycle(result, now)).toBe(lifecycle);
    expect(dates).toEqual({ start_at: '2027-01-01T00:00:00Z', end_at: null });
  }
);

it('keeps configured dates when they already match the selected state', () => {
  expect(previewDates(dates, 'before', now)).toEqual(dates);
});

it('simulates temporal restrictions without granting eligibility or authentication', () => {
  const actions = {
    taking_poll: { enabled: false, disabled_reason: 'inactive_phase' },
    posting_idea: { enabled: false, disabled_reason: 'user_not_in_group' },
    reacting_idea: {
      enabled: true,
      disabled_reason: null,
      up: { enabled: false, disabled_reason: 'not_signed_in' },
    },
  };
  expect(previewActions(actions, 'open')).toMatchObject({
    taking_poll: { enabled: true, disabled_reason: null },
    posting_idea: actions.posting_idea,
    reacting_idea: { up: actions.reacting_idea.up },
  });
  expect(previewActions(actions, 'ended')).toMatchObject({
    reacting_idea: { enabled: false, disabled_reason: 'inactive_phase' },
  });
});

it('retains local answers across state changes and never writes to the server', async () => {
  const snapshot = {
    project: project1,
    phase: phasesData[0],
    draft: {},
    lifecycle: 'open' as const,
  };
  const session = new PreviewSession(snapshot);
  const network = jest.fn();
  const fetch = createPreviewFetch(
    session,
    network,
    'https://example.com',
    jest.fn()
  );
  const input = await (
    await fetch(
      `https://example.com/web_api/v1/phases/${session.phaseId}/inputs`,
      {
        method: 'POST',
        body: JSON.stringify({
          idea: { custom_field_values: { answer: 'Keep this' } },
        }),
      }
    )
  ).json();
  session.updateSnapshot({ ...snapshot, lifecycle: 'ended' });
  expect(session.write(`/ideas/${input.data.id}`, 'PATCH', {})).toBeUndefined();
  session.updateSnapshot(snapshot);
  expect(session.read(`/ideas/${input.data.id}`)).toMatchObject({
    data: { attributes: { custom_field_values: { answer: 'Keep this' } } },
  });
  expect(network).not.toHaveBeenCalled();
});

it('does not enable participation for an unsaved phase', () => {
  const session = new PreviewSession({
    project: project1,
    phase: phasesData[0],
    draft: {},
    unsaved: true,
    lifecycle: 'open',
  });
  expect(
    session.write(`/phases/${session.phaseId}/inputs`, 'POST', {})
  ).toBeUndefined();
});

it('uses the selected lifecycle only within the preview session', () => {
  const snapshot = {
    project: {
      ...project1,
      attributes: {
        ...project1.attributes,
        publication_status: 'draft' as const,
      },
    },
    phase: phasesData[0],
    draft: {},
    lifecycle: 'ended' as const,
  };
  const original = JSON.stringify(snapshot);
  const session = new PreviewSession(snapshot);
  const shown = object(object(session.read(`/phases/${session.phaseId}`)).data);
  const attributes = object(shown.attributes);
  expect(
    getPreviewLifecycle({
      start_at:
        typeof attributes.start_at === 'string'
          ? attributes.start_at
          : undefined,
      end_at:
        typeof attributes.end_at === 'string' ? attributes.end_at : undefined,
    })
  ).toBe('ended');
  expect(
    session.transform({ data: JSON.parse(JSON.stringify(snapshot.project)) })
  ).toMatchObject({
    data: { attributes: { publication_status: 'published' } },
  });
  expect(JSON.stringify(snapshot)).toBe(original);
  expect(isPreviewSnapshot({ ...snapshot, lifecycle: 'invalid' })).toBe(false);
});
