import React, { useState } from 'react';

import {
  Box,
  Button,
  Title,
  Icon,
  Divider,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import useAuthenticationMethod from 'api/id_methods/useAuthenticationMethod';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';

import useFeatureFlag from 'hooks/useFeatureFlag';

import AccessSection from './AccessSections/AccessSection';
import AccessSectionSSO from './AccessSections/AccessSectionSSO';
import DataSection from './DataSection';
import {
  buildSummary,
  buildSummarySSO,
  getGroupIds,
  ssoMethodName,
} from './logic';
import { Props } from './types';
import { Chip } from './ui';

/**
 * "Participation requirements" — a single, collapsible panel that captures
 * everything a participant must satisfy before they can take an action:
 * authentication, group membership, personal info and demographic questions.
 *
 * A *stateless* controlled component: it renders the `permissionData` it is
 * given and reports edits through `onChange`; the parent owns the state and
 * persists it. The demographic questions come straight from
 * `usePermissionsPhaseCustomFields` rather than from a prop.
 *
 * The access section adapts to the platform's `password_login` setting:
 *  - with password login, admins pick between confirmed email / identity
 *    verification (`AccessSection`);
 *  - without it, there is no email/password account, so "require sign-in" means
 *    a single fixed SSO method and the password requirement is dropped
 *    (`AccessSectionSSO`).
 *
 * Design notes:
 *  - One panel, two groups: *who can participate* (access) and *what we ask*
 *    (data), splitting access-rights from data collection.
 *  - Collapses to a one-line summary of chips so several actions fit on a page.
 *  - The rules engine in logic.ts keeps invalid combinations impossible: turn
 *    off all auth and the data section greys out; turn off password login and
 *    the email method disables; etc.
 */
const ActionForm = ({
  phaseId,
  permissionData,
  title,
  defaultOpen = false,
  onChange,
  onReset,
}: Props) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const passwordLoginEnabled = useFeatureFlag({ name: 'password_login' });

  const { attributes } = permissionData;
  const { action } = attributes;

  const { data: permissionsCustomFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });
  const { data: authenticationMethod } = useAuthenticationMethod();

  if (!permissionsCustomFields) return null;

  const customFields = permissionsCustomFields.data;

  // Whether the "Anyone" option is offered is a property of the permission.
  const showAnyone = attributes.permitted_by_everyone_allowed;
  const isAdmins = attributes.permitted_by === 'admins_moderators';
  // The password requirement only applies with password login enabled, and then
  // only alongside the confirmed-email method.
  const passwordAvailable =
    passwordLoginEnabled && attributes.require_confirmed_email;

  const summary = passwordLoginEnabled
    ? buildSummary(permissionData, customFields)
    : buildSummarySSO(
      permissionData,
      customFields,
      ssoMethodName(authenticationMethod)
    );

  // Reset clears the account-only customisations (groups + persisted questions);
  // it has nothing to undo for the open / admins-only gates.
  const showReset =
    getGroupIds(permissionData).length > 0 ||
    (!isAdmins &&
      attributes.permitted_by !== 'everyone' &&
      customFields.some((field) => field.attributes.persisted));

  return (
    <Box maxWidth="900px" my="16px">
      <Box
        border={`1px solid ${colors.borderLight}`}
        borderRadius={stylingConsts.borderRadius}
        bgColor={colors.white}
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
      >
        {/* ---- Header (always visible, click to collapse/expand) ---- */}
        <Box
          as="button"
          type="button"
          w="100%"
          display="flex"
          alignItems="center"
          gap="12px"
          px="20px"
          py="16px"
          background="transparent"
          style={{ border: 'none', cursor: 'pointer', textAlign: 'left' }}
          onClick={() => setIsOpen((open) => !open)}
        >
          <Icon
            name={isOpen ? 'chevron-down' : 'chevron-right'}
            width="20px"
            height="20px"
            fill={colors.coolGrey600}
          />
          <Box flex="0 0 auto">
            <Title variant="h4" as="h3" m="0" color="primary">
              {title}
            </Title>
          </Box>

          {/* When collapsed, the summary chips stand in for the whole panel. */}
          {!isOpen && (
            <Box display="flex" alignItems="center" gap="6px" flexWrap="wrap" ml="4px">
              {summary.map((chip) => (
                <Chip key={chip.key} chip={chip} />
              ))}
            </Box>
          )}
        </Box>

        {isOpen && (
          <Box px="20px" pb="20px">
            <Divider mt="0" mb="20px" />

            {passwordLoginEnabled ? (
              <AccessSection
                permission={permissionData}
                showAnyone={showAnyone}
                onChange={onChange}
              />
            ) : (
              <AccessSectionSSO
                permission={permissionData}
                showAnyone={showAnyone}
                onChange={onChange}
              />
            )}

            {/* Admins-only is a closed gate — nothing else applies. For the
                other modes, demographics can be collected (the account-only
                parts hide themselves inside DataSection). */}
            {!isAdmins && (
              <>
                <Divider my="24px" />
                <DataSection
                  permission={permissionData}
                  phaseId={phaseId}
                  passwordAvailable={passwordAvailable}
                  showPassword={passwordLoginEnabled}
                  onChange={onChange}
                />
              </>
            )}

            {showReset && (
              <Box mt="24px">
                <Button
                  buttonStyle="text"
                  width="auto"
                  padding="0px"
                  onClick={onReset}
                >
                  <span style={{ textDecorationLine: 'underline' }}>
                    Reset demographic questions and groups
                  </span>
                </Button>
              </Box>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default ActionForm;
