// "What we collect": personal info, demographic questions, and how the
// collected data is linked to the submission (anonymity). Each is a collapsible
// section; this file only composes them and decides which apply.

import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPhasePermissionData } from 'api/phase_permissions/types';
import usePhase from 'api/phases/usePhase';

import { useIntl } from 'utils/cl-intl';

import { Changes } from '../types';
import { SectionHeader } from '../ui';

import AnonymitySection from './AnonymitySection';
import DemographicSection from './DemographicSection';
import messages from './messages';
import PersonalInfoSection from './PersonalInfoSection';

interface Props {
  permission: IPhasePermissionData;
  phaseId: string;
  onChange: (changes: Changes) => void;
}

const DataSection = ({ permission, phaseId, onChange }: Props) => {
  const { attributes } = permission;
  const { data: phase } = usePhase(phaseId);
  const { formatMessage } = useIntl();

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
        title={formatMessage(messages.whatWeCollect)}
        tooltip={formatMessage(messages.whatWeCollectTooltip)}
      />

      <Box border={`1px solid ${colors.borderLight}`} borderRadius="8px" px="14px">
        {showPIISection && (
          <PersonalInfoSection permission={permission} onChange={onChange} />
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
