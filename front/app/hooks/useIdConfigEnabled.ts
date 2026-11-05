import useFeatureFlag from 'hooks/useFeatureFlag';

import { useSearch } from 'utils/router';

/**
 * Whether SSO and verification methods should be shown in the interface.
 * They are hidden while the id_config feature is off, so a method can be set
 * up and tested on a live platform before citizens see it. Adding
 * ?id_config=enabled to the URL shows them anyway.
 */
export default function useIdConfigEnabled() {
  const featureEnabled = useFeatureFlag({ name: 'id_config' });
  const searchParams = useSearch({ strict: false });

  return featureEnabled || searchParams.id_config === 'enabled';
}
