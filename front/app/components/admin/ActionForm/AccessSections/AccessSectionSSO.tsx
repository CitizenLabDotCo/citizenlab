// "Who can participate" for the SSO variant. Same shape as AccessSection, but
// "Require sign-in" is a single fixed single-sign-on method with no per-method
// options to configure.

import React, { useState } from 'react';

import {
  Box,
  Text,
  Icon,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useAuthenticationMethod from 'api/id_methods/useAuthenticationMethod';

import { requiresAccount, ssoMethodName } from '../logic';
import { SectionHeader } from '../ui';
import VerificationFieldsModal from './VerificationFieldsModal';

import GroupsSection from './GroupsSection';
import ModeCards from './ModeCards';
import { AccessSectionProps, linkStyle } from './shared';

const AccessSectionSSO = ({
  permission,
  showAnyone,
  onChange,
}: AccessSectionProps) => {
  const hasAccount = requiresAccount(permission);
  const [returnedFieldsOpen, setReturnedFieldsOpen] = useState(false);

  const { data: authenticationMethod } = useAuthenticationMethod();
  const methodName = ssoMethodName(authenticationMethod);

  return (
    <Box>
      <SectionHeader
        icon="user-circle"
        title="Who can participate"
        tooltip="Decide whether an account is needed. Sign-in is handled by single sign-on."
      />

      <ModeCards
        permittedBy={permission.attributes.permitted_by}
        showAnyone={showAnyone}
        signInTitle="Require single sign-on"
        signInDescription="Sign in via the configured SSO account."
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
                Participants sign in with their {methodName}
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
                See which fields this returns
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
