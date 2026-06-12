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

import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';

import AccessSection from './AccessSections/AccessSection';
import DataSection from './DataSection';
import { buildSummary, getGroupIds } from './logic';
import { Props } from './types';
import { Chip } from './ui';

/**
 * "Participation requirements" — a single, collapsible panel that captures
 * everything a participant must satisfy before they can take an action:
 * authentication, group membership, personal info and demographic questions.
 *
 * The standard variant, used when password login is enabled. It is a *stateless*
 * controlled component: it renders the `permissionData` it is given and reports
 * edits through `onChange`; the parent owns the state and persists it. The
 * demographic questions come straight from `usePermissionsPhaseCustomFields`
 * rather than from a prop.
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

  const { attributes } = permissionData;
  const { action } = attributes;

  const { data: permissionsCustomFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });

  if (!permissionsCustomFields) return null;

  const customFields = permissionsCustomFields.data;

  // Whether the "Anyone" option is offered is a property of the permission.
  const showAnyone = attributes.permitted_by_everyone_allowed;
  const isAdmins = attributes.permitted_by === 'admins_moderators';
  // This variant is only rendered when password login is enabled, so the
  // password requirement just needs the confirmed-email method enabled.
  const passwordAvailable = attributes.require_confirmed_email;

  const summary = buildSummary(permissionData, customFields);

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

            <AccessSection
              permission={permissionData}
              showAnyone={showAnyone}
              onChange={onChange}
            />

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
