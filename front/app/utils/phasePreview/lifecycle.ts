import { JsonObject, object, PreviewLifecycle } from './types';

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

  return {
    start_at: new Date(now - day).toISOString(),
    end_at:
      dates.end_at === null
        ? null
        : Number.isFinite(end) && end > now
        ? dates.end_at
        : new Date(now + day).toISOString(),
  };
};

// Only time/publication restrictions are simulated. Identity and eligibility
// restrictions remain in force, and the iframe's write barrier stays installed.
export const previewActions = (
  actions: JsonObject,
  lifecycle: PreviewLifecycle
): JsonObject =>
  Object.fromEntries(
    Object.entries(actions).map(([name, value]) => {
      const descriptor = object(value);
      if (!Object.keys(descriptor).length) return [name, value];

      const temporal = ['project_inactive', 'inactive_phase'].includes(
        String(descriptor.disabled_reason)
      );
      return [
        name,
        {
          ...previewActions(descriptor, lifecycle),
          ...(temporal || descriptor.enabled === true
            ? {
                enabled: lifecycle === 'open',
                disabled_reason: lifecycle === 'open' ? null : 'inactive_phase',
              }
            : {}),
        },
      ];
    })
  );
