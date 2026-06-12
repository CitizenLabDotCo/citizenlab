// "What we collect": personal info, demographic questions, and how the
// collected data is linked to the submission (anonymity). Each is a collapsible
// section; this file only composes them and decides which apply.

import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { Changes, IPhasePermissionData } from '../types';
import { SectionHeader } from '../ui';

import AnonymitySection from './AnonymitySection';
import DemographicSection from './DemographicsSection/DemographicSection';
import PersonalInfoSection from './PersonalInfoSection';

interface Props {
  permission: IPhasePermissionData;
  phaseId?: string;
  passwordAvailable: boolean;
  // The password requirement is specific to email/password accounts; SSO-only
  // variants hide it entirely.
  showPassword?: boolean;
  onChange: (changes: Changes) => void;
}

const DataSection = ({
  permission,
  phaseId,
  passwordAvailable,
  showPassword = true,
  onChange,
}: Props) => {
  const { attributes } = permission;

  // PII and anonymity need an account; demographics are collected in any mode.
  const showAccountParts = attributes.permitted_by === 'users';

  return (
    <Box>
      <SectionHeader
        icon="user-data"
        title="What we collect"
        tooltip="Information collected from participants, and how it is stored alongside their submission."
      />

      <Box border={`1px solid ${colors.borderLight}`} borderRadius="8px" px="14px">
        {/* Personal info — only meaningful when there's an account. */}
        {showAccountParts && (
          <PersonalInfoSection
            permission={permission}
            passwordAvailable={passwordAvailable}
            showPassword={showPassword}
            onChange={onChange}
          />
        )}

        {/* Demographics — available in every mode. */}
        <Box
          borderTop={
            showAccountParts ? `1px solid ${colors.divider}` : undefined
          }
        >
          <DemographicSection
            permission={permission}
            phaseId={phaseId}
            onChange={onChange}
          />
        </Box>

        {/* Anonymity / data linking — only with an account to link against. */}
        {showAccountParts && (
          <Box borderTop={`1px solid ${colors.divider}`}>
            <AnonymitySection permission={permission} onChange={onChange} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DataSection;
