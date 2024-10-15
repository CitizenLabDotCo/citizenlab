import useAuthUser from 'api/me/useAuthUser';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { isSuperAdmin } from 'utils/permissions/roles';

const useReportBuilderEnabled = ({ onlyCheckAllowed = false } = {}) => {
  const featureFlagEnabled = useFeatureFlag({
    name: 'report_builder',
    onlyCheckAllowed,
  });
  const { data: user } = useAuthUser();

  return featureFlagEnabled || isSuperAdmin(user);
};

export default useReportBuilderEnabled;
