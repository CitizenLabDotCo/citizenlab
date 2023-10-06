import React from 'react';
import { getPeriodRemainingUntil } from 'utils/dateUtils';

// components
import Title from 'components/PostShowComponents/Title';
import Body from 'components/PostShowComponents/Body';
import DropdownMap from 'components/PostShowComponents/DropdownMap';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import PostedBy from 'containers/InitiativesShow/PostedBy';
import CommentsSection from 'components/PostShowComponents/Comments';
import FileAttachments from 'components/UI/FileAttachments';
import FeedbackSettings from './FeedbackSettings';
import Button from 'components/UI/Button';
import {
  Top,
  Content,
  Container,
} from 'components/admin/PostManager/components/PostPreview';
import ReactionIndicator from 'components/InitiativeCard/ReactionIndicator';
import { Box } from '@citizenlab/cl2-component-library';

// i18n
import messages from '../messages';
import { FormattedMessage, useIntl } from 'utils/cl-intl';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// hooks
import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useDeleteInitiative from 'api/initiatives/useDeleteInitiative';
import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import useLocalize from 'hooks/useLocalize';
import useInitiativeImages from 'api/initiative_images/useInitiativeImages';

const StyledTitle = styled(Title)`
  margin-bottom: 30px;
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

const Image = styled.img`
  width: 100%;
  margin: 0 0 2rem;
  padding: 0;
  border-radius: 8px;
  border: 1px solid ${colors.divider};
`;

const StyledBody = styled(Body)`
  margin-bottom: 20px;
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

const ReactionPreview = styled.div`
  border: 1px solid #e0e0e0;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  padding: 20px;
`;

const DaysLeft = styled.div`
  color: ${colors.textSecondary};
  margin-bottom: 20px;
`;

export interface Props {
  initiativeId: string;
  closePreview: () => void;
  handleClickEdit: () => void;
}

const AdminInitiativeContent = ({
  handleClickEdit,
  closePreview,
  initiativeId,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const { data: appConfiguration } = useAppConfiguration();
  const { mutate: deleteInitiative } = useDeleteInitiative();
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: initiativeImages } = useInitiativeImages(initiativeId);

  const handleClickDelete = () => {
    const message = formatMessage(messages.deleteInitiativeConfirmation);

    if (initiative) {
      if (window.confirm(message)) {
        deleteInitiative(
          { initiativeId: initiative.data.id },
          {
            onSuccess: () => {
              closePreview();
            },
          }
        );
      }
    }
  };

  if (initiative) {
    const initiativeTitle = localize(initiative.data.attributes.title_multiloc);
    const initiativeImageLarge =
      initiativeImages && initiativeImages.data.length > 0
        ? initiativeImages.data[0].attributes.versions.large
        : null;
    const initiativeGeoPosition =
      initiative.data.attributes.location_point_geojson || null;
    const initiativeAddress =
      initiative.data.attributes.location_description || null;
    const daysLeft = getPeriodRemainingUntil(
      initiative.data.attributes.expires_at
    );

    return (
      <Container>
        <Top>
          <Button
            mr="8px"
            icon="edit"
            buttonStyle="secondary"
            onClick={handleClickEdit}
          >
            <FormattedMessage {...messages.edit} />
          </Button>
          <Button
            icon="delete"
            buttonStyle="delete"
            onClick={handleClickDelete}
          >
            <FormattedMessage {...messages.delete} />
          </Button>
        </Top>
        <Content>
          <StyledTitle
            postId={initiativeId}
            title={initiativeTitle}
            postType="initiative"
          />
          <Row>
            <Left>
              {initiativeImageLarge && (
                <Image
                  src={initiativeImageLarge}
                  alt=""
                  className="e2e-initiativeImage"
                />
              )}

              <PostedBy
                authorId={initiative.data.relationships.author.data?.id}
                showAboutInitiatives={false}
              />

              <StyledBody
                postId={initiativeId}
                postType="initiative"
                body={localize(initiative.data.attributes.body_multiloc)}
              />

              {initiativeGeoPosition && initiativeAddress && (
                <StyledMap
                  address={initiativeAddress}
                  position={initiativeGeoPosition}
                />
              )}

              {initiativeFiles && (
                <Box mb="25px">
                  <FileAttachments files={initiativeFiles.data} />
                </Box>
              )}

              <StyledOfficialFeedback
                postId={initiativeId}
                postType="initiative"
                // If the user has access to the post preview,
                // it means they are in the admin and therefore have permission
                permissionToPost
              />
              <CommentsSection
                allowAnonymousParticipation={
                  appConfiguration?.data.attributes.settings.initiatives
                    .allow_anonymous_participation
                }
                postId={initiativeId}
                postType="initiative"
                showInternalComments
              />
            </Left>
            <Right>
              <ReactionPreview>
                {daysLeft > 0 && (
                  <DaysLeft>
                    <FormattedMessage
                      {...messages.xDaysLeft}
                      values={{ x: daysLeft }}
                    />
                  </DaysLeft>
                )}
                <ReactionIndicator initiativeId={initiativeId} />
              </ReactionPreview>

              <FeedbackSettings initiativeId={initiativeId} />
            </Right>
          </Row>
        </Content>
      </Container>
    );
  }
  return null;
};

export default AdminInitiativeContent;
