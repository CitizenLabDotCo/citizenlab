import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { isSuperAdmin } from 'utils/permissions/roles';

const useReportBuilderEnabled = ({ onlyCheckAllowed = false } = {}) => {
  const featureFlagEnabled = useFeatureFlag({
    name: 'report_builder',
    onlyCheckAllowed,
  });
  const { data: user } = useAuthUser();

  // Super admins need to have access to the global report builder
  return featureFlagEnabled || isSuperAdmin(user);
};

export default useReportBuilderEnabled;
