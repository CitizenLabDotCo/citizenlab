// "What we collect": personal info, demographic questions, and how the
// collected data is linked to the submission (anonymity). Each is a collapsible
// section; this file only composes them and decides which apply.

import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import usePhase from 'api/phases/usePhase';

import { Changes, IPhasePermissionData } from '../types';
import { SectionHeader } from '../ui';

import AnonymitySection from './AnonymitySection';
import DemographicSection from './DemographicSection';
import PersonalInfoSection from './PersonalInfoSection';

interface Props {
  permission: IPhasePermissionData;
  phaseId: string;
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
  const { data: phase } = usePhase(phaseId);

  // PII only make sense if there is an account
  const showPIISection = attributes.permitted_by === 'users';

  const permissionHasForm = attributes.action === 'posting_idea';
  const isNativeSurveyPhase = phase?.data.attributes.participation_method === 'native_survey';

  // The anonymity settings are only implemented for native surveys atm.
  const isNativeSurveySubmission = permissionHasForm && isNativeSurveyPhase;

  return (
    <Box>
      <SectionHeader
        icon="user-data"
        title="What we collect"
        tooltip="Information collected from participants, and how it is stored alongside their submission."
      />

      <Box border={`1px solid ${colors.borderLight}`} borderRadius="8px" px="14px">
        {showPIISection && (
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
            showPIISection ? `1px solid ${colors.divider}` : undefined
          }
        >
          <DemographicSection
            permission={permission}
            phaseId={phaseId}
            permissionHasForm={permissionHasForm}
            onChange={onChange}
          />
        </Box>

        {isNativeSurveySubmission && (
          <Box borderTop={`1px solid ${colors.divider}`}>
            <AnonymitySection permission={permission} onChange={onChange} />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default DataSection;
