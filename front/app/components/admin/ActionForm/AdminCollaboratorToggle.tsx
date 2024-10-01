import React from 'react';

import {
  Toggle,
  Tooltip,
  colors,
  IconTooltip,
  Box,
} from '@citizenlab/cl2-component-library';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  checked: boolean;
  id: string;
  onChange: (e: React.FormEvent<Element>) => void;
}

const AdminCollaboratorToggle = ({ checked, id, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const isGranularPermissionsEnabled = useFeatureFlag({
    name: 'granular_permissions',
  });

  return (
    <Tooltip
      placement="bottom-start"
      disabled={isGranularPermissionsEnabled}
      content={<FormattedMessage {...messages.granularPermissionsOffText} />}
    >
      <Box w="fit-content">
        <Toggle
          checked={checked}
          disabled={!isGranularPermissionsEnabled}
          label={
            <Box display="flex">
              <span style={{ color: colors.primary }}>
                <FormattedMessage
                  {...messages.permissionsAdminsAndCollaborators}
                />
              </span>

              <IconTooltip
                ml="4px"
                icon="info-solid"
                content={formatMessage(
                  messages.permissionsAdminsAndCollaboratorsTooltip
                )}
              />
            </Box>
          }
          onChange={onChange}
          id={id}
        />
      </Box>
    </Tooltip>
  );
};

export default AdminCollaboratorToggle;
