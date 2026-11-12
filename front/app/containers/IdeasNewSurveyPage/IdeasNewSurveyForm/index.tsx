import React, { Suspense, useState, useEffect } from 'react';

import {
  Box,
  colors,
  useBreakpoint,
  useWindowSize,
} from '@citizenlab/cl2-component-library';

import usePhase from 'api/phases/usePhase';
import { IProject } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { FORM_PAGE_CHANGE_EVENT } from 'components/CustomFieldsForm/PageControlButtons/events';

import eventEmitter from 'utils/eventEmitter';

import IdeasNewSurveyMeta from '../IdeasNewSurveyMeta';

import SurveyHeading from './SurveyHeading';
import { calculateDynamicHeight } from './utils';

const SurveyForm = React.lazy(
  () => import('components/CustomFieldsForm/SurveyForm')
);

interface Props {
  project: IProject;
  phaseId: string;
}

const IdeasNewSurveyForm = ({ project, phaseId }: Props) => {
  const localize = useLocalize();
  const isSmallerThanPhone = useBreakpoint('phone');

  const { data: phaseData } = usePhase(phaseId);

  const [usingMapView, setUsingMapView] = useState(false);

  const phase = phaseData?.data;

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

  if (!phase) {
    return null;
  }

  const maxWidth = usingMapView ? '1100px' : '700px';
  return (
    <>
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
          as="header"
          mx="auto"
          position="relative"
          top={isSmallerThanPhone ? '0' : '40px'}
          maxWidth={usingMapView ? '1100px' : '700px'}
        >
          <SurveyHeading
            titleText={localize(phase.attributes.native_survey_title_multiloc)}
            phaseId={phaseId}
          />
        </Box>
        <Box
          as="main"
          id="e2e-idea-new-page"
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
    </>
  );
};

export default IdeasNewSurveyForm;
