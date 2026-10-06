import useFeatureFlag from 'hooks/useFeatureFlag';

import { useSearch } from 'utils/router';

export default function useProjectBackofficeRedesign(): boolean {
  const featureFlag = useFeatureFlag({ name: 'project_backoffice_redesign' });
  const { project_backoffice_redesign } = useSearch({ strict: false });

  return featureFlag || project_backoffice_redesign !== undefined;
}
