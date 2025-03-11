import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

type UserFieldsInFormNoticeProps = {
  projectId: string;
  phaseId: string;
};

const UserFieldsInFormNotice = ({
  projectId,
  phaseId,
}: UserFieldsInFormNoticeProps) => {
  const { formatMessage } = useIntl();

  const accessRightsSettingsLink = (
    <Link
      to={`/admin/projects/${projectId}/phases/${phaseId}/access-rights`}
      target="_blank"
    >
      {formatMessage(messages.accessRightsSettings)}
    </Link>
  );

  return (
    <Box mt="24px" px="14px" display="flex" alignItems="center">
      <Box display="flex">
        <Icon
          name="info-outline"
          fill={colors.grey700}
          mr="8px"
          ml="4px"
          width="16px"
          height="16px"
        />
      </Box>
      <Box display="flex">
        <Text color="grey700" fontStyle="italic">
          <FormattedMessage
            {...messages.fieldsEnabledMessage}
            values={{
              accessRightsSettingsLink,
            }}
          />
        </Text>
      </Box>
    </Box>
  );
};

export default UserFieldsInFormNotice;
