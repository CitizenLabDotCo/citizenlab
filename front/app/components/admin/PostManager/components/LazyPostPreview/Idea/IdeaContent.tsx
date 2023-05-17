import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import Title from 'components/PostShowComponents/Title';
import PostedBy from 'containers/IdeasShow/PostedBy';
import Body from 'components/PostShowComponents/Body';
import IdeaProposedBudget from 'containers/IdeasShow/IdeaProposedBudget';
import DropdownMap from 'components/PostShowComponents/DropdownMap';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import Comments from 'components/PostShowComponents/Comments';
import FileAttachments from 'components/UI/FileAttachments';
import FeedbackSettings from './FeedbackSettings';
import VotePreview from './VotePreview';
import { IconTooltip, Box } from '@citizenlab/cl2-component-library';
import Button from 'components/UI/Button';
import Link from 'utils/cl-router/Link';
import T from 'components/T';
import { Top, Content, Container } from '../PostPreview';

// services
import { ProcessType } from 'api/projects/types';

// resources
import GetIdeaById, { GetIdeaByIdChildProps } from 'resources/GetIdeaById';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPermission, {
  GetPermissionChildProps,
} from 'resources/GetPermission';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import useDeleteIdea from 'api/ideas/useDeleteIdea';

// utils
import { getAddressOrFallbackDMS } from 'utils/map';

// i18n
import { useIntl, FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import FormattedBudget from 'utils/currency/FormattedBudget';
import useLocalize from 'hooks/useLocalize';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';
import useIdeaFiles from 'api/idea_files/useIdeaFiles';

const StyledTitle = styled(Title)`
  margin-bottom: 20px;
`;

const StyledPostedBy = styled(PostedBy)`
  margin-bottom: 20px;
`;

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Left = styled.div`
  flex: 5;
  margin-right: 50px;
  height: 100%;
`;

const BelongsToProject = styled.p`
  width: 100%;
  color: ${colors.textSecondary};
  font-weight: 300;
  font-size: ${fontSizes.base}px;
  line-height: normal;
  margin-bottom: 10px;
`;

const ProjectLink = styled(Link)`
  color: inherit;
  font-weight: 400;
  font-size: inherit;
  line-height: inherit;
  text-decoration: underline;
  transition: all 100ms ease-out;
  margin-left: 4px;

  &:hover {
    color: ${darken(0.2, colors.textSecondary)};
    text-decoration: underline;
  }
`;

const IdeaImage = styled.img`
  width: 100%;
  margin: 0 0 2rem;
  padding: 0;
  border-radius: 8px;
  border: 1px solid ${colors.divider};
`;

const StyledBody = styled(Body)`
  margin-bottom: 20px;
`;

const BodySectionTitle = styled.h2`
  font-size: ${(props) => props.theme.fontSizes.m}px;
  font-weight: 400;
  line-height: 28px;
`;

const StyledMap = styled(DropdownMap)`
  margin-bottom: 40px;
`;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 70px;
`;

const StyledComments = styled(Comments)`
  margin-top: 30px;
`;

const Right = styled.div`
  flex: 2;
  position: sticky;
  top: 80px;
  align-self: flex-start;
  color: ${colors.primary};
  font-size: ${fontSizes.base}px;
  line-height: 19px;
`;

const BudgetBox = styled.div`
  margin-top: 25px;
  width: 100%;
  height: 95px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-bottom: 5px;
  position: relative;
  border-radius: 5px;
  background: ${colors.background};
  border: solid 1px ${colors.primary};
  font-size: ${fontSizes.l}px;
  font-weight: 500;
`;

const Picks = styled.div`
  margin-top: 15px;
  display: flex;
  font-size: ${fontSizes.base}px;
  align-items: center;
`;

interface InputProps {
  ideaId: string;
  closePreview: () => void;
  handleClickEdit: () => void;
}

interface DataProps {
  idea: GetIdeaByIdChildProps;
  locale: GetLocaleChildProps;
  project: GetProjectChildProps;
  postOfficialFeedbackPermission: GetPermissionChildProps;
}

interface Props extends InputProps, DataProps {}

const IdeaContent = ({
  idea,
  project,
  locale,
  handleClickEdit,
  closePreview,
  ideaId,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: ideaImages } = useIdeaImages(ideaId);
  const { data: ideaFiles } = useIdeaFiles(ideaId);
  const { mutate: deleteIdea } = useDeleteIdea();

  const handleClickDelete = (processType: ProcessType) => () => {
    const deleteConfirmationMessage = {
      continuous: messages.deleteInputConfirmation,
      timeline: messages.deleteInputInTimelineConfirmation,
    }[processType];

    if (!isNilOrError(idea)) {
      if (window.confirm(formatMessage(deleteConfirmationMessage))) {
        deleteIdea(idea.id, { onSuccess: closePreview });
      }
    }
  };

  if (!isNilOrError(idea) && !isNilOrError(locale) && !isNilOrError(project)) {
    const ideaId = idea.id;
    const ideaTitle = localize(idea.attributes.title_multiloc);
    const ideaImageLarge =
      ideaImages && ideaImages.data.length > 0
        ? ideaImages.data[0].attributes.versions.large
        : null;
    const ideaGeoPosition = idea.attributes.location_point_geojson || null;
    const ideaAddress = getAddressOrFallbackDMS(
      idea.attributes.location_description,
      idea.attributes.location_point_geojson
    );
    // AuthorId can be null if user has been deleted
    const authorId = idea.relationships.author.data?.id || null;
    const proposedBudget = idea.attributes.proposed_budget;
    const processType = project.attributes.process_type;

    return (
      <Container>
        <Top>
          <Button icon="edit" buttonStyle="text" onClick={handleClickEdit}>
            <FormattedMessage {...messages.edit} />
          </Button>
          <Button
            icon="delete"
            buttonStyle="text"
            onClick={handleClickDelete(processType)}
          >
            <FormattedMessage {...messages.delete} />
          </Button>
        </Top>
        <Content>
          {!isNilOrError(project) && (
            <BelongsToProject>
              <FormattedMessage
                {...messages.postedIn}
                values={{
                  projectLink: (
                    <ProjectLink
                      className="e2e-project-link"
                      to={`/projects/${project.attributes.slug}`}
                    >
                      <T value={project.attributes.title_multiloc} />
                    </ProjectLink>
                  ),
                }}
              />
            </BelongsToProject>
          )}

          <StyledTitle postId={ideaId} postType="idea" title={ideaTitle} />
          <StyledPostedBy
            ideaId={ideaId}
            authorId={authorId}
            anonymous={idea.attributes.anonymous}
          />
          <Row>
            <Left>
              {ideaImageLarge && (
                <IdeaImage
                  src={ideaImageLarge}
                  alt=""
                  className="e2e-ideaImage"
                />
              )}

              {proposedBudget && (
                <>
                  <BodySectionTitle>
                    <FormattedMessage {...messages.proposedBudgetTitle} />
                  </BodySectionTitle>
                  <IdeaProposedBudget proposedBudget={proposedBudget} />
                  <BodySectionTitle>
                    <FormattedMessage {...messages.bodyTitle} />
                  </BodySectionTitle>
                </>
              )}

              <StyledBody
                postId={ideaId}
                postType="idea"
                body={localize(idea.attributes.body_multiloc)}
                locale={locale}
              />

              {!isNilOrError(project) && ideaGeoPosition && ideaAddress && (
                <StyledMap
                  address={ideaAddress}
                  position={ideaGeoPosition}
                  projectId={project.id}
                />
              )}

              {ideaFiles && (
                <Box mb="25px">
                  <FileAttachments files={ideaFiles.data} />
                </Box>
              )}

              <StyledOfficialFeedback
                postId={ideaId}
                postType="idea"
                permissionToPost
              />

              <StyledComments postId={ideaId} postType="idea" />
            </Left>
            <Right>
              <VotePreview ideaId={ideaId} />

              {idea.attributes.budget && (
                <>
                  <BudgetBox>
                    <FormattedBudget value={idea.attributes.budget} />
                    <Picks>
                      <FormattedMessage
                        {...messages.picks}
                        values={{
                          picksNumber: idea.attributes.baskets_count,
                        }}
                      />
                      &nbsp;
                      <IconTooltip
                        content={
                          <FormattedMessage {...messages.pbItemCountTooltip} />
                        }
                      />
                    </Picks>
                  </BudgetBox>
                </>
              )}

              <FeedbackSettings ideaId={ideaId} projectId={project.id} />
            </Right>
          </Row>
        </Content>
      </Container>
    );
  }
  return null;
};

const Data = adopt<DataProps, InputProps>({
  locale: <GetLocale />,
  idea: ({ ideaId, render }) => (
    <GetIdeaById ideaId={ideaId}>{render}</GetIdeaById>
  ),
  project: ({ idea, render }) => (
    <GetProject
      projectId={
        !isNilOrError(idea) ? idea.relationships.project.data.id : null
      }
    >
      {render}
    </GetProject>
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
    {(dataProps) => <IdeaContent {...inputProps} {...dataProps} />}
  </Data>
);
