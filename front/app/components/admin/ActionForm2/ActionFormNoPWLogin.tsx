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

import useVerificationMethod from 'api/id_methods/useVerificationMethod';
import usePermissionsPhaseCustomFields from 'api/permissions_phase_custom_fields/usePermissionsPhaseCustomFields';

import AccessSectionSSO from './AccessSectionSSO';
import DataSection from './DataSection';
import { buildSummarySSO, getGroupIds, ssoMethodName } from './logic';
import { Props } from './types';
import { Chip } from './ui';

/**
 * The variant used when password login is disabled on the platform.
 *
 * Without password login there is no email/password account, so instead of
 * picking between confirmed email / identity verification, "require sign-in"
 * means a single fixed SSO method (e.g. a city account) with no further
 * options. Everything downstream (groups, personal info, demographics,
 * anonymity) behaves the same, except the password requirement is dropped
 * since SSO accounts have no platform password.
 */
const ActionFormNoPWLogin = ({
  phaseId,
  permissionData,
  onChange,
  onReset,
}: Props) => {
  const [isOpen, setIsOpen] = useState(true);

  const { attributes } = permissionData;
  const { action } = attributes;

  const { data: permissionsCustomFields } = usePermissionsPhaseCustomFields({
    phaseId,
    action,
  });
  const { data: verificationMethod } = useVerificationMethod();

  if (!permissionsCustomFields) return null;

  const customFields = permissionsCustomFields.data;

  const showAnyone = attributes.permitted_by_everyone_allowed;
  const isAdmins = attributes.permitted_by === 'admins_moderators';

  const summary = buildSummarySSO(
    permissionData,
    customFields,
    ssoMethodName(verificationMethod)
  );

  const showReset =
    getGroupIds(permissionData).length > 0 ||
    (!isAdmins &&
      attributes.permitted_by !== 'everyone' &&
      customFields.some((field) => field.attributes.persisted));

  return (
    <Box maxWidth="760px" my="24px">
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
              Who can submit inputs?
            </Title>
          </Box>

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

            <AccessSectionSSO
              permission={permissionData}
              showAnyone={showAnyone}
              onChange={onChange}
            />

            {!isAdmins && (
              <>
                <Divider my="24px" />
                <DataSection
                  permission={permissionData}
                  phaseId={phaseId}
                  passwordAvailable={false}
                  showPassword={false}
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

export default ActionFormNoPWLogin;
