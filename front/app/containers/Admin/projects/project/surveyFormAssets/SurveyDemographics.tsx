import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import usePhasePermissions from 'api/phase_permissions/usePhasePermissions';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import UserFieldsInFormNotice from 'containers/Admin/projects/_shared/components/UserFieldsInFormNotice';
import DemographicsCard from 'containers/Admin/projects/project/backofficeRedesign/Phase/BuildPanel/BuildFields/MethodSection/DemographicsCard';

import { useParams } from 'utils/router';

const SurveyDemographics = () => {
  const redesign = useProjectBackofficeRedesign();
  const { projectId, phaseId } = useParams({ strict: false });
  const { data: permissions } = usePhasePermissions({ phaseId });

  if (!redesign) return <UserFieldsInFormNotice />;
  if (!projectId || !phaseId) return null;

  // Only when the questions are part of the form: asked before participation,
  // they are set in the phase's access settings instead.
  const posting = permissions?.data.find(
    ({ attributes }) => attributes.action === 'posting_idea'
  );
  if (!posting?.attributes.user_fields_in_form_descriptor.value) return null;

  return (
    <Box my="24px">
      <DemographicsCard projectId={projectId} phaseId={phaseId} surveyForm />
    </Box>
  );
};

export default SurveyDemographics;
