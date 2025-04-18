import React from 'react';

import { useParams } from 'react-router-dom';

import useFormCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import FormBuilder from 'components/FormBuilder/edit';

import { communityMonitorConfig } from './utils';
import UserFieldsInFormNotice from 'containers/Admin/projects/project/nativeSurvey/UserFieldsInFormNotice';

const CommunityMonitorSurveyFormBuilder = () => {
  const { phaseId, projectId } = useParams() as {
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
    <>
      <FormBuilder
        builderConfig={{
          ...communityMonitorConfig,
          formCustomFields,
          goBackUrl: `/admin/community-monitor/settings`,
          getUserFieldsNotice: () => {
            return phase.data.attributes.user_fields_in_form ? (
              <UserFieldsInFormNotice
                projectId={projectId}
                phaseId={phase.data.id}
                communityMonitor={true}
              />
            ) : null;
          },
        }}
        viewFormLink={`/projects/${project.data.attributes.slug}/surveys/new?phase_id=${phase.data.id}`}
      />
    </>
  );
};

export default CommunityMonitorSurveyFormBuilder;
