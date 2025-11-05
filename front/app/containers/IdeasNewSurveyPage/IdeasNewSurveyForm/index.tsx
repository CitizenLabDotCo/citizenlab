import React, { Suspense, useState, useEffect } from 'react';

import {
  Box,
  colors,
  useBreakpoint,
  useWindowSize,
} from '@citizenlab/cl2-component-library';

import { IPhases, IPhaseData } from 'api/phases/types';
import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import { IProject } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { FORM_PAGE_CHANGE_EVENT } from 'components/CustomFieldsForm/PageControlButtons/events';

import { getMethodConfig } from 'utils/configs/participationMethodConfig';
import eventEmitter from 'utils/eventEmitter';

import IdeasNewSurveyMeta from '../IdeasNewSurveyMeta';

import SurveyHeading from './SurveyHeading';
import { calculateDynamicHeight } from './utils';

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
  const isSmallerThanPhone = useBreakpoint('phone');

  const { data: phases } = usePhases(project.data.id);
  const { data: phaseFromUrl } = usePhase(phaseId);

  const [usingMapView, setUsingMapView] = useState(false);

  const participationMethodConfig = getConfig(phaseFromUrl?.data, phases);
  const phase = phaseFromUrl
    ? phaseFromUrl.data
    : getCurrentPhase(phases?.data);

  // Used only to rerender the component when window is resized to recalculate the form's height https://stackoverflow.com/a/38641993
  useWindowSize();

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

  const maxWidth = usingMapView ? '1100px' : '700px';
  return (
    <>
      <main id="e2e-idea-new-page">
        <IdeasNewSurveyMeta
          project={project}
          surveyTitle={localize(phase.attributes.native_survey_title_multiloc)}
        />
        <Box
          w="100%"
          bgColor={colors.grey100}
          h="100vh"
          position="fixed"
          zIndex="1010"
        >
          <Box
            mx="auto"
            position="relative"
            top={isSmallerThanPhone ? '0' : '40px'}
            maxWidth={usingMapView ? '1100px' : '700px'}
          >
            <SurveyHeading
              titleText={localize(
                phase.attributes.native_survey_title_multiloc
              )}
              phaseId={phaseId}
            />
          </Box>
          <Box
            display="flex"
            justifyContent="center"
            pt={isSmallerThanPhone ? '0' : '40px'}
            w="100%"
          >
            <Box
              background={colors.white}
              maxWidth={maxWidth}
              w="100%"
              h={calculateDynamicHeight(isSmallerThanPhone)}
              pb={isSmallerThanPhone ? '0' : '80px'}
              display="flex"
            >
              <Suspense>
                <SurveyForm
                  projectId={project.data.id}
                  phaseId={phaseId}
                  participationMethod={'native_survey'}
                />
              </Suspense>
            </Box>
          </Box>
        </Box>
      </main>
    </>
  );
};

export default IdeasNewSurveyForm;
