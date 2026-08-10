// "Who can participate": how people get in (sign-in), and — separately — what
// extra proof is required once they are in (security checks) and which groups
// they must belong to.

import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { useIntl } from 'utils/cl-intl';

import { requiresAccount } from '../logic';
import { SectionHeader } from '../ui';

import GroupsSection from './GroupsSection';
import IdMethodsModalTrigger from './IdMethodsModal/Trigger';
import messages from './messages';
import ModeCards from './ModeCards';
import SecurityRequirementsSection from './SecurityRequirementsSection';
import { AccessSectionProps } from './shared';
import useSignInMethods from './useSignInMethods';

const AccessSection = ({
  permission,
  showAnyone,
  onChange,
}: AccessSectionProps) => {
  const { formatMessage } = useIntl();
  const hasAccount = requiresAccount(permission);
  const signInMethods = useSignInMethods();

  // Nothing to list means nobody can get an account at all — a platform
  // misconfiguration the admin should see rather than an empty description.
  const noSignInMethod = signInMethods.length === 0;

  return (
    <Box>
      <SectionHeader
        icon="user-circle"
        title={formatMessage(messages.whoCanParticipate)}
      />

      <ModeCards
        permittedBy={permission.attributes.permitted_by}
        showAnyone={showAnyone}
        signInTitle={formatMessage(messages.requireSignIn)}
        signInDescription={
          noSignInMethod
            ? formatMessage(messages.noSignInMethodEnabled)
            : formatMessage(messages.signInWith, {
                methods: signInMethods.join(', '),
              })
        }
        signInDescriptionColor={noSignInMethod ? 'red600' : undefined}
        onChange={onChange}
      />

      {hasAccount && (
        <>
          <IdMethodsModalTrigger />

          <Box
            mt="12px"
            border={`1px solid ${colors.borderLight}`}
            borderRadius="8px"
            px="14px"
          >
            <SecurityRequirementsSection
              permission={permission}
              onChange={onChange}
            />

            <Box borderTop={`1px solid ${colors.divider}`}>
              <GroupsSection permission={permission} onChange={onChange} />
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
};

export default AccessSection;
