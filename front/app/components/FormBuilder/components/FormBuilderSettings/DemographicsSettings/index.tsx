import React from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';

import DemographicSection from 'components/admin/ActionForm/DataSection/DemographicSection';
import usePostingPermission from 'components/FormBuilder/hooks/usePostingPermission';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from '../../messages';

// The questions are edited on the permission straight away, like on the
// access rights page, so they are not part of the form's own save.
const DemographicsSettings = () => {
  const { formatMessage } = useIntl();
  const { phaseId } = useParams({ strict: false });
  const { permission, updatePermission } = usePostingPermission(phaseId);

  if (!permission) return <Spinner />;

  return (
    <Box>
      <Text mt="0" mb="16px" color="textSecondary" fontSize="s">
        {formatMessage(messages.demographicsPageExplanation)}
      </Text>
      <DemographicSection
        permission={permission}
        phaseId={phaseId}
        permissionHasForm={false}
        defaultOpen
        onChange={updatePermission}
      />
    </Box>
  );
};

export default DemographicsSettings;
