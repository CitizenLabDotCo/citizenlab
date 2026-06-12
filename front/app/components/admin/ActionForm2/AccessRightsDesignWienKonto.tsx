import React, { useState } from 'react';

import {
  Box,
  Title,
  Icon,
  Divider,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import { IPermissionsPhaseCustomFieldData } from 'api/permissions_phase_custom_fields/types';
import { IPhasePermissionData } from 'api/phase_permissions/types';

import AccessSectionWienKonto from './AccessSectionWienKonto';
import {
  DEFAULT_CUSTOM_FIELDS,
  DEFAULT_PERMISSION_WIEN_KONTO,
  DEFAULT_PLATFORM_SETTINGS,
  STADT_WIEN_KONTO_NAME,
} from './data';
import DataSection from './DataSection';
import { buildSummaryWienKonto, normalize, normalizeCustomFields } from './logic';
import { PlatformSettings } from './types';
import { Chip } from './ui';

interface Props {
  /** Initial phase permission. Falls back to a sensible default. */
  initialPermission?: IPhasePermissionData;
  /** Initial demographic questions (permission custom fields). */
  initialCustomFields?: IPermissionsPhaseCustomFieldData[];
  defaultOpen?: boolean;
}

/**
 * Stadt Wien Konto variant of the participation-requirements panel.
 *
 * Identical to the standard panel except for the sign-in choice: instead of
 * picking between confirmed email / identity verification, "require sign-in"
 * means a single fixed SSO method — the Stadt Wien Konto — with no further
 * options. This covers configurations that mandate one specific city account.
 * Everything downstream (groups, personal info, demographics, anonymity)
 * behaves the same, except the password requirement is dropped since SSO
 * accounts have no platform password.
 */
const AccessRightsDesignWienKonto = ({
  initialPermission = DEFAULT_PERMISSION_WIEN_KONTO,
  initialCustomFields = DEFAULT_CUSTOM_FIELDS,
  defaultOpen = true,
}: Props) => {
  const settings: PlatformSettings = DEFAULT_PLATFORM_SETTINGS;
  const [permission, setPermission] = useState<IPhasePermissionData>(
    normalize(initialPermission, settings)
  );
  const [customFields, setCustomFields] = useState<
    IPermissionsPhaseCustomFieldData[]
  >(normalizeCustomFields(initialPermission, initialCustomFields));
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handlePermissionChange = (next: IPhasePermissionData) => {
    const normalized = normalize(next, settings);
    setPermission(normalized);
    setCustomFields((fields) => normalizeCustomFields(normalized, fields));
  };

  const summary = buildSummaryWienKonto(
    permission,
    customFields,
    STADT_WIEN_KONTO_NAME
  );
  const isAdmins = permission.attributes.permitted_by === 'admins_moderators';

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

            <AccessSectionWienKonto
              permission={permission}
              onChange={handlePermissionChange}
            />

            {!isAdmins && (
              <>
                <Divider my="24px" />
                <DataSection
                  permission={permission}
                  customFields={customFields}
                  passwordAvailable={false}
                  showPassword={false}
                  onChange={handlePermissionChange}
                  onChangeCustomFields={setCustomFields}
                />
              </>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default AccessRightsDesignWienKonto;
