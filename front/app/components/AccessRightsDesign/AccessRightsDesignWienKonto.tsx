import React, { useState } from 'react';

import {
  Box,
  Title,
  Icon,
  Divider,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import AccessSectionWienKonto from './AccessSectionWienKonto';
import {
  DEFAULT_CONFIG_WIEN_KONTO,
  DEFAULT_PLATFORM_SETTINGS,
  STADT_WIEN_KONTO_NAME,
} from './data';
import DataSection from './DataSection';
import { buildSummaryWienKonto, normalize } from './logic';
import { AccessConfig, PlatformSettings } from './types';
import { Chip } from './ui';

interface Props {
  /** Initial configuration. Falls back to a sensible default. */
  initialConfig?: AccessConfig;
  defaultOpen?: boolean;
}

/**
 * Stadt Wien Konto variant of the participation-requirements panel.
 *
 * Identical to the standard panel except for the sign-in choice: instead of
 * picking between confirmed email / phone / identity verification, "require
 * sign-in" means a single fixed SSO method — the Stadt Wien Konto — with no
 * further options. This covers configurations that mandate one specific city
 * account. Everything downstream (groups, personal info, demographics,
 * anonymity) behaves the same, except the password requirement is dropped
 * since SSO accounts have no platform password.
 */
const AccessRightsDesignWienKonto = ({
  initialConfig = DEFAULT_CONFIG_WIEN_KONTO,
  defaultOpen = true,
}: Props) => {
  const settings: PlatformSettings = DEFAULT_PLATFORM_SETTINGS;
  const [config, setConfig] = useState<AccessConfig>(
    normalize(initialConfig, settings)
  );
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleConfigChange = (next: AccessConfig) =>
    setConfig(normalize(next, settings));

  const summary = buildSummaryWienKonto(config, STADT_WIEN_KONTO_NAME);

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

            <AccessSectionWienKonto config={config} onChange={handleConfigChange} />

            {config.mode !== 'admins' && (
              <>
                <Divider my="24px" />
                <DataSection
                  config={config}
                  passwordAvailable={false}
                  showPassword={false}
                  onChange={handleConfigChange}
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
