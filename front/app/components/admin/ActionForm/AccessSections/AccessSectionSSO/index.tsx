import React, { useState } from 'react';

import {
  Box,
  Text,
  Icon,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useAuthenticationMethod from 'api/id_methods/useAuthenticationMethod';

import useIdMethodNames, { getMethodName } from 'hooks/useIdMethodNames';

import { useIntl } from 'utils/cl-intl';

import { requiresAccount } from '../../logic';
import { SectionHeader } from '../../ui';
import accessSectionMessages from '../AccessSection/messages';
import GroupsSection from '../GroupsSection';
import IdMethodFieldsModal from '../IdMethodFieldsModal';
import sharedMessages from '../messages';
import ModeCards from '../ModeCards';
import { AccessSectionProps, linkStyle } from '../shared';

import messages from './messages';

const AccessSectionSSO = ({
  permission,
  showAnyone,
  onChange,
}: AccessSectionProps) => {
  const { formatMessage } = useIntl();
  const hasAccount = requiresAccount(permission);
  const [returnedFieldsOpen, setReturnedFieldsOpen] = useState(false);

  const { data: authenticationMethod } = useAuthenticationMethod();
  const idMethodNames = useIdMethodNames();
  const methodName = authenticationMethod
    ? getMethodName(authenticationMethod.data, idMethodNames)
    : '';

  return (
    <Box>
      <SectionHeader
        icon="user-circle"
        title={formatMessage(accessSectionMessages.whoCanParticipate)}
        tooltip={formatMessage(messages.firstDecideSSO)}
      />

      <ModeCards
        permittedBy={permission.attributes.permitted_by}
        showAnyone={showAnyone}
        signInTitle={formatMessage(messages.requireSSO)}
        signInDescription={formatMessage(messages.signInViaSSO)}
        onChange={onChange}
      />

      {hasAccount && (
        <>
          {/* Fixed identification method — no options to configure. This
              variant assumes exactly one method is enabled, so the link can
              speak about "this" method. */}
          <Box
            p="14px"
            borderRadius={stylingConsts.borderRadius}
            border={`1px solid ${colors.teal400}`}
            bgColor={colors.teal50}
            display="flex"
            alignItems="center"
            gap="10px"
          >
            <Icon
              name="shield-checkered"
              width="20px"
              height="20px"
              fill={colors.teal500}
            />
            <Box display="flex" flexDirection="column" gap="2px">
              <Text
                as="span"
                m="0"
                fontSize="s"
                fontWeight="semi-bold"
                color="primary"
              >
                {formatMessage(messages.participantsSignInWith, { methodName })}
              </Text>
              <Text
                as="span"
                m="0"
                fontSize="xs"
                style={linkStyle}
                role="button"
                tabIndex={0}
                onClick={() => setReturnedFieldsOpen(true)}
              >
                {formatMessage(sharedMessages.seeMethodProperties)}
              </Text>
            </Box>
          </Box>

          <GroupsSection permission={permission} onChange={onChange} />
        </>
      )}

      <IdMethodFieldsModal
        opened={returnedFieldsOpen}
        onClose={() => setReturnedFieldsOpen(false)}
      />
    </Box>
  );
};

export default AccessSectionSSO;
