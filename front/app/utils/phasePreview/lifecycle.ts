import type { IUpdatedPhaseProperties } from 'api/phases/types';

import { JsonObject, object, PreviewLifecycle, PreviewSnapshot } from './types';

const day = 24 * 60 * 60 * 1000;

interface Dates {
  start_at?: string | null;
  end_at?: string | null;
}

export const getPreviewLifecycle = (
  dates: Dates,
  now = Date.now()
): PreviewLifecycle => {
  if (dates.end_at && Date.parse(dates.end_at) < now) return 'ended';
  if (dates.start_at && Date.parse(dates.start_at) > now) return 'before';
  return 'open';
};

export const previewDates = (
  dates: Dates,
  lifecycle: PreviewLifecycle,
  now: number
): Dates => {
  if (dates.start_at && getPreviewLifecycle(dates, now) === lifecycle) {
    return dates;
  }

  const start = Date.parse(dates.start_at ?? '');
  const end = Date.parse(dates.end_at ?? '');
  if (lifecycle === 'before') {
    return {
      start_at: new Date(now + day).toISOString(),
      end_at:
        Number.isFinite(end) && end > now + 2 * day
          ? dates.end_at
          : new Date(now + 2 * day).toISOString(),
    };
  }

  if (lifecycle === 'ended') {
    return {
      start_at:
        Number.isFinite(start) && start < now - 2 * day
          ? dates.start_at
          : new Date(now - 2 * day).toISOString(),
      end_at: new Date(now - day).toISOString(),
    };
  }

  const duration = end - start;

  return {
    start_at: new Date(now - day).toISOString(),
    end_at:
      dates.end_at === null
        ? null
        : new Date(now + (duration > 0 ? duration : day)).toISOString(),
  };
};

type ActionSettings = Pick<
  IUpdatedPhaseProperties,
  | 'submission_enabled'
  | 'commenting_enabled'
  | 'reacting_enabled'
  | 'reacting_dislike_enabled'
>;

export const getPreviewActionSettings = ({
  phase,
  draft,
}: PreviewSnapshot): ActionSettings => ({
  submission_enabled:
    draft.submission_enabled ?? phase.attributes.submission_enabled,
  commenting_enabled:
    draft.commenting_enabled ?? phase.attributes.commenting_enabled,
  reacting_enabled: draft.reacting_enabled ?? phase.attributes.reacting_enabled,
  reacting_dislike_enabled:
    draft.reacting_dislike_enabled ?? phase.attributes.reacting_dislike_enabled,
});

const settingsForAction = (name: string, settings: ActionSettings) => {
  switch (name) {
    case 'posting_idea':
      return { posting_disabled: settings.submission_enabled };
    case 'commenting_idea':
    case 'comment_reacting_idea':
      return { commenting_disabled: settings.commenting_enabled };
    case 'reacting_idea':
    case 'up':
      return { reacting_disabled: settings.reacting_enabled };
    case 'down':
      return {
        reacting_disabled: settings.reacting_enabled,
        reacting_dislike_disabled: settings.reacting_dislike_enabled,
      };
    default:
      return {};
  }
};

// Simulate dates and editable settings, while retaining eligibility and quota restrictions.
export const previewActions = (
  actions: JsonObject,
  lifecycle: PreviewLifecycle,
  settings: ActionSettings = {}
): JsonObject =>
  Object.fromEntries(
    Object.entries(actions).map(([name, value]) => {
      const descriptor = object(value);
      if (!Object.keys(descriptor).length) return [name, value];

      const options = Object.entries(settingsForAction(name, settings));
      const temporal = ['project_inactive', 'inactive_phase'].includes(
        String(descriptor.disabled_reason)
      );
      const configurable = options.some(
        ([reason, enabled]) =>
          reason === descriptor.disabled_reason && enabled === true
      );
      const disabledSetting = options.find(
        ([, enabled]) => enabled === false
      )?.[0];
      const canSimulate =
        temporal || configurable || descriptor.enabled === true;
      const disabledReason =
        lifecycle !== 'open' ? 'inactive_phase' : disabledSetting;

      return [
        name,
        {
          ...previewActions(descriptor, lifecycle, settings),
          ...(canSimulate
            ? {
                enabled: !disabledReason,
                disabled_reason: disabledReason ?? null,
                ...('future_enabled_at' in descriptor && {
                  future_enabled_at: null,
                }),
              }
            : {}),
        },
      ];
    })
  );
