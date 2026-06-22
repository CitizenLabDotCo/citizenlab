import useFeatureFlag from 'hooks/useFeatureFlag';

import { useSearch } from 'utils/router';

/**
 * Whether parallel participation is enabled — true when the
 * `parallel_participation` feature flag is on, or `?parallel_participation` is
 * in the URL (a flag-free way to enable it on any client; retained across
 * navigation in routes.tsx).
 */
export default function useParallelParticipation(): boolean {
  const featureFlag = useFeatureFlag({ name: 'parallel_participation' });
  const searchParams = useSearch({ strict: false });

  // Param present and not `=false` enables it; `=true` is not required.
  const param = searchParams.parallel_participation;
  const urlEnabled = param !== undefined && param !== 'false';

  return featureFlag || urlEnabled;
}
