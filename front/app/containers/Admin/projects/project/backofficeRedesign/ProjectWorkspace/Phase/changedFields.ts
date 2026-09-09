import { IUpdatedPhaseProperties } from 'api/phases/types';

/**
 * The participation config reports the whole phase on every edit, so the fields
 * a panel actually changed have to be picked back out of it. Fields it left
 * alone keep their identity through the config's spread, which is what makes a
 * reference comparison exact here.
 *
 * Without this a panel sends the phase's title and dates alongside its own
 * settings, reverting whatever the other panel saved.
 */
const changedFields = (
  next: IUpdatedPhaseProperties,
  previous: IUpdatedPhaseProperties
): IUpdatedPhaseProperties => {
  // Object.keys widens to string; both objects have the same shape.
  const keys = Object.keys(next) as (keyof IUpdatedPhaseProperties)[];

  return keys
    .filter((key) => next[key] !== previous[key])
    .reduce<IUpdatedPhaseProperties>(
      (changed, key) => ({ ...changed, [key]: next[key] }),
      {}
    );
};

export default changedFields;
