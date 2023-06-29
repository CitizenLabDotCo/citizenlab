import React, { lazy, Suspense, useState } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// components
import Container from './components/Container';
import IdeaSharingButton from './components/Buttons/IdeaSharingButton';
import IdeaMeta from './components/IdeaMeta';
import DesktopTopBar from './components/DesktopTopBar';
import Title from 'components/PostShowComponents/Title';
import IdeaProposedBudget from './components/IdeaProposedBudget';
import Body from 'components/PostShowComponents/Body';
import Image from 'components/PostShowComponents/Image';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import AddToBasketButton from 'components/AssignBudgetControl/AddToBasketButton';
import IdeaMoreActions from './components/IdeaMoreActions';
import { Box, useBreakpoint } from '@citizenlab/cl2-component-library';
const LazyComments = lazy(
  () => import('components/PostShowComponents/Comments')
);
import LoadingComments from 'components/PostShowComponents/Comments/LoadingComments';
import MetaInformation from './components/MetaInformation';
import MobileSharingButtonComponent from './components/Buttons/MobileSharingButtonComponent';
import RightColumnDesktop from './components/RightColumnDesktop';

// utils
import { isFieldEnabled } from 'utils/projectUtils';

// resources
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPermission, {
  GetPermissionChildProps,
} from 'resources/GetPermission';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import useLocalize from 'hooks/useLocalize';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, isRtl } from 'utils/styleUtils';
import { columnsGapDesktop } from './styleConstants';
import Outlet from 'components/Outlet';

// hooks
import useLocale from 'hooks/useLocale';
import usePhases from 'api/phases/usePhases';
import useIdeaById from 'api/ideas/useIdeaById';
import useIdeaJsonFormSchema from 'api/idea_json_form_schema/useIdeaJsonFormSchema';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import { getCurrentParticipationContext } from 'api/phases/utils';

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
  postOfficialFeedbackPermission: GetPermissionChildProps;
}

interface InputProps {
  ideaId: string;
  projectId: string;
  setRef?: (element: HTMLDivElement) => void;
  compact?: boolean;
  className?: string;
}

interface Props extends DataProps, InputProps {}

export const IdeasShow = ({
  className,
  postOfficialFeedbackPermission,
  projectId,
  project,
  compact,
  ideaId,
  setRef,
}: Props) => {
  const localize = useLocalize();
  const { data: ideaImages } = useIdeaImages(ideaId);

  const [translateButtonIsClicked, setTranslateButtonIsClicked] =
    useState<boolean>(false);

  const isSmallerThanTablet = useBreakpoint('tablet');

  const { data: phases } = usePhases(projectId);
  const { data: idea } = useIdeaById(ideaId);
  const locale = useLocale();

  const { data: ideaCustomFieldsSchema } = useIdeaJsonFormSchema({
    projectId,
    inputId: ideaId,
  });

  const isLoaded =
    !isNilOrError(idea) && !isNilOrError(ideaImages) && !isNilOrError(project);

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
    const isCompactView = compact === true || isSmallerThanTablet;

    if (isNilOrError(ideaCustomFieldsSchema)) return null;

    const proposedBudgetEnabled = isFieldEnabled(
      'proposed_budget',
      ideaCustomFieldsSchema.data.attributes,
      locale
    );

    const anonymous = idea.data.attributes.anonymous;
    const participationContext = getCurrentParticipationContext(
      project,
      phases?.data
    );

    content = (
      <>
        <IdeaMeta ideaId={ideaId} />

        {!isCompactView && <DesktopTopBar project={project} idea={idea.data} />}

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
                <AddToBasketButton ideaId={ideaId} projectId={projectId} />
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
                  anonymous={anonymous}
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
                <LazyComments
                  allowAnonymousParticipation={
                    participationContext?.attributes
                      .allow_anonymous_participation
                  }
                  postId={ideaId}
                  postType="idea"
                />
              </Suspense>
            </Box>
          </Box>

          {!isCompactView && projectId && (
            <StyledRightColumnDesktop
              ideaId={ideaId}
              projectId={projectId}
              statusId={statusId}
              authorId={authorId}
              anonymous={anonymous}
            />
          )}
        </Box>
      </>
    );
  }

  return (
    <Container
      projectId={projectId}
      isLoaded={isLoaded}
      className={className}
      handleContainerRef={handleContainerRef}
    >
      {content}
    </Container>
  );
};

const Data = adopt<DataProps, InputProps>({
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
