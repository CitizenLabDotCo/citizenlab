import React from 'react';

import useFormCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import FormBuilder from 'components/FormBuilder/edit';

import { useParams } from 'utils/router';

import { communityMonitorConfig } from './utils';

const CommunityMonitorSurveyFormBuilder = () => {
  const { phaseId, projectId } = useParams({ strict: false }) as {
    projectId: string;
    phaseId: string;
  };

  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
    phaseId,
    copy: false,
  });

  if (!phase || !project || !formCustomFields) return null;

  return (
    <FormBuilder
      builderConfig={{
        ...communityMonitorConfig,
        formCustomFields,
        goBackUrl: `/admin/community-monitor/settings`,
      }}
      viewFormLink={{
        to: '/projects/$slug/surveys/new',
        params: { slug: project.data.attributes.slug },
        search: { phase_id: phase.data.id },
      }}
    />
  );
};

export default CommunityMonitorSurveyFormBuilder;
