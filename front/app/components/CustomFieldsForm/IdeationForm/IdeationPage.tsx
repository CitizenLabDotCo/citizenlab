import React, { useState, useRef } from 'react';

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
import ProfileVisiblity from 'containers/IdeasNewPage/IdeasNewIdeationForm/ProfileVisibility';

import AnonymousParticipationConfirmationModal from 'components/AnonymousParticipationConfirmationModal';
import ContentUploadDisclaimer from 'components/ContentUploadDisclaimer';
import SubmissionReference from 'components/CustomFieldsForm/SubmissionReference';
import Feedback from 'components/HookForm/Feedback';

import clHistory from 'utils/cl-router/history';
import { handleHookFormSubmissionError } from 'utils/errorUtils';
import { isPage } from 'utils/helperUtils';
import { isAdmin } from 'utils/permissions/roles';
import { canModerateProject } from 'utils/permissions/rules/projectPermissions';

import CustomFields from '../CustomFields';
import AuthorField from '../Fields/AuthorField';
import BudgetField from '../Fields/BudgetField';
import PageEsriDivider from '../Map/PageEsriDivider';
import PageEsriMap from '../Map/PageEsriMap';
import useEsriMapPage from '../Map/useEsriMapPage';
import PageFooter from '../Page/PageFooter';
import PageTitle from '../Page/PageTitle';
import { FormValues } from '../Page/types';
import usePageForm from '../Page/usePageForm';
import PostParticipationBox from '../PostParticipationBox';
import { getFormCompletionPercentage } from '../util';

const StyledForm = styled.form`
  height: 100%;
`;

type CustomFieldsPage = {
  page: IFlatCustomField;
  pageQuestions: IFlatCustomField[];
  currentPageIndex: number;
  setCurrentPageIndex: React.Dispatch<React.SetStateAction<number>>;
  lastPageIndex: number;
  showTogglePostAnonymously?: boolean;
  participationMethod?: ParticipationMethod;
  ideaId?: string;
  projectId: string;
  onSubmit: (formValues: FormValues) => Promise<void>;
  phase?: IPhaseData;
  defaultValues?: FormValues;
  pages: {
    page: IFlatCustomField;
    pageQuestions: IFlatCustomField[];
  }[];
};

const IdeationPage = ({
  page,
  pageQuestions,
  lastPageIndex,
  showTogglePostAnonymously,
  participationMethod,
  ideaId: initialIdeaId,
  projectId,
  onSubmit,
  currentPageIndex,
  setCurrentPageIndex,
  phase,
  defaultValues,
  pages,
}: CustomFieldsPage) => {
  const pageRef = useRef<HTMLDivElement>(null);

  const [isDisclaimerOpened, setIsDisclaimerOpened] = useState(false);
  const { data: authUser } = useAuthUser();
  const { data: phases } = usePhases(projectId);
  const { data: project } = useProjectById(projectId);

  const localize = useLocalize();

  const { pathname } = useLocation();
  const isAdminPage = isPage('admin', pathname);
  const isIdeaEditPage = isPage('idea_edit', pathname);
  const isMapPage = page.page_layout === 'map';
  const isMobileOrSmaller = useBreakpoint('phone');

  const [searchParams] = useSearch({ strict: false });
  const ideaId = (initialIdeaId || searchParams.get('idea_id')) ?? undefined;
  const { data: idea } = useIdeaById(ideaId);
  const [showAnonymousConfirmationModal, setShowAnonymousConfirmationModal] =
    useState(false);
  const [postAnonymously, setPostAnonymously] = useState(
    idea?.data.attributes.anonymous || false
  );

  // allow moderators also to edit BudgetField
  const isAdminOrModerator =
    isAdmin(authUser) ||
    (project && canModerateProject(project.data, authUser));

  const handleNextAndsubmit = () => {
    pageRef.current?.scrollTo(0, 0);
    if (currentPageIndex === lastPageIndex) {
      const phaseId = searchParams.get('phase_id');
      const userCanModerate = project
        ? canModerateProject(project.data, authUser)
        : false;

      const shouldGoToIdeaFeed =
        participationMethod === 'ideation' &&
        phase?.attributes.presentation_mode === 'feed';

      const shouldGoToInputManager =
        userCanModerate && participationMethod === 'common_ground';

      const path = shouldGoToIdeaFeed
        ? `/projects/${project?.data.attributes.slug}/ideas-feed?phase_id=${phaseId}&initial_idea_id=${idea?.data.id}&idea_id=${idea?.data.id}`
        : shouldGoToInputManager
        ? `/admin/projects/${project?.data.id}/phases/${phase?.id}/ideas`
        : `/ideas/${idea?.data.attributes.slug}`;

      clHistory.push({ pathname: path });
    }
    methods.handleSubmit((e) => onFormSubmit(e))();
  };

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

  const onFormSubmit = async (
    formValues: FormValues,
    isDisclaimerAccepted?: boolean
  ) => {
    // Copyright disclaimer is needed if the user is uploading files or images
    const disclaimerNeeded = !!(
      formValues.idea_files_attributes?.length ||
      formValues.idea_images_attributes?.length ||
      (formValues.body_multiloc &&
        Object.values(formValues.body_multiloc).some((value) =>
          value.includes('<img')
        ))
    );

    if (currentPageIndex === lastPageIndex - 1) {
      if (disclaimerNeeded && !isDisclaimerAccepted) {
        setIsDisclaimerOpened(true);
        return;
      }
    }

    try {
      setShowFormFeedback(false);
      await onSubmit(formValues);
    } catch (error) {
      // Only show feedback if the form submission failed
      // otherwise we rely on the field validation errors
      setShowFormFeedback(true);
      handleHookFormSubmissionError(error, methods.setError);
    }
  };

  const handleOnChangeAnonymousPosting = () => {
    if (!postAnonymously) {
      setShowAnonymousConfirmationModal(true);
    }

    setPostAnonymously((postAnonymously) => !postAnonymously);
    methods.setValue('anonymous', !postAnonymously);
  };

  // If the idea has no author relationship,
  // it was either created through 'anyone' permissions or with
  // the anonymous toggle on. In these cases, we show the idea id
  // on the success page.
  const showIdeaId = idea ? !idea.data.relationships.author?.data : false;

  const formCompletionPercentage = getFormCompletionPercentage({
    pageQuestions,
    currentPageIndex,
    lastPageIndex,
    formValues: methods.getValues(),
    userIsEditing: isIdeaEditPage,
  });

  const onAcceptDisclaimer = async () => {
    setIsDisclaimerOpened(false);
    return await methods.handleSubmit((e) => onFormSubmit(e, true))();
  };

  const onCancelDisclaimer = () => {
    setIsDisclaimerOpened(false);
  };

  const isLastPage = currentPageIndex === lastPageIndex;

  const showSubmissionReference = isLastPage && idea && showIdeaId;
  const showPostParticipationSignup = !!(isLastPage && idea && !authUser);

  return (
    <FormProvider {...methods}>
      <StyledForm id="idea-form">
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
                <Box p="24px" w="100%">
                  <Box display="flex" flexDirection="column">
                    <PageTitle page={page} />

                    {currentPageIndex === 0 && isAdmin(authUser) && (
                      <Box mb="24px">
                        <AuthorField name="author_id" />
                      </Box>
                    )}
                    {currentPageIndex === lastPageIndex - 1 &&
                      isAdminOrModerator &&
                      phase?.attributes.voting_method === 'budgeting' && (
                        <Box mb="24px">
                          <BudgetField name="budget" />
                        </Box>
                      )}
                    <CustomFields
                      questions={pageQuestions}
                      projectId={projectId}
                      ideaId={ideaId}
                      phase={phase}
                      participationMethod={participationMethod}
                    />

                    {currentPageIndex === lastPageIndex - 1 &&
                      showTogglePostAnonymously &&
                      !isIdeaEditPage && (
                        <ProfileVisiblity
                          postAnonymously={postAnonymously}
                          onChange={handleOnChangeAnonymousPosting}
                        />
                      )}
                    {showPostParticipationSignup && project && (
                      <PostParticipationBox
                        onCreateAccount={() => {
                          triggerPostParticipationFlow({
                            name: 'followProjectAndRedirect',
                            params: {
                              projectId: project.data.id,
                              path: `/ideas/${idea.data.attributes.slug}`,
                            },
                          });
                        }}
                      />
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
          {showAnonymousConfirmationModal && (
            <AnonymousParticipationConfirmationModal
              onCloseModal={() => {
                setShowAnonymousConfirmationModal(false);
              }}
            />
          )}
          <PageFooter
            variant={
              currentPageIndex === lastPageIndex
                ? 'after-submission'
                : currentPageIndex === lastPageIndex - 1
                ? 'submission'
                : 'other'
            }
            hasPreviousPage={currentPageIndex > 0}
            handleNextAndSubmit={handleNextAndsubmit}
            handlePrevious={() => {
              pageRef.current?.scrollTo(0, 0);
              setCurrentPageIndex(currentPageIndex - 1);
            }}
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
        <ContentUploadDisclaimer
          isDisclaimerOpened={isDisclaimerOpened}
          onAcceptDisclaimer={onAcceptDisclaimer}
          onCancelDisclaimer={onCancelDisclaimer}
        />
      </StyledForm>
    </FormProvider>
  );
};

export default IdeationPage;
