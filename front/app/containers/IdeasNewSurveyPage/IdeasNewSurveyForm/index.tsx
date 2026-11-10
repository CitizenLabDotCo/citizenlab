import React, { Suspense } from 'react';

import { IPhases, IPhaseData } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import { IProject } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import FormPageLayout from 'components/CustomFieldsForm/Page/FormPageLayout';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import IdeasNewSurveyMeta from '../IdeasNewSurveyMeta';

import SurveyHeading from './SurveyHeading';

const SurveyForm = React.lazy(
  () => import('components/CustomFieldsForm/SurveyForm')
);

const getConfig = (
  phaseFromUrl: IPhaseData | undefined,
  phases: IPhases | undefined
) => {
  const participationMethod = phaseFromUrl
    ? phaseFromUrl.attributes.participation_method
    : getCurrentPhase(phases?.data)?.attributes.participation_method;

  if (!participationMethod) return;
  return getMethodConfig(participationMethod);
};

interface Props {
  project: IProject;
  phaseId: string | undefined;
}

const IdeasNewSurveyForm = ({ project, phaseId }: Props) => {
  const localize = useLocalize();

  const { data: phases } = usePhases(project.data.id);
  const { data: phaseFromUrl } = usePhase(phaseId);

  const participationMethodConfig = getConfig(phaseFromUrl?.data, phases);
  const phase = phaseFromUrl
    ? phaseFromUrl.data
    : getCurrentPhase(phases?.data);

  if (!participationMethodConfig || !phaseId) {
    return null;
  }

  if (!phase) {
    return null;
  }

  const heading = (
    <SurveyHeading
      titleText={localize(phase.attributes.native_survey_title_multiloc)}
      phaseId={phaseId}
      bordered={false}
    />
  );

  return (
    <>
      <IdeasNewSurveyMeta
        project={project}
        surveyTitle={localize(phase.attributes.native_survey_title_multiloc)}
      />
      <Suspense
        // The page frame, until the form (which renders its own) is loaded.
        fallback={
          <FormPageLayout
            usingMapView={false}
            mainId="e2e-idea-new-page"
            heading={heading}
          >
            {null}
          </FormPageLayout>
        }
      >
        <SurveyForm
          projectId={project.data.id}
          phaseId={phaseId}
          participationMethod={'native_survey'}
          mainId="e2e-idea-new-page"
          heading={heading}
        />
      </Suspense>
    </>
  );
};

export default IdeasNewSurveyForm;
