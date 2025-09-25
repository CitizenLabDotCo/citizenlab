import React from 'react';

import {
  Box,
  Icon,
  Text,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import CloseIconButton from 'components/UI/CloseIconButton';

import { FormattedMessage, useIntl } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from './messages';

type AccessRightsNoticeProps = {
  projectId: string;
  phaseId: string;
  handleClose: () => void;
};

const AccessRightsNotice = ({
  projectId,
  phaseId,
  handleClose,
}: AccessRightsNoticeProps) => {
  const { formatMessage } = useIntl();

  const accessRightsSettingsLink = (
    <Link to={`/admin/projects/${projectId}/phases/${phaseId}/access-rights`}>
      {formatMessage(messages.accessRightsSettings)}
    </Link>
  );

  return (
    <Box id="e2e-warning-notice" mb="16px">
      <Box
        w="100%"
        display="flex"
        justifyContent="space-between"
        flexDirection="row"
        borderRadius={stylingConsts.borderRadius}
        bgColor={colors.teal100}
        p="12px"
      >
        <Box display="flex" alignItems="center">
          <Icon name="info-outline" height="24px" fill={colors.teal700} />
          <Text m="0" ml="12px" color="teal700" fontWeight="semi-bold">
            <FormattedMessage
              {...messages.checkTheAccessRights}
              values={{ accessRightsSettings: accessRightsSettingsLink }}
            />
          </Text>
        </Box>
        <CloseIconButton onClick={handleClose} />
      </Box>
    </Box>
  );
};

export default AccessRightsNotice;
