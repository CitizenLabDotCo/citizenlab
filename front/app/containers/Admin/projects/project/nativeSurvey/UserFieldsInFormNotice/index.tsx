import React from 'react';

import { Box, colors, Icon, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import usePhase from 'api/phases/usePhase';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

type UserFieldsInFormNoticeProps = {
  communityMonitor?: boolean;
};

const UserFieldsInFormNotice = ({
  communityMonitor = false,
}: UserFieldsInFormNoticeProps) => {
  const { formatMessage } = useIntl();
  const { phaseId, projectId } = useParams() as {
    projectId: string;
    phaseId: string;
  };
  const { data: phase } = usePhase(phaseId);

  if (!phase?.data.attributes.user_fields_in_form) return null;

  const accessRightsPath: RouteType = communityMonitor
    ? `/admin/community-monitor/settings/access-rights`
    : `/admin/projects/${projectId}/phases/${phaseId}/access-rights`;

  const accessRightsSettingsLink = (
    <Link to={accessRightsPath} target="_blank">
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
