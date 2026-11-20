import React, { useRef, useEffect, useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { FormProvider } from 'react-hook-form';
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
import { useSearch } from 'utils/router';

import CustomFields from '../CustomFields';
import useEsriMapPage from '../Map/useEsriMapPage';
import { FORM_QUESTION_SPACING } from '../Page/FormPageLayout';
import PageTitle from '../Page/PageTitle';
import { PageDirection } from '../Page/PageTransition';
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
import SurveyPageLayout from './SurveyPageLayout';

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
    pageValues,
    isSubmitPage,
  }: {
    // Validated by the yup resolver, which casts values to the types the API
    // expects (a number input hands React Hook Form a string).
    formValues: FormValues;
    // The same answers before validation. The resolver drops keys whose value
    // is undefined, so a cleared answer is missing from formValues and the
    // parent would carry the previous one forward. Here it is still present.
    pageValues: FormValues;
    isSubmitPage: boolean;
  }) => Promise<void>;
  // Called when this page unmounts via the Previous button so the parent can
  // accumulate the user's in-progress answers. Forward navigation goes through
  // onSubmit and doesn't need this callback.
  onCapturePageValues?: (values: FormValues) => void;
  phase?: IPhaseData;
  defaultValues?: FormValues;
  // Which side the page slides in from.
  enterDirection?: PageDirection;
  // The progress card is shown by the parent, so it stays put across pages;
  // this page reports how far along the participant is.
  onProgressChange: (formCompletionPercentage: number) => void;
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
  onCapturePageValues,
  currentPageIndex,
  setCurrentPageIndex,
  userNavigationHistory,
  setUserNavigationHistory,
  phase,
  defaultValues,
  enterDirection = 'forward',
  onProgressChange,
}: SurveyPage) => {
  const pageRef = useRef<HTMLDivElement>(null);

  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);

  const localize = useLocalize();
  const isMapPage = page.page_layout === 'map';
  const { data: authUser } = useAuthUser();

  const searchParams = useSearch({ strict: false });
  const ideaId = (initialIdeaId || searchParams.idea_id) ?? undefined;
  const { data: idea } = useIdeaById(ideaId);

  const { methods, setShowFormFeedback, showFormFeedback } = usePageForm({
    pageQuestions,
    defaultValues,
  });

  // Map logic
  const { mapConfig, mapLayers } = useEsriMapPage({
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
        pageValues: methods.getValues(),
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

  // Follows the answers on this page as they're given.
  useEffect(() => {
    const report = (formValues: FormValues) =>
      onProgressChange(
        getFormCompletionPercentage({
          pageQuestions,
          currentPageIndex,
          lastPageIndex,
          formValues,
          userIsEditing: false,
        })
      );
    report(methods.getValues());
    const subscription = methods.watch((formValues) => report(formValues));
    return () => subscription.unsubscribe();
  }, [
    methods,
    pageQuestions,
    currentPageIndex,
    lastPageIndex,
    onProgressChange,
  ]);

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
    // A dropdown's search box is a text input too, but Enter there belongs to
    // the dropdown, whether or not it has an option to pick.
    if (target.getAttribute('role') === 'combobox') {
      e.preventDefault();
      return;
    }
    if (target.tagName.toLowerCase() !== 'input') return;
    const inputType = target.type;
    if (inputType !== 'text' && inputType !== 'number') return;
    e.preventDefault();
    handleEnterKeySubmit();
  };

  const handlePrevious = () => {
    pageRef.current?.scrollTo(0, 0);
    setShowSubmitConfirmation(false);
    // Persist whatever the user has entered on this page so it survives the
    // remount that the page transition triggers.
    onCapturePageValues?.(methods.getValues());
    // Remove the current page from navigation history when going back
    setUserNavigationHistory((history) => history.slice(0, -1));
    setCurrentPageIndex(previousPageNumber);
  };

  const isLastPage = currentPageIndex === lastPageIndex;

  const showSubmissionReference = isLastPage && idea && showIdeaId;
  const showPostParticipationSignup = !!(isLastPage && idea && !authUser);

  const footerVariant =
    currentPageIndex === lastPageIndex
      ? 'after-submission'
      : nextPageNumber === lastPageIndex
      ? 'submission'
      : 'other';

  return (
    <FormProvider {...methods}>
      <StyledForm id="idea-form" onKeyDown={handleFormKeyDown}>
        <SurveyPageLayout
          currentPageIndex={currentPageIndex}
          map={isMapPage ? { mapConfig, mapLayers } : undefined}
          showPreviousButton={currentPageIndex > 0 && !isLastPage}
          controls={{
            variant: footerVariant,
            hasPreviousPage: currentPageIndex > 0,
            handleNextAndSubmit,
            handlePrevious,
            isLoading: methods.formState.isSubmitting,
            phase,
            phases,
            project,
            pageButtonLabelMultiloc: page.page_button_label_multiloc,
            pageButtonLink: page.page_button_link,
            pageQuestions,
          }}
          feedback={showFormFeedback && <Feedback />}
          header={
            <>
              <PageTitle page={page} />
              {page.key === 'user_page' && <CustomFieldsSignupHelperText />}
            </>
          }
          questions={
            <CustomFields
              questions={pageQuestions}
              projectId={projectId}
              ideaId={ideaId}
              phase={phase}
              participationMethod={participationMethod}
              questionSpacing={FORM_QUESTION_SPACING}
            />
          }
          afterQuestions={
            <>
              {showPostParticipationSignup && project && (
                <Box mb="24px">
                  <PostParticipationBox
                    onCreateAccount={() => {
                      triggerPostParticipationFlow({
                        name: 'followProjectAndRedirect',
                        params: {
                          projectId: project.data.id,
                          // The community monitor project isn't meant to be
                          // browsed by residents, so send them home instead.
                          path:
                            phase?.attributes.participation_method ===
                            'community_monitor_survey'
                              ? '/'
                              : `/projects/${project.data.attributes.slug}`,
                        },
                      });
                    }}
                  />
                </Box>
              )}
              {showSubmissionReference && (
                <SubmissionReference
                  inputId={idea.data.id}
                  postParticipationSignUpVisible={showPostParticipationSignup}
                />
              )}
            </>
          }
          submitConfirmation={
            showSubmitConfirmation && (
              <SubmitConfirmation
                onContinueEditing={handleContinueEditing}
                onConfirmSubmit={handleNextAndSubmit}
              />
            )
          }
          pageRef={pageRef}
          enterDirection={enterDirection}
        />
      </StyledForm>
    </FormProvider>
  );
};

export default SurveyPage;
