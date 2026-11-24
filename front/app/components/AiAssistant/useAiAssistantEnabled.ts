import useFeatureFlag from 'hooks/useFeatureFlag';

import { usePermission } from 'utils/permissions';

const useAiAssistantEnabled = () => {
  const featureEnabled = useFeatureFlag({ name: 'ai_assistant' });
  const canUse = usePermission({ item: 'ai_assistant', action: 'use' });

  return featureEnabled && canUse;
};

export default useAiAssistantEnabled;
