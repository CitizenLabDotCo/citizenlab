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

it('uses the configured duration when opening a future phase', () => {
  expect(
    previewDates(
      { start_at: '2090-01-01T00:00:00Z', end_at: '2090-01-08T00:00:00Z' },
      'open',
      now
    ).end_at
  ).toBe('2026-11-01T12:00:00.000Z');
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

it.each([
  ['posting_idea', 'posting_disabled', 'submission_enabled'],
  ['commenting_idea', 'commenting_disabled', 'commenting_enabled'],
  ['comment_reacting_idea', 'commenting_disabled', 'commenting_enabled'],
  ['reacting_idea', 'reacting_disabled', 'reacting_enabled'],
] as const)(
  'applies live %s settings in both directions',
  (action, reason, setting) => {
    const disabled = { [action]: { enabled: false, disabled_reason: reason } };
    const enabled = { [action]: { enabled: true, disabled_reason: null } };
    expect(previewActions(disabled, 'open', { [setting]: true })).toEqual(
      enabled
    );
    expect(previewActions(enabled, 'open', { [setting]: false })).toEqual(
      disabled
    );
    expect(
      previewActions(disabled, 'before', { [setting]: true })
    ).toMatchObject({
      [action]: { enabled: false, disabled_reason: 'inactive_phase' },
    });
    expect(
      previewActions(disabled, 'ended', { [setting]: true })
    ).toMatchObject({
      [action]: { enabled: false, disabled_reason: 'inactive_phase' },
    });
  }
);

it('keeps dislikes disabled when reactions are enabled and clears stale future dates', () => {
  expect(
    previewActions(
      {
        reacting_idea: {
          enabled: false,
          disabled_reason: 'reacting_disabled',
          up: {
            enabled: false,
            disabled_reason: 'reacting_disabled',
            future_enabled_at: '2090-01-01',
          },
          down: { enabled: false, disabled_reason: 'reacting_disabled' },
        },
      },
      'open',
      { reacting_enabled: true, reacting_dislike_enabled: false }
    )
  ).toEqual({
    reacting_idea: {
      enabled: true,
      disabled_reason: null,
      up: { enabled: true, disabled_reason: null, future_enabled_at: null },
      down: { enabled: false, disabled_reason: 'reacting_dislike_disabled' },
    },
  });
});

it.each([
  'user_not_signed_in',
  'user_not_permitted',
  'posting_limited_max_reached',
  'posting_not_supported',
])('preserves %s despite live settings', (reason) => {
  const actions = { posting_idea: { enabled: false, disabled_reason: reason } };
  expect(previewActions(actions, 'open', { submission_enabled: true })).toEqual(
    actions
  );
});

it('updates the phase descriptor when a disabled action is enabled in the draft', () => {
  const phase = {
    ...phasesData[0],
    attributes: {
      ...phasesData[0].attributes,
      submission_enabled: false,
      action_descriptors: {
        ...phasesData[0].attributes.action_descriptors,
        posting_idea: { enabled: false, disabled_reason: 'posting_disabled' },
      },
    },
  } as const;
  const session = new PreviewSession({
    project: project1,
    phase,
    draft: { submission_enabled: true },
    lifecycle: 'open',
  });
  expect(session.read(`/phases/${phase.id}`)).toMatchObject({
    data: {
      attributes: {
        submission_enabled: true,
        action_descriptors: {
          posting_idea: { enabled: true, disabled_reason: null },
        },
      },
    },
  });
});

it('applies draft settings only to ideas in the previewed phase', () => {
  const session = new PreviewSession({
    project: project1,
    phase: phasesData[0],
    draft: { commenting_enabled: true },
    lifecycle: 'open',
  });
  const idea = (phaseId: string) => ({
    id: phaseId,
    type: 'idea',
    attributes: {
      action_descriptors: {
        commenting_idea: {
          enabled: false,
          disabled_reason: 'commenting_disabled',
        },
      },
    },
    relationships: { phases: { data: [{ id: phaseId, type: 'phase' }] } },
  });
  expect(
    session.transform({ data: [idea(session.phaseId), idea('another-phase')] })
  ).toMatchObject({
    data: [
      {
        attributes: {
          action_descriptors: {
            commenting_idea: { enabled: true, disabled_reason: null },
          },
        },
      },
      {
        attributes: {
          action_descriptors: {
            commenting_idea: {
              enabled: false,
              disabled_reason: 'commenting_disabled',
            },
          },
        },
      },
    ],
  });
});
