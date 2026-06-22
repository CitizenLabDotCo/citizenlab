import useFeatureFlag from 'hooks/useFeatureFlag';

import { useSearch } from 'utils/router';

/**
 * Whether the redesigned project back office (parallel participation) should be
 * shown. True when either:
 *  - the `parallel_participation` feature flag is enabled for the tenant, or
 *  - the URL carries `?parallel_participation=true`.
 *
 * The URL opt-in lets us preview the new interface on any client without
 * enabling the flag. It is retained across navigation by the root route's
 * search middleware (see routes.tsx), so it sticks while moving between project
 * sub-pages, and lives only in the URL — no cookie/localStorage — so it is gone
 * the moment an admin opens a clean URL without the param.
 *
 * The new interface only renders inside the admin project back office, which is
 * already guarded by `canModerateProject`, so no extra access check is needed
 * here.
 */
export default function useParallelParticipation(): boolean {
  const featureFlag = useFeatureFlag({ name: 'parallel_participation' });
  const searchParams = useSearch({ strict: false });
  const param = searchParams.parallel_participation;
  const urlEnabled = param !== undefined && param !== 'false';

  return featureFlag || urlEnabled;
}
