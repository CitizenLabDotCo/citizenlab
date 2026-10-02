import useFeatureFlag from 'hooks/useFeatureFlag';

import { useSearch } from 'utils/router';

// prototype data — the AI project creation assistant is gated the same way as
// the back-office redesign it lives inside: a feature flag, or a URL param
// (?ai_project_generator) so it can be shown on staging without a server flag.
export default function useAiProjectGenerator(): boolean {
  const featureFlag = useFeatureFlag({ name: 'ai_project_generator' });
  const { ai_project_generator } = useSearch({ strict: false });

  return featureFlag || ai_project_generator !== undefined;
}
