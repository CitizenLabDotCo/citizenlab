import React, { Suspense, useState, useEffect } from 'react';

import { IPhases, IPhaseData } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import { IProject } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import FormPageLayout from 'components/CustomFieldsForm/Page/FormPageLayout';
import { FORM_PAGE_CHANGE_EVENT } from 'components/CustomFieldsForm/PageControlButtons/events';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import eventEmitter from 'utils/eventEmitter';

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

  const [usingMapView, setUsingMapView] = useState(false);

  const participationMethodConfig = getConfig(phaseFromUrl?.data, phases);
  const phase = phaseFromUrl
    ? phaseFromUrl.data
    : getCurrentPhase(phases?.data);

  // Listen for survey page change event
  useEffect(() => {
    const subscription = eventEmitter
      .observeEvent(FORM_PAGE_CHANGE_EVENT)
      .subscribe(() => {
        setUsingMapView(!!document.getElementById('map_page'));
      });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (!participationMethodConfig || !phaseId) {
    return null;
  }

  if (!phase) {
    return null;
  }

  return (
    <>
      <IdeasNewSurveyMeta
        project={project}
        surveyTitle={localize(phase.attributes.native_survey_title_multiloc)}
      />
      <FormPageLayout
        usingMapView={usingMapView}
        mainId="e2e-idea-new-page"
        heading={
          <SurveyHeading
            titleText={localize(phase.attributes.native_survey_title_multiloc)}
            phaseId={phaseId}
            bordered={usingMapView}
          />
        }
      >
        <Suspense>
          <SurveyForm
            projectId={project.data.id}
            phaseId={phaseId}
            participationMethod={'native_survey'}
          />
        </Suspense>
      </FormPageLayout>
    </>
  );
};

export default IdeasNewSurveyForm;
