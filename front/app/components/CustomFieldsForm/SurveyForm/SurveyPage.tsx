import React, { useRef } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { FormProvider } from 'react-hook-form';
import { useLocation, useSearchParams } from 'react-router-dom';
import styled from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';
import useIdeaById from 'api/ideas/useIdeaById';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import SubmissionReference from 'components/Form/Components/Layouts/SubmissionReference';
import Feedback from 'components/HookForm/Feedback';
import Warning from 'components/UI/Warning';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isPage } from 'utils/helperUtils';

import CustomFields from '../CustomFields';
import PageEsriDivider from '../Map/PageEsriDivider';
import PageEsriMap from '../Map/PageEsriMap';
import useEsriMapPage from '../Map/useEsriMapPage';
import messages from '../messages';
import PageFooter from '../Page/PageFooter';
import PageTitle from '../Page/PageTitle';
import { FormValues } from '../Page/types';
import usePageForm from '../Page/usePageForm';
import { getFormCompletionPercentage, Pages } from '../util';

import { determineNextPageNumber, determinePreviousPageNumber } from './logic';

const StyledForm = styled.form`
  height: 100%;
`;

type SurveyPage = {
  page: IFlatCustomField;
  pages: Pages;
  pageQuestions: IFlatCustomField[];
  currentPageNumber: number;
  setCurrentPageNumber: React.Dispatch<React.SetStateAction<number>>;
  lastPageNumber: number;
  participationMethod?: ParticipationMethod;
  ideaId?: string;
  projectId: string;
  onSubmit: ({
    formValues,
    isSubmitPage,
  }: {
    formValues: FormValues;
    isSubmitPage: boolean;
  }) => Promise<void>;
  phase?: IPhaseData;
  defaultValues?: FormValues;
  customFields: IFlatCustomField[];
};

const SurveyPage = ({
  page,
  pages,
  pageQuestions,
  lastPageNumber,
  participationMethod,
  ideaId: initialIdeaId,
  projectId,
  onSubmit,
  currentPageNumber,
  setCurrentPageNumber,
  phase,
  defaultValues,
  customFields,
}: SurveyPage) => {
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);

  const localize = useLocalize();
  const { formatMessage } = useIntl();
  const { pathname } = useLocation();
  const isAdminPage = isPage('admin', pathname);
  const isMapPage = page.page_layout === 'map';
  const isMobileOrSmaller = useBreakpoint('phone');

  const [searchParams] = useSearchParams();
  const ideaId = (initialIdeaId || searchParams.get('idea_id')) ?? undefined;
  const { data: idea } = useIdeaById(ideaId);

  const { methods, setShowFormFeedback, showFormFeedback } = usePageForm({
    pageQuestions,
    defaultValues,
  });

  // Map logic
  const shouldShowMap = !isAdminPage && isMapPage;
  const { mapConfig, mapLayers, draggableDivRef, dragDividerRef } =
    useEsriMapPage({
      project,
      pages,
      currentPageNumber,
      localize,
    });

  const previousPageNumber = determinePreviousPageNumber({
    pages,
    currentPage: page,
    formData: methods.watch(),
  });

  const nextPageNumber = determineNextPageNumber({
    pages,
    currentPage: page,
    formData: methods.watch(),
  });

  const onFormSubmit = async (formValues: FormValues) => {
    // Go to the project page if this is the last page
    if (currentPageNumber === lastPageNumber) {
      clHistory.push({
        pathname: `/projects/${project?.data.attributes.slug}`,
      });
      return;
    }

    try {
      setShowFormFeedback(false);
      await onSubmit({
        formValues,
        isSubmitPage: nextPageNumber === lastPageNumber,
      });
      // Go to the next page
      if (currentPageNumber < lastPageNumber) {
        setCurrentPageNumber(nextPageNumber);
      }
    } catch (error) {
      // Only show feedback if the form submission failed
      // otherwise we rely on the field validation errors
      setShowFormFeedback(true);
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  // If the idea (survey submission) has no author relationship,
  // it was either created through 'anyone' permissions or with
  // the anonymous toggle on. In these cases, we show the idea id
  // on the success page.
  const showIdeaId = idea ? !idea.data.relationships.author?.data : false;

  const formCompletionPercentage = getFormCompletionPercentage({
    customFields,
    formValues: methods.getValues(),
    userIsEditing: false,
    userIsOnLastPage: currentPageNumber === lastPageNumber,
  });

  const handleNextAndSubmit = () => {
    pageRef.current?.scrollTo(0, 0);
    methods.handleSubmit((e) => onFormSubmit(e))();
  };

  const handlePrevious = () => {
    pageRef.current?.scrollTo(0, 0);
    setCurrentPageNumber(previousPageNumber);
  };

  const anonimizeSurveySubmissions =
    phase?.attributes.allow_anonymous_participation;

  return (
    <FormProvider {...methods}>
      <StyledForm id="idea-form">
        <Box
          id="container"
          display="flex"
          flexDirection={isMobileOrSmaller ? 'column' : 'row'}
          height="100%"
          w="100%"
          data-cy={`e2e-page-number-${currentPageNumber + 1}`}
        >
          {shouldShowMap && (
            <PageEsriMap
              currentPageNumber={currentPageNumber}
              mapConfig={mapConfig}
              mapLayers={mapLayers}
              draggableDivRef={draggableDivRef}
            />
          )}
          <Box
            flex={'1 1 auto'}
            h={shouldShowMap && isMobileOrSmaller ? '80%' : '100%'}
            position="relative"
            overflow="hidden"
            display="flex"
            flexDirection="column"
            justifyContent="space-between"
          >
            <Box
              display="flex"
              flexDirection="column"
              height="100%"
              overflowY="auto"
              overflowX="hidden"
              ref={pageRef}
            >
              {showFormFeedback && <Feedback />}

              {shouldShowMap && isMobileOrSmaller && (
                <PageEsriDivider dragDividerRef={dragDividerRef} />
              )}
              <Box
                h="100%"
                display="flex"
                flexDirection="column"
                mt={shouldShowMap && isMobileOrSmaller ? '20px' : undefined}
                mb="40px"
              >
                <Box h="100%" display="flex" flexDirection="column">
                  <Box p="24px" w="100%">
                    <Box display="flex" flexDirection="column">
                      {anonimizeSurveySubmissions && (
                        <Box w="100%" mb="12px">
                          <Warning icon="shield-checkered">
                            {formatMessage(messages.anonymousSurveyMessage)}
                          </Warning>
                        </Box>
                      )}

                      <PageTitle page={page} />

                      <CustomFields
                        questions={pageQuestions}
                        projectId={projectId}
                        ideaId={ideaId}
                        phase={phase}
                        participationMethod={participationMethod}
                      />
                      {currentPageNumber === lastPageNumber &&
                        idea &&
                        showIdeaId && (
                          <SubmissionReference
                            inputId={idea.data.id}
                            participationMethod={participationMethod}
                          />
                        )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
          <PageFooter
            variant={
              currentPageNumber === lastPageNumber
                ? 'after-submission'
                : nextPageNumber === lastPageNumber
                ? 'submission'
                : 'other'
            }
            hasPreviousPage={currentPageNumber > 0}
            handleNextAndSubmit={handleNextAndSubmit}
            handlePrevious={handlePrevious}
            formCompletionPercentage={formCompletionPercentage}
            pageButtonLabelMultiloc={page.page_button_label_multiloc}
            pageButtonLink={page.page_button_link}
            phase={phase}
            project={project}
            phases={phases}
            isLoading={methods.formState.isSubmitting}
            isAdminPage={isAdminPage}
            isMapPage={isMapPage}
          />
        </Box>
      </StyledForm>
    </FormProvider>
  );
};

export default SurveyPage;
