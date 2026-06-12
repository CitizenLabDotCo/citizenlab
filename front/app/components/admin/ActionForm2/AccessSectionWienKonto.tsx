// Design prototype – "Who can participate" for the Stadt Wien Konto variant.
// Same shape as AccessSection, but "Require sign-in" is a single fixed SSO
// method (Stadt Wien Konto) with no per-method options to configure.

import React, { useState } from 'react';

import { Box, Text, Icon, Button, colors, stylingConsts } from '@citizenlab/cl2-component-library';
import { Multiloc } from 'typings';

import { PermittedBy } from 'api/phase_permissions/types';

import MultipleSelect from 'components/UI/MultipleSelect';

import {
  MOCK_GROUPS,
  STADT_WIEN_KONTO_NAME,
  STADT_WIEN_KONTO_RETURNED_FIELDS,
} from './data';
import ErrorMessageModal from './ErrorMessageModal';
import { getGroupIds, groupsSummary, requiresAccount, setGroupIds } from './logic';
import { IPhasePermissionData } from './types';
import { SectionHeader, Hint, Expander, ModeCard } from './ui';
import VerificationFieldsModal from './VerificationFieldsModal';

const linkStyle: React.CSSProperties = {
  cursor: 'pointer',
  textDecoration: 'underline',
  color: colors.teal700,
};

interface Props {
  permission: IPhasePermissionData;
  onChange: (permission: IPhasePermissionData) => void;
}

const AccessSectionWienKonto = ({ permission, onChange }: Props) => {
  const hasAccount = requiresAccount(permission);
  const [errorMessageOpen, setErrorMessageOpen] = useState(false);
  const [returnedFieldsOpen, setReturnedFieldsOpen] = useState(false);

  const setMode = (permitted_by: PermittedBy) =>
    onChange({
      ...permission,
      attributes: { ...permission.attributes, permitted_by },
    });

  const setAccessDeniedMultiloc = (
    access_denied_explanation_multiloc: Multiloc
  ) =>
    onChange({
      ...permission,
      attributes: {
        ...permission.attributes,
        access_denied_explanation_multiloc,
      },
    });

  return (
    <Box>
      <SectionHeader
        icon="user-circle"
        title="Who can participate"
        tooltip="Decide whether an account is needed. Sign-in is handled by the Stadt Wien Konto."
      />

      <Box display="flex" flexWrap="wrap" gap="8px" mb="16px">
        <ModeCard
          icon="user-circle"
          title="Anyone"
          description="No account needed."
          selected={permission.attributes.permitted_by === 'everyone'}
          onClick={() => setMode('everyone')}
        />
        <ModeCard
          icon="shield-checkered"
          title="Require sign-in with Stadt Wien Konto"
          description="Sign in via the city account."
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
                Participants sign in with their {STADT_WIEN_KONTO_NAME}
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
                  options={MOCK_GROUPS.map((g) => ({ value: g.id, label: g.title }))}
                  onChange={(options) =>
                    onChange(setGroupIds(permission, options.map((o) => o.value)))
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
        methodName={STADT_WIEN_KONTO_NAME}
        fields={STADT_WIEN_KONTO_RETURNED_FIELDS}
        onClose={() => setReturnedFieldsOpen(false)}
      />
    </Box>
  );
};

export default AccessSectionWienKonto;
