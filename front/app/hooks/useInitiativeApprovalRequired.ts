import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useFeatureFlag from './useFeatureFlag';

export default function useInitiativeApprovalRequired() {
  const initiativeApprovalEnabled = useFeatureFlag({
    name: 'initiative_approval',
  });
  const { data: appConfig } = useAppConfiguration();
  const approvalRequired =
    appConfig?.data.attributes.settings.initiatives?.require_approval;

  return initiativeApprovalEnabled && approvalRequired;
}
