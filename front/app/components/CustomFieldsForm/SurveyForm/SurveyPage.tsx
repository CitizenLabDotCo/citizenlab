import React, { useRef, useEffect, useState } from 'react';

import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
import { FormProvider } from 'react-hook-form';
import { useLocation, useSearch } from 'utils/router';
import styled from 'styled-components';

import { IFlatCustomField } from 'api/custom_fields/types';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';
import { IPhaseData, ParticipationMethod } from 'api/phases/types';
import usePhases from 'api/phases/usePhases';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { triggerPostParticipationFlow } from 'containers/Authentication/events';

import CustomFieldsSignupHelperText from 'components/CustomFieldsForm/CustomFieldsSignupHelperText';
import SubmissionReference from 'components/CustomFieldsForm/SubmissionReference';
import Feedback from 'components/HookForm/Feedback';

import clHistory from 'utils/cl-router/history';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isPage } from 'utils/helperUtils';

import CustomFields from '../CustomFields';
import PageEsriDivider from '../Map/PageEsriDivider';
import PageEsriMap from '../Map/PageEsriMap';
import useEsriMapPage from '../Map/useEsriMapPage';
import PageFooter from '../Page/PageFooter';
import PageTitle from '../Page/PageTitle';
import { FormValues } from '../Page/types';
import usePageForm from '../Page/usePageForm';
import PostParticipationBox from '../PostParticipationBox';
import {
  getFormCompletionPercentage,
  hasUnansweredQuestions,
  isNillish,
  Pages,
  trackFormPageView,
} from '../util';

import {
  determineNextPageNumber,
  determinePreviousPageNumber,
  getSkippedPageIndices,
} from './logic';
import SubmitConfirmation from './SubmitConfirmation';

const StyledForm = styled.form`
  height: 100%;
`;

type SurveyPage = {
  page: IFlatCustomField;
  pages: Pages;
  pageQuestions: IFlatCustomField[];
  currentPageIndex: number;
  setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>;
  userNavigationHistory: number[];
  setUserNavigationHistory: React.Dispatch<React.SetStateAction<number[]>>;
  lastPageIndex: number;
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
};

const SurveyPage = ({
  page,
  pages,
  pageQuestions,
  lastPageIndex,
  participationMethod,
  ideaId: initialIdeaId,
  projectId,
  onSubmit,
  currentPageIndex,
  setCurrentPageIndex,
  userNavigationHistory,
  setUserNavigationHistory,
  phase,
  defaultValues,
}: SurveyPage) => {
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);

  const localize = useLocalize();
  const { pathname } = useLocation();
  const isAdminPage = isPage('admin', pathname);
  const isMapPage = page.page_layout === 'map';
  const isMobileOrSmaller = useBreakpoint('phone');
  const { data: authUser } = useAuthUser();

  const [searchParams] = useSearch({ strict: false });
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
      currentPageIndex,
      localize,
    });

  const previousPageNumber = determinePreviousPageNumber({
    userNavigationHistory,
    currentPageIndex,
  });

  const nextPageNumber = determineNextPageNumber({
    pages,
    currentPage: page,
    formData: methods.watch(),
  });

  const [showSubmitConfirmation, setShowSubmitConfirmation] = useState(false);
  const isSubmissionPage = nextPageNumber === lastPageIndex;

  useEffect(() => {
    trackFormPageView(currentPageIndex, lastPageIndex);
  }, [currentPageIndex, lastPageIndex]);

  // Reset confirmation when user changes form values
  useEffect(() => {
    if (!showSubmitConfirmation) return undefined;

    const subscription = methods.watch(() => {
      setShowSubmitConfirmation(false);
    });
    return () => subscription.unsubscribe();
  }, [showSubmitConfirmation, methods]);

  // Clear values from skipped pages when form data changes
  // This ensures that if a user changes an answer that affects conditional logic,
  // any previously filled values from now-skipped pages are removed
  useEffect(() => {
    const subscription = methods.watch((formData) => {
      const skippedPageIndices = getSkippedPageIndices({
        pages,
        formData,
      });

      // Clear all field values from skipped pages
      skippedPageIndices.forEach((skippedPageIndex) => {
        const skippedPage = pages[skippedPageIndex];
        skippedPage.pageQuestions.forEach((question) => {
          const currentValue = methods.getValues(question.key);
          // Only clear if there's actually a value to clear
          if (currentValue !== undefined && currentValue !== null) {
            methods.setValue(question.key, undefined, {
              shouldValidate: false,
              shouldDirty: false,
            });
          }
        });
      });
    });

    return () => subscription.unsubscribe();
  }, [methods, pages]);

  const onFormSubmit = async (formValues: FormValues) => {
    // Go to the project page if this is the last page.
    // Use replace to remove the survey URL from browser history,
    // preventing back/forward navigation back into a completed survey.
    if (currentPageIndex === lastPageIndex) {
      clHistory.replace({
        pathname: `/projects/${project?.data.attributes.slug}`,
      });
      return;
    }

    try {
      setShowFormFeedback(false);
      setShowSubmitConfirmation(false);
      await onSubmit({
        formValues,
        isSubmitPage: isSubmissionPage,
      });
      // Go to the next page
      if (currentPageIndex < lastPageIndex) {
        // Add the next page to navigation history
        setUserNavigationHistory((history) => [...history, nextPageNumber]);
        setCurrentPageIndex(nextPageNumber);
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
    pageQuestions,
    currentPageIndex,
    lastPageIndex,
    formValues: methods.getValues(),
    userIsEditing: false,
  });

  const handleNextAndSubmit = () => {
    pageRef.current?.scrollTo(0, 0);
    methods.handleSubmit((e) => onFormSubmit(e))();
  };

  const handleEnterKeySubmit = () => {
    pageRef.current?.scrollTo(0, 0);
    if (showSubmitConfirmation) setShowSubmitConfirmation(false);
    methods.handleSubmit((formValues) => {
      if (
        isSubmissionPage &&
        hasUnansweredQuestions(pageQuestions, formValues)
      ) {
        setShowSubmitConfirmation(true);
        return;
      }
      return onFormSubmit(formValues);
    })();
  };

  const handleContinueEditing = () => {
    setShowSubmitConfirmation(false);

    const formValues = methods.getValues();
    const firstUnanswered = pageQuestions.find((q) =>
      isNillish(formValues[q.key])
    );

    // Focus the user back to the first unanswered question on the page
    if (firstUnanswered) {
      const questionEl = document.querySelector(
        `[data-question-id="${firstUnanswered.id}"]`
      );
      if (questionEl) {
        const focusable = questionEl.querySelector<HTMLElement>(
          'input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        focusable?.focus();
        questionEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  };

  // Ensure that pressing Enter in a text or number input field does not
  // accidentally submit the form with empty responses
  const handleFormKeyDown = (e: React.KeyboardEvent<HTMLFormElement>) => {
    if (e.key !== 'Enter') return;
    const target = e.target as HTMLInputElement;
    if (target.tagName.toLowerCase() !== 'input') return;
    const inputType = target.type;
    if (inputType !== 'text' && inputType !== 'number') return;
    e.preventDefault();
    handleEnterKeySubmit();
  };

  const handlePrevious = () => {
    pageRef.current?.scrollTo(0, 0);
    setShowSubmitConfirmation(false);
    // Remove the current page from navigation history when going back
    setUserNavigationHistory((history) => history.slice(0, -1));
    setCurrentPageIndex(previousPageNumber);
  };

  const isLastPage = currentPageIndex === lastPageIndex;

  const showSubmissionReference = isLastPage && idea && showIdeaId;
  const showPostParticipationSignup = !!(isLastPage && idea && !authUser);

  return (
    <FormProvider {...methods}>
      <StyledForm id="idea-form" onKeyDown={handleFormKeyDown}>
        <Box
          id="container"
          display="flex"
          flexDirection={isMobileOrSmaller ? 'column' : 'row'}
          height="100%"
          w="100%"
          data-cy={`e2e-page-number-${currentPageIndex + 1}`}
        >
          {shouldShowMap && (
            <PageEsriMap
              currentPageIndex={currentPageIndex}
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
                      <PageTitle page={page} />

                      {page.key === 'user_page' && (
                        <CustomFieldsSignupHelperText />
                      )}

                      <CustomFields
                        questions={pageQuestions}
                        projectId={projectId}
                        ideaId={ideaId}
                        phase={phase}
                        participationMethod={participationMethod}
                      />
                      {showPostParticipationSignup && project && (
                        <Box mb="24px">
                          <PostParticipationBox
                            onCreateAccount={() => {
                              triggerPostParticipationFlow({
                                name: 'followProjectAndRedirect',
                                params: {
                                  projectId: project.data.id,
                                  path: `/projects/${project.data.attributes.slug}`,
                                },
                              });
                            }}
                          />
                        </Box>
                      )}
                      {showSubmissionReference && (
                        <SubmissionReference
                          inputId={idea.data.id}
                          postParticipationSignUpVisible={
                            showPostParticipationSignup
                          }
                        />
                      )}
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
            {showSubmitConfirmation && (
              <SubmitConfirmation
                onContinueEditing={handleContinueEditing}
                onConfirmSubmit={handleNextAndSubmit}
              />
            )}
          </Box>
          <PageFooter
            variant={
              currentPageIndex === lastPageIndex
                ? 'after-submission'
                : nextPageNumber === lastPageIndex
                ? 'submission'
                : 'other'
            }
            hasPreviousPage={currentPageIndex > 0}
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
            pageQuestions={pageQuestions}
            currentPageIndex={currentPageIndex}
          />
        </Box>
      </StyledForm>
    </FormProvider>
  );
};

export default SurveyPage;
