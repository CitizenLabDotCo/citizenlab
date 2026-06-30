import React, { useState } from 'react';

import {
  Box,
  Text,
  Icon,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useAuthenticationMethod from 'api/id_methods/useAuthenticationMethod';

import { useIntl } from 'utils/cl-intl';

import { requiresAccount, ssoMethodName } from '../logic';
import { SectionHeader } from '../ui';

import GroupsSection from './GroupsSection';
import messages from './messages';
import ModeCards from './ModeCards';
import { AccessSectionProps, linkStyle } from './shared';
import VerificationFieldsModal from './VerificationFieldsModal';

const AccessSectionSSO = ({
  permission,
  showAnyone,
  onChange,
}: AccessSectionProps) => {
  const { formatMessage } = useIntl();
  const hasAccount = requiresAccount(permission);
  const [returnedFieldsOpen, setReturnedFieldsOpen] = useState(false);

  const { data: authenticationMethod } = useAuthenticationMethod();
  const methodName = ssoMethodName(authenticationMethod);

  return (
    <Box>
      <SectionHeader
        icon="user-circle"
        title={formatMessage(messages.whoCanParticipate)}
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
          {/* Fixed sign-in method — no options to configure. */}
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
              <Text as="span" m="0" fontSize="s" fontWeight="semi-bold" color="primary">
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
                {formatMessage(messages.seeWhichFieldsThisReturns)}
              </Text>
            </Box>
          </Box>

          <GroupsSection permission={permission} onChange={onChange} />
        </>
      )}

      <VerificationFieldsModal
        opened={returnedFieldsOpen}
        onClose={() => setReturnedFieldsOpen(false)}
      />
    </Box>
  );
};

export default AccessSectionSSO;
