// "What we collect": personal info, demographic questions, and how the
// collected data is linked to the submission (anonymity). Each is a collapsible
// section; this file only composes them and decides which apply.

import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import { IPermissionData } from 'api/permissions/types';
import usePhase from 'api/phases/usePhase';

import { useIntl } from 'utils/cl-intl';

import { Changes } from '../types';
import { SectionHeader } from '../ui';

import AnonymitySection from './AnonymitySection';
import DemographicSection from './DemographicSection';
import messages from './messages';
import PersonalInfoSection from './PersonalInfoSection';

interface Props {
  permission: IPermissionData;
  phaseId: string;
  onChange: (changes: Changes) => void;
}

const DataSection = ({ permission, phaseId, onChange }: Props) => {
  const { attributes } = permission;
  const { data: phase } = usePhase(phaseId);
  const { formatMessage } = useIntl();

  // PII only make sense if there is an account
  const showPIISection = attributes.permitted_by === 'users';

  const participationMethod = phase?.data.attributes.participation_method;
  const permissionHasForm = attributes.action === 'posting_idea';
  const isSurveyPhase =
    !!participationMethod &&
    ['native_survey', 'community_monitor_survey'].includes(participationMethod);

  // The anonymity settings are only implemented for the survey methods, which
  // resolve `user_data_collection` from this permission (ParticipationMethod::NativeSurvey
  // and the community monitor that inherits from it). Everything else reports 'all_data'.
  const isSurveySubmission = permissionHasForm && isSurveyPhase;

  return (
    <Box>
      <SectionHeader
        icon="user-data"
        title={formatMessage(messages.whatWeCollect)}
        tooltip={formatMessage(messages.whatWeCollectTooltip)}
      />

      <Box
        border={`1px solid ${colors.borderLight}`}
        borderRadius="8px"
        px="14px"
      >
        {isSurveySubmission && (
          <AnonymitySection permission={permission} onChange={onChange} />
        )}

        {showPIISection && (
          <Box
            borderTop={
              isSurveySubmission ? `1px solid ${colors.divider}` : undefined
            }
          >
            <PersonalInfoSection permission={permission} onChange={onChange} />
          </Box>
        )}

        {/* Demographics — available in every mode. */}
        <Box
          borderTop={
            showPIISection || isSurveySubmission
              ? `1px solid ${colors.divider}`
              : undefined
          }
        >
          <DemographicSection
            permission={permission}
            phaseId={phaseId}
            permissionHasForm={permissionHasForm}
            onChange={onChange}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default DataSection;
