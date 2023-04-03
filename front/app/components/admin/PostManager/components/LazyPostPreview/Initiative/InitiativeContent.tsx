import React from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { getPeriodRemainingUntil } from 'utils/dateUtils';

// components
import Title from 'components/PostShowComponents/Title';
import Body from 'components/PostShowComponents/Body';
import DropdownMap from 'components/PostShowComponents/DropdownMap';
import OfficialFeedback from 'components/PostShowComponents/OfficialFeedback';
import PostedBy from 'containers/InitiativesShow/PostedBy';
import Comments from 'components/PostShowComponents/Comments';
import FileAttachments from 'components/UI/FileAttachments';
import FeedbackSettings from './FeedbackSettings';
import Button from 'components/UI/Button';
import { Top, Content, Container } from '../PostPreview';
import VoteIndicator from 'components/InitiativeCard/VoteIndicator';
import { Box } from '@citizenlab/cl2-component-library';

// resources
import GetInitiativeImages, {
  GetInitiativeImagesChildProps,
} from 'resources/GetInitiativeImages';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// hooks
import useInitiativeFiles from 'api/initiative_files/useInitiativeFiles';
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useDeleteInitiative from 'api/initiatives/useDeleteInitiative';

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

const VotePreview = styled.div`
  border: 1px solid #e0e0e0;
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.05);
  border-radius: 3px;
  padding: 20px;
`;

const DaysLeft = styled.div`
  color: ${colors.textSecondary};
  margin-bottom: 20px;
`;

export interface InputProps {
  initiativeId: string;
  closePreview: () => void;
  handleClickEdit: () => void;
}

interface DataProps {
  initiativeImages: GetInitiativeImagesChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

const InitiativeContent = ({
  localize,
  initiativeImages,
  handleClickEdit,
  locale,
  closePreview,
  intl,
  initiativeId,
}: Props & InjectedLocalized & WrappedComponentProps) => {
  const { data: initiativeFiles } = useInitiativeFiles(initiativeId);
  const { mutate: deleteInitiative } = useDeleteInitiative();
  const { data: initiative } = useInitiativeById(initiativeId);
  const handleClickDelete = () => {
    const message = intl.formatMessage(messages.deleteInitiativeConfirmation);

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

  if (!isNilOrError(initiative) && !isNilOrError(locale)) {
    const initiativeTitle = localize(initiative.data.attributes.title_multiloc);
    const initiativeImageLarge =
      !isNilOrError(initiativeImages) && initiativeImages.length > 0
        ? get(initiativeImages[0], 'attributes.versions.large', null)
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
            icon="edit"
            buttonStyle="text"
            textColor={colors.primary}
            onClick={handleClickEdit}
          >
            <FormattedMessage {...messages.edit} />
          </Button>
          <Button
            icon="delete"
            buttonStyle="text"
            textColor={colors.primary}
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
                authorId={get(
                  initiative,
                  'data.relationships.author.data.id',
                  null
                )}
                showAboutInitiatives={false}
              />

              <StyledBody
                postId={initiativeId}
                postType="initiative"
                body={localize(initiative.data.attributes.body_multiloc)}
                locale={locale}
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

              <StyledComments postId={initiativeId} postType="initiative" />
            </Left>
            <Right>
              <VotePreview>
                <DaysLeft>
                  <FormattedMessage
                    {...messages.xDaysLeft}
                    values={{ x: daysLeft }}
                  />
                </DaysLeft>
                <VoteIndicator initiativeId={initiativeId} />
              </VotePreview>

              <FeedbackSettings initiativeId={initiativeId} />
            </Right>
          </Row>
        </Content>
      </Container>
    );
  }
  return null;
};

const Data = adopt<DataProps, InputProps>({
  initiativeImages: ({ initiativeId, render }) => (
    <GetInitiativeImages initiativeId={initiativeId}>
      {render}
    </GetInitiativeImages>
  ),
  locale: <GetLocale />,
});

const InitiativeContentWithHOCs = injectIntl(injectLocalize(InitiativeContent));

const WrappedInitiativeContent = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => (
      <InitiativeContentWithHOCs {...inputProps} {...dataProps} />
    )}
  </Data>
);

export default WrappedInitiativeContent;
