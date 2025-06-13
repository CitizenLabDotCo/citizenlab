import React from 'react';

import {
  IconTooltip,
  Box,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import { darken } from 'polished';
import styled from 'styled-components';

import useIdeaFiles from 'api/idea_files/useIdeaFiles';
import useIdeaImages from 'api/idea_images/useIdeaImages';
import useDeleteIdea from 'api/ideas/useDeleteIdea';
import useIdeaById from 'api/ideas/useIdeaById';
import usePhases from 'api/phases/usePhases';
import { getCurrentPhase } from 'api/phases/utils';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import PostedBy from 'containers/IdeasShow/components/MetaInformation/PostedBy';
import IdeaProposedBudget from 'containers/IdeasShow/components/ProposedBudget/IdeaProposedBudget';

import {
  Top,
  Content,
  Container,
} from 'components/admin/PostManager/components/PostPreview';
import Body from 'components/PostShowComponents/Body';
import CommentsSection from 'components/PostShowComponents/Comments/CommentsSection';
import DropdownMap from 'components/PostShowComponents/DropdownMap';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import Title from 'components/PostShowComponents/Title';
import T from 'components/T';
import ButtonWithLink from 'components/UI/ButtonWithLink';
import FileAttachments from 'components/UI/FileAttachments';

import { useIntl, FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import FormattedBudget from 'utils/currency/FormattedBudget';
import { isNilOrError } from 'utils/helperUtils';
import { getAddressOrFallbackDMS } from 'utils/map';

import messages from '../messages';

import FeedbackSettings from './Components/FeedbackSettings';
import OfflineVoteSettings from './Components/OfflineVoteSettings';
import ReactionPreview from './Components/ReactionPreview';

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

interface Props {
  ideaId: string;
  closePreview: () => void;
  handleClickEdit: () => void;
  selectedPhaseId?: string;
}

const AdminIdeaContent = ({
  handleClickEdit,
  closePreview,
  ideaId,
  selectedPhaseId,
}: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: ideaImages } = useIdeaImages(ideaId);
  const { data: ideaFiles } = useIdeaFiles(ideaId);
  const { mutate: deleteIdea } = useDeleteIdea();
  const { data: phases } = usePhases(project?.data.id);

  if (!idea || !project) return null;

  const handleClickDelete = () => {
    const deleteConfirmationMessage =
      messages.deleteInputInTimelineConfirmation;

    if (window.confirm(formatMessage(deleteConfirmationMessage))) {
      deleteIdea(idea.data.id, { onSuccess: closePreview });
    }
  };

  const currentPhase = getCurrentPhase(phases?.data);
  const ideaTitle = localize(idea.data.attributes.title_multiloc);
  const ideaImageLarge =
    ideaImages && ideaImages.data.length > 0
      ? ideaImages.data[0].attributes.versions.large
      : null;
  const ideaGeoPosition = idea.data.attributes.location_point_geojson || null;
  const ideaAddress = getAddressOrFallbackDMS(
    idea.data.attributes.location_description,
    idea.data.attributes.location_point_geojson
  );
  // AuthorId can be null if user has been deleted
  const authorId = idea.data.relationships.author?.data?.id || null;
  const proposedBudget = idea.data.attributes.proposed_budget;
  const allowAnonymousParticipation =
    currentPhase?.attributes.allow_anonymous_participation;

  const votingMethod = phases?.data.find(
    (phase) => phase.id === selectedPhaseId
  )?.attributes.voting_method;

  return (
    <Container>
      <Top>
        <ButtonWithLink
          mr="8px"
          buttonStyle="primary"
          icon="edit"
          onClick={handleClickEdit}
        >
          <FormattedMessage {...messages.edit} />
        </ButtonWithLink>
        <ButtonWithLink
          linkTo={`/ideas/${idea.data.attributes.slug}`}
          // We open in a new tab not lose state of the input manager
          openLinkInNewTab
          icon="eye"
          buttonStyle="secondary-outlined"
        >
          <FormattedMessage {...messages.view} />
        </ButtonWithLink>
        <ButtonWithLink
          id="e2e-input-manager-side-modal-delete-button"
          buttonStyle="text"
          icon="delete"
          onClick={handleClickDelete}
        >
          <FormattedMessage {...messages.delete} />
        </ButtonWithLink>
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
                    to={`/projects/${project.data.attributes.slug}`}
                  >
                    <T value={project.data.attributes.title_multiloc} />
                  </ProjectLink>
                ),
              }}
            />
          </BelongsToProject>
        )}

        <StyledTitle postId={ideaId} title={ideaTitle} />
        <StyledPostedBy
          ideaId={ideaId}
          authorId={authorId}
          anonymous={idea.data.attributes.anonymous}
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
              body={localize(idea.data.attributes.body_multiloc)}
            />

            {!isNilOrError(project) && ideaGeoPosition && ideaAddress && (
              <StyledMap
                address={ideaAddress}
                position={ideaGeoPosition}
                projectId={project.data.id}
              />
            )}

            {ideaFiles && (
              <Box mb="25px">
                <FileAttachments files={ideaFiles.data} />
              </Box>
            )}

            <StyledOfficialFeedback postId={ideaId} permissionToPost />

            <CommentsSection
              allowAnonymousParticipation={allowAnonymousParticipation}
              postId={ideaId}
              showInternalComments
            />
          </Left>
          <Right>
            <ReactionPreview ideaId={ideaId} />

            {idea.data.attributes.budget && (
              <>
                <BudgetBox>
                  <FormattedBudget value={idea.data.attributes.budget} />
                  <Picks>
                    <FormattedMessage
                      {...messages.picks}
                      values={{
                        picksNumber: idea.data.attributes.baskets_count,
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

            <FeedbackSettings ideaId={ideaId} projectId={project.data.id} />
            {selectedPhaseId && votingMethod && (
              <OfflineVoteSettings
                phaseId={selectedPhaseId}
                ideaId={ideaId}
                votingMethod={votingMethod}
              />
            )}
          </Right>
        </Row>
      </Content>
    </Container>
  );
};

export default AdminIdeaContent;
