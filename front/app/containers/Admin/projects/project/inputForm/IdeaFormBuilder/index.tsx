import React from 'react';

import { useParams } from 'react-router-dom';
import { RouteType } from 'routes';

import useFormCustomFields from 'api/custom_fields/useCustomFields';
import usePhase from 'api/phases/usePhase';
import useProjectById from 'api/projects/useProjectById';

import FormBuilder from 'components/FormBuilder/edit';
import { FormBuilderConfig } from 'components/FormBuilder/utils';

import { ideationConfig, proposalsConfig } from '../utils';

const configs: {
  [key in 'ideation' | 'voting' | 'proposals']: FormBuilderConfig;
} = {
  ideation: ideationConfig,
  voting: ideationConfig,
  proposals: proposalsConfig,
};

const IdeaFormBuilder = ({
  participationMethod,
  phaseId,
  projectId,
  projectSlug,
}: {
  // All participation methods that use "simpleFormEditor"
  // (see front/app/utils/configs/participationMethodConfig/index.tsx)
  participationMethod: 'ideation' | 'proposals' | 'voting';
  phaseId: string;
  projectId: string;
  projectSlug: string;
}) => {
  const config = configs[participationMethod];

  const { data: formCustomFields } = useFormCustomFields({
    projectId,
    phaseId: config.isFormPhaseSpecific ? phaseId : undefined,
  });

  const goBackUrl: RouteType = `/admin/projects/${projectId}/phases/${phaseId}/form`;

  return (
    <FormBuilder
      builderConfig={{
        ...config,
        formCustomFields,
        goBackUrl,
      }}
      viewFormLink={`/projects/${projectSlug}/ideas/new?phase_id=${phaseId}`}
    />
  );
};

export default () => {
  const { projectId, phaseId } = useParams();
  const { data: project } = useProjectById(projectId);
  const { data: phase } = usePhase(phaseId);

  if (!projectId || !phaseId || !project || !phase) return null;

  const participationMethod = phase.data.attributes.participation_method;

  // These checks are strictly not necessary since this component should only render
  // for one of these participation methods (all participation methods that use "simpleFormEditor";
  // see front/app/utils/configs/participationMethodConfig/index.tsx).
  // They're here for documenting purposes + they provide
  // better types inside IdeaFormBuilder for now.
  if (
    participationMethod === 'ideation' ||
    participationMethod === 'voting' ||
    participationMethod === 'proposals'
  ) {
    return (
      <IdeaFormBuilder
        participationMethod={participationMethod}
        phaseId={phaseId}
        projectId={projectId}
        projectSlug={project.data.attributes.slug}
      />
    );
  }

  return null;
};
