import React, { useState } from 'react';

import {
  Box,
  Title,
  Icon,
  Divider,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import AccessSection from './AccessSection';
import {
  DEFAULT_CONFIG,
  DEFAULT_PLATFORM_SETTINGS,
} from './data';
import DataSection from './DataSection';
import { buildSummary, normalize } from './logic';
import { AccessConfig, PlatformSettings } from './types';
import { Chip } from './ui';

interface Props {
  /** Initial configuration. Falls back to a sensible default. */
  initialConfig?: AccessConfig;
  defaultOpen?: boolean;
}

/**
 * "Participation requirements" — a single, collapsible panel that captures
 * everything a participant must satisfy before they can take an action:
 * authentication, group membership, personal info and demographic questions.
 *
 * Design notes (see the chat for the full rationale):
 *  - One panel, two groups: *who can participate* (access) and *what we ask*
 *    (data). This mirrors the brief's own split of access-rights vs collection.
 *  - Collapses to a one-line summary of chips so several actions fit on a page.
 *  - The rules engine in logic.ts keeps invalid combinations impossible: turn
 *    off all auth and the data section greys out; turn off password login and
 *    the email method disables; etc.
 */
const AccessRightsDesign = ({
  initialConfig = DEFAULT_CONFIG,
  defaultOpen = true,
}: Props) => {
  // In the real component these come from the AppConfiguration settings.
  const settings: PlatformSettings = DEFAULT_PLATFORM_SETTINGS;
  const [config, setConfig] = useState<AccessConfig>(
    normalize(initialConfig, settings)
  );
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const handleConfigChange = (next: AccessConfig) =>
    setConfig(normalize(next, settings));

  const summary = buildSummary(config);
  const passwordAvailable =
    settings.passwordLoginEnabled && config.methods.email.enabled;

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
              Participation requirements
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
              config={config}
              settings={settings}
              onChange={handleConfigChange}
            />

            {/* Admins-only is a closed gate — nothing else applies. For the
                other modes, demographics can be collected (the account-only
                parts hide themselves inside DataSection). */}
            {config.mode !== 'admins' && (
              <>
                <Divider my="24px" />
                <DataSection
                  config={config}
                  passwordAvailable={passwordAvailable}
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

export default AccessRightsDesign;
