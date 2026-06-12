// "Who can participate" for the SSO variant. Same shape as AccessSection, but
// "Require sign-in" is a single fixed single-sign-on method with no per-method
// options to configure.

import React, { useState } from 'react';

import { Box, Text, Icon, Button, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import useGroups from 'api/groups/useGroups';
import useVerificationMethod from 'api/id_methods/useVerificationMethod';
import { PermittedBy } from 'api/phase_permissions/types';

import useLocalize from 'hooks/useLocalize';

import MultipleSelect from 'components/UI/MultipleSelect';

import ErrorMessageModal from './ErrorMessageModal';
import { getGroupIds, groupsSummary, requiresAccount, ssoMethodName } from './logic';
import { Changes, IPhasePermissionData } from './types';
import { SectionHeader, Hint, Expander, ModeCard } from './ui';
import VerificationFieldsModal from './VerificationFieldsModal';

const linkStyle: React.CSSProperties = {
  cursor: 'pointer',
  textDecoration: 'underline',
  color: colors.teal700,
};

interface Props {
  permission: IPhasePermissionData;
  // Whether the "Anyone" option is offered (derived from
  // `permitted_by_everyone_allowed` by the parent).
  showAnyone: boolean;
  onChange: (changes: Changes) => void;
}

const AccessSectionSSO = ({ permission, showAnyone, onChange }: Props) => {
  const hasAccount = requiresAccount(permission);
  const [errorMessageOpen, setErrorMessageOpen] = useState(false);
  const [returnedFieldsOpen, setReturnedFieldsOpen] = useState(false);

  const localize = useLocalize();
  const { data: groups } = useGroups({});
  const { data: verificationMethod } = useVerificationMethod();
  const methodName = ssoMethodName(verificationMethod);

  const setMode = (permitted_by: PermittedBy) => onChange({ permitted_by });

  const setAccessDeniedMultiloc = (
    access_denied_explanation_multiloc: Multiloc
  ) => onChange({ access_denied_explanation_multiloc });

  return (
    <Box>
      <SectionHeader
        icon="user-circle"
        title="Who can participate"
        tooltip="Decide whether an account is needed. Sign-in is handled by single sign-on."
      />

      <Box display="flex" flexWrap="wrap" gap="8px" mb="16px">
        {showAnyone && (
          <ModeCard
            icon="user-circle"
            title="Anyone"
            description="No account needed."
            selected={permission.attributes.permitted_by === 'everyone'}
            onClick={() => setMode('everyone')}
          />
        )}
        <ModeCard
          icon="shield-checkered"
          title="Require single sign-on"
          description="Sign in via the configured SSO account."
          selected={permission.attributes.permitted_by === 'users'}
          onClick={() => setMode('users')}
        />
        <ModeCard
          icon="lock"
          title="Admins & managers only"
          description="Restricted to staff."
          selected={
            permission.attributes.permitted_by === 'admins_moderators'
          }
          onClick={() => setMode('admins_moderators')}
        />
      </Box>

      {permission.attributes.permitted_by === 'admins_moderators' && (
        <Hint>
          Only admins and managers can take this action. No other requirements
          apply.
        </Hint>
      )}

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

          {/* Groups — same collapsible row as the standard variant. */}
          <Box mt="8px" borderTop={`1px solid ${colors.divider}`}>
            <Expander
              icon="group"
              title="Limit to groups"
              summary={groupsSummary(permission)}
            >
              <Text as="p" mt="0" mb="8px" fontSize="xs" color="coolGrey600">
                Participant must be in any one of the selected groups.
              </Text>
              <Box maxWidth="440px">
                <MultipleSelect
                  value={getGroupIds(permission)}
                  options={(groups?.data ?? []).map((g) => ({
                    value: g.id,
                    label: localize(g.attributes.title_multiloc),
                  }))}
                  onChange={(options) =>
                    onChange({ group_ids: options.map((o) => o.value) })
                  }
                  placeholder="All participants (no group restriction)"
                />
              </Box>

              <Box mt="12px">
                <Button
                  buttonStyle="secondary-outlined"
                  size="s"
                  icon="edit"
                  onClick={() => setErrorMessageOpen(true)}
                >
                  Customize error message
                </Button>
              </Box>
            </Expander>
          </Box>
        </>
      )}

      <ErrorMessageModal
        opened={errorMessageOpen}
        valueMultiloc={
          permission.attributes.access_denied_explanation_multiloc
        }
        onClose={() => setErrorMessageOpen(false)}
        onChange={setAccessDeniedMultiloc}
      />
      <VerificationFieldsModal
        opened={returnedFieldsOpen}
        onClose={() => setReturnedFieldsOpen(false)}
      />
    </Box>
  );
};

export default AccessSectionSSO;
