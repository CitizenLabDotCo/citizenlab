import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { getDaysRemainingUntil } from 'utils/dateUtils';

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

// services
import { deleteInitiative } from 'services/initiatives';

// resources
import GetResourceFiles, {
  GetResourceFilesChildProps,
} from 'resources/GetResourceFiles';
import GetInitiative, {
  GetInitiativeChildProps,
} from 'resources/GetInitiative';
import GetInitiativeImages, {
  GetInitiativeImagesChildProps,
} from 'resources/GetInitiativeImages';
import GetLocale, { GetLocaleChildProps } from 'resources/GetLocale';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from '../messages';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

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
  border: 1px solid ${colors.separation};
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
  color: ${colors.adminTextColor};
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
  color: ${colors.label};
  margin-bottom: 20px;
`;

interface State {}

export interface InputProps {
  initiativeId: string | null;
  closePreview: () => void;
  handleClickEdit: () => void;
}

interface DataProps {
  initiative: GetInitiativeChildProps;
  initiativeImages: GetInitiativeImagesChildProps;
  initiativeFiles: GetResourceFilesChildProps;
  locale: GetLocaleChildProps;
}

interface Props extends InputProps, DataProps {}

export class InitiativeContent extends PureComponent<
  Props & InjectedLocalized & InjectedIntlProps,
  State
> {
  handleClickDelete = () => {
    const { initiative, closePreview } = this.props;
    const message = this.props.intl.formatMessage(
      messages.deleteInitiativeConfirmation
    );

    if (!isNilOrError(initiative)) {
      if (window.confirm(message)) {
        deleteInitiative(initiative.id);
        closePreview();
      }
    }
  };

  render() {
    const {
      initiative,
      localize,
      initiativeImages,
      initiativeFiles,
      handleClickEdit,
      locale,
    } = this.props;

    if (!isNilOrError(initiative) && !isNilOrError(locale)) {
      const initiativeId = initiative.id;
      const initiativeTitle = localize(initiative.attributes.title_multiloc);
      const initiativeImageLarge =
        !isNilOrError(initiativeImages) && initiativeImages.length > 0
          ? get(initiativeImages[0], 'attributes.versions.large', null)
          : null;
      const initiativeGeoPosition =
        initiative.attributes.location_point_geojson || null;
      const initiativeAddress =
        initiative.attributes.location_description || null;
      const daysLeft = getDaysRemainingUntil(initiative.attributes.expires_at);

      return (
        <Container>
          <Top>
            <Button
              icon="edit"
              buttonStyle="text"
              textColor={colors.adminTextColor}
              onClick={handleClickEdit}
            >
              <FormattedMessage {...messages.edit} />
            </Button>
            <Button
              icon="delete"
              buttonStyle="text"
              textColor={colors.adminTextColor}
              onClick={this.handleClickDelete}
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
                    'relationships.author.data.id',
                    null
                  )}
                  showAboutInitiatives={false}
                />

                <StyledBody
                  postId={initiativeId}
                  postType="initiative"
                  body={localize(initiative.attributes.body_multiloc)}
                  locale={locale}
                />

                {initiativeGeoPosition && initiativeAddress && (
                  <StyledMap
                    address={initiativeAddress}
                    position={initiativeGeoPosition}
                  />
                )}

                {initiativeFiles && !isNilOrError(initiativeFiles) && (
                  <FileAttachments files={initiativeFiles} />
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
  }
}

const Data = adopt<DataProps, InputProps>({
  initiative: ({ initiativeId, render }) => (
    <GetInitiative id={initiativeId}>{render}</GetInitiative>
  ),
  initiativeFiles: ({ initiativeId, render }) => (
    <GetResourceFiles resourceId={initiativeId} resourceType="initiative">
      {render}
    </GetResourceFiles>
  ),
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
