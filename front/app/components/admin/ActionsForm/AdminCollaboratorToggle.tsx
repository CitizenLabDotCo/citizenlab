import React from 'react';

import {
  Toggle,
  colors,
  IconTooltip,
  Box,
} from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  enabled: boolean;
  id: string;
  onChange: (e: React.FormEvent<Element>) => void;
}

const AdminCollaboratorToggle = ({ enabled, id, onChange }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Toggle
      checked={enabled}
      label={
        <Box display="flex">
          <span style={{ color: colors.primary }}>
            <FormattedMessage {...messages.permissionsAdminsAndCollaborators} />
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
  );
};

export default AdminCollaboratorToggle;
