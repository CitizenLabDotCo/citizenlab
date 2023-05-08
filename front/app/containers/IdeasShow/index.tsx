import React, { lazy, Suspense, useState, useRef, useEffect } from 'react';
import { isString } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

import useInsightsCategories from 'modules/commercial/insights/api/categories/useCategories';
console.log(useInsightsCategories);

// services
import { getInputTerm } from 'services/participationContexts';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import IdeaSharingButton from './Buttons/IdeaSharingButton';
import IdeaMeta from './IdeaMeta';
import Title from 'components/PostShowComponents/Title';
import IdeaProposedBudget from './IdeaProposedBudget';
import Body from 'components/PostShowComponents/Body';
import Image from 'components/PostShowComponents/Image';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import Modal from 'components/UI/Modal';
import AssignBudgetControl from 'components/AssignBudgetControl';
import SharingModalContent from 'components/PostShowComponents/SharingModalContent';
import IdeaMoreActions from './IdeaMoreActions';
import { Box, Spinner } from '@citizenlab/cl2-component-library';
import GoBackButton from './GoBackButton';
const LazyComments = lazy(
  () => import('components/PostShowComponents/Comments')
);
import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';
import MetaInformation from './MetaInformation';
import MobileSharingButtonComponent from './Buttons/MobileSharingButtonComponent';
import RightColumnDesktop from './RightColumnDesktop';

// utils
import { isFieldEnabled } from 'utils/projectUtils';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetPermission, {
  GetPermissionChildProps,
} from 'resources/GetPermission';

// i18n
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import { getInputTermMessage } from 'utils/i18n';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// utils
import clHistory from 'utils/cl-router/history';

// style
import styled from 'styled-components';
import { media, viewportWidths, isRtl } from 'utils/styleUtils';
import { columnsGapDesktop, pageContentMaxWidth } from './styleConstants';
import Outlet from 'components/Outlet';
import useFeatureFlag from 'hooks/useFeatureFlag';

// hooks
import useLocale from 'hooks/useLocale';
import usePhases from 'hooks/usePhases';
import useIdeaById from 'api/ideas/useIdeaById';
import useIdeaJsonFormSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import { useSearchParams } from 'react-router-dom';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import useLocalize from 'hooks/useLocalize';

const contentFadeInDuration = 250;
const contentFadeInEasing = 'cubic-bezier(0.19, 1, 0.22, 1)';
const contentFadeInDelay = 150;

const Container = styled.main`
  width: 100%;
  max-width: ${pageContentMaxWidth}px;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin-left: auto;
  margin-right: auto;
  background: #fff;

  &.loading {
    flex: 1;
    justify-content: center;
  }

  &.isLoaded {
    opacity: 0;

    &.content-enter {
      opacity: 0;

      &.content-enter-active {
        opacity: 1;
        transition: opacity ${contentFadeInDuration}ms ${contentFadeInEasing}
          ${contentFadeInDelay}ms;
      }
    }

    &.content-enter-done {
      opacity: 1;
    }
  }
`;

const StyledRightColumnDesktop = styled(RightColumnDesktop)`
  margin-left: ${columnsGapDesktop}px;
`;

const IdeaHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: -5px;
  margin-bottom: 25px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  ${media.tablet`
    margin-top: 0px;
  `}
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const BodySectionTitle = styled.h2`
  font-size: ${(props) => props.theme.fontSizes.l}px;
  font-weight: 500;
  line-height: 28px;
  padding: 0;
  margin: 0;
  margin-bottom: 15px;
`;

interface DataProps {
  project: GetProjectChildProps;
  windowSize: GetWindowSizeChildProps;
  postOfficialFeedbackPermission: GetPermissionChildProps;
}

interface InputProps {
  ideaId: string;
  projectId: string;
  insideModal: boolean;
  setRef?: (element: HTMLDivElement) => void;
  compact?: boolean;
  className?: string;
}

interface Props extends DataProps, InputProps {}

export const IdeasShow = ({
  windowSize,
  className,
  postOfficialFeedbackPermission,
  projectId,
  insideModal,
  project,
  compact,
  ideaId,
  setRef,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: ideaImages } = useIdeaImages(ideaId);

  const [newIdeaId, setNewIdeaId] = useState<string | null>(null);
  const [translateButtonIsClicked, setTranslateButtonIsClicked] =
    useState<boolean>(false);
  const [queryParams] = useSearchParams();
  const ideaIdParameter = queryParams.get('new_idea_id');
  const timeout = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (isString(ideaIdParameter)) {
      timeout.current = setTimeout(() => {
        setNewIdeaId(ideaIdParameter);
      }, 1500);
      clHistory.replace(window.location.pathname);
    }
  }, [ideaIdParameter]);

  const phases = usePhases(projectId);
  const { data: idea } = useIdeaById(ideaId);
  const locale = useLocale();

  const ideaflowSocialSharingIsEnabled = useFeatureFlag({
    name: 'ideaflow_social_sharing',
  });

  const { data: ideaCustomFieldsSchema } = useIdeaJsonFormSchema({
    projectId,
    inputId: ideaId,
  });

  const isLoaded =
    !isNilOrError(idea) && !isNilOrError(ideaImages) && !isNilOrError(project);

  const closeIdeaSocialSharingModal = () => {
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    setNewIdeaId(null);
  };

  const onTranslateIdea = () => {
    // analytics
    if (translateButtonIsClicked === true) {
      trackEventByName(tracks.clickGoBackToOriginalIdeaCopyButton.name);
    } else if (translateButtonIsClicked === false) {
      trackEventByName(tracks.clickTranslateIdeaButton.name);
    }
    setTranslateButtonIsClicked(!translateButtonIsClicked);
  };

  const handleContainerRef = (element: HTMLDivElement) => {
    setRef?.(element);
  };

  let content: JSX.Element | null = null;

  if (
    !isNilOrError(project) &&
    !isNilOrError(idea) &&
    !isNilOrError(locale) &&
    !isNilOrError(ideaCustomFieldsSchema) &&
    isLoaded
  ) {
    // If the user deletes their profile, authorId can be null
    const authorId = idea.data.relationships?.author?.data?.id || null;
    const titleMultiloc = idea.data.attributes.title_multiloc;
    const ideaTitle = localize(titleMultiloc);
    const statusId = idea.data.relationships?.idea_status?.data?.id;
    const ideaImageLarge =
      ideaImages?.data[0]?.attributes?.versions?.large || null;
    const ideaId = idea.data.id;
    const proposedBudget = idea.data.attributes?.proposed_budget;
    const ideaBody = localize(idea.data.attributes?.body_multiloc);
    const isCompactView =
      compact === true ||
      (windowSize ? windowSize <= viewportWidths.tablet : false);

    if (isNilOrError(ideaCustomFieldsSchema)) return null;

    const proposedBudgetEnabled = isFieldEnabled(
      'proposed_budget',
      ideaCustomFieldsSchema.data.attributes,
      locale
    );

    content = (
      <>
        <IdeaMeta ideaId={ideaId} />

        {!isCompactView && (
          <TopBar>
            <Box mb="40px">
              <GoBackButton projectId={projectId} insideModal={insideModal} />
            </Box>
            <IdeaMoreActions idea={idea.data} projectId={projectId} />
          </TopBar>
        )}

        <Box display="flex" id="e2e-idea-show-page-content">
          <Box flex="1 1 100%">
            <IdeaHeader>
              <Title
                postType="idea"
                postId={ideaId}
                title={ideaTitle}
                locale={locale}
                translateButtonClicked={translateButtonIsClicked}
              />
              {isCompactView && (
                <Box ml="30px">
                  {' '}
                  <IdeaMoreActions idea={idea.data} projectId={projectId} />
                </Box>
              )}
            </IdeaHeader>

            {ideaImageLarge && (
              <Image src={ideaImageLarge} alt="" id="e2e-idea-image" />
            )}

            <Outlet
              id="app.containers.IdeasShow.left"
              idea={idea.data}
              locale={locale}
              onClick={onTranslateIdea}
              translateButtonClicked={translateButtonIsClicked}
            />

            {proposedBudgetEnabled && proposedBudget && (
              <>
                <BodySectionTitle>
                  <FormattedMessage {...messages.proposedBudgetTitle} />
                </BodySectionTitle>
                <Box mb="20px">
                  <IdeaProposedBudget proposedBudget={proposedBudget} />
                </Box>
                <BodySectionTitle>
                  <FormattedMessage {...messages.bodyTitle} />
                </BodySectionTitle>
              </>
            )}

            <Box mb="40px">
              <Body
                postType="idea"
                postId={ideaId}
                locale={locale}
                body={ideaBody}
                translateButtonClicked={translateButtonIsClicked}
              />
            </Box>
            {isCompactView && (
              <Box my="30px">
                {' '}
                <AssignBudgetControl
                  view="ideaPage"
                  ideaId={ideaId}
                  projectId={projectId}
                />
              </Box>
            )}

            {isCompactView && (
              <Box mb="30px">
                {' '}
                <MetaInformation
                  ideaId={ideaId}
                  projectId={projectId}
                  statusId={statusId}
                  authorId={authorId}
                  compact={isCompactView}
                />
              </Box>
            )}

            {isCompactView && (
              <IdeaSharingButton
                ideaId={ideaId}
                buttonComponent={<MobileSharingButtonComponent />}
              />
            )}
            <Box my="80px">
              <OfficialFeedback
                postId={ideaId}
                postType="idea"
                permissionToPost={postOfficialFeedbackPermission}
              />
            </Box>
            <Box mb="100px">
              <Suspense fallback={<LoadingComments />}>
                <LazyComments postId={ideaId} postType="idea" />
              </Suspense>
            </Box>
          </Box>

          {!isCompactView && projectId && (
            <StyledRightColumnDesktop
              ideaId={ideaId}
              projectId={projectId}
              statusId={statusId}
              authorId={authorId}
              insideModal={insideModal}
            />
          )}
        </Box>
      </>
    );
  }

  if (!isNilOrError(project)) {
    const inputTerm = getInputTerm(
      project.attributes.process_type,
      project,
      phases
    );

    return (
      <>
        {!isLoaded && (
          <Container className={`loading ${className || ''}`}>
            <Spinner />
          </Container>
        )}
        <CSSTransition
          classNames="content"
          in={isLoaded}
          timeout={{
            enter: contentFadeInDuration + contentFadeInDelay,
            exit: 0,
          }}
          enter={true}
          exit={false}
        >
          <Container
            id="e2e-idea-show"
            className={`loaded ${className || ''}`}
            ref={handleContainerRef}
          >
            {content}
          </Container>
        </CSSTransition>
        {ideaflowSocialSharingIsEnabled && (
          <Modal
            opened={!!newIdeaId}
            close={closeIdeaSocialSharingModal}
            hasSkipButton={true}
            skipText={<FormattedMessage {...messages.skipSharing} />}
          >
            {newIdeaId && (
              <SharingModalContent
                postType="idea"
                postId={newIdeaId}
                title={formatMessage(
                  getInputTermMessage(inputTerm, {
                    idea: messages.sharingModalTitle,
                    option: messages.optionSharingModalTitle,
                    project: messages.projectSharingModalTitle,
                    question: messages.questionSharingModalTitle,
                    issue: messages.issueSharingModalTitle,
                    contribution: messages.contributionSharingModalTitle,
                  })
                )}
                subtitle={formatMessage(messages.sharingModalSubtitle)}
              />
            )}
          </Modal>
        )}
      </>
    );
  }

  return null;
};

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize />,
  project: ({ projectId, render }) => (
    <GetProject projectId={projectId}>{render}</GetProject>
  ),
  postOfficialFeedbackPermission: ({ project, render }) => (
    <GetPermission
      item={!isNilOrError(project) ? project : null}
      action="moderate"
    >
      {render}
    </GetPermission>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeasShow {...inputProps} {...dataProps} />}
  </Data>
);
