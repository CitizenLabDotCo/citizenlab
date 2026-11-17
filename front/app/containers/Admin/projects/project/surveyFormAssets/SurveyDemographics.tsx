import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import UserFieldsInFormNotice from 'containers/Admin/projects/_shared/components/UserFieldsInFormNotice';
import DemographicsCard from 'containers/Admin/projects/project/backofficeRedesign/Phase/BuildPanel/BuildFields/MethodSection/DemographicsCard';

import { useParams } from 'utils/router';

const SurveyDemographics = () => {
  const redesign = useProjectBackofficeRedesign();
  const { projectId, phaseId } = useParams({ strict: false });

  if (!redesign) return <UserFieldsInFormNotice />;
  if (!projectId || !phaseId) return null;

  return (
    <Box my="24px">
      <DemographicsCard projectId={projectId} phaseId={phaseId} surveyForm />
    </Box>
  );
};

export default SurveyDemographics;
