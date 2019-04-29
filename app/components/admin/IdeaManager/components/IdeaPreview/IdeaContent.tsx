import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import IdeaAuthor from 'containers/IdeasShow/IdeaAuthor';
import IdeaHeader from 'containers/IdeasShow/IdeaHeader';
import OfficialFeedback from 'containers/IdeasShow/OfficialFeedback';
import Comments from 'containers/IdeasShow/Comments';
import FileAttachments from 'components/UI/FileAttachments';
import Icon from 'components/UI/Icon';
import IdeaSettings from './IdeaSettings';
import VotePreview from './VotePreview';
import InfoTooltip from 'components/admin/InfoTooltip';
import Button from 'components/UI/Button';
import { Top, Content, Container } from '.';

// resources
import IdeaBody from 'containers/IdeasShow/IdeaBody';
import IdeaMap from 'containers/IdeasShow/IdeaMap';
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaImages, { GetIdeaImagesChildProps } from 'resources/GetIdeaImages';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import { deleteIdea } from 'services/ideas';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps, FormattedNumber } from 'react-intl';
import messages from './messages';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { darken } from 'polished';
import { get } from 'lodash-es';

const Row = styled.div`
  display: flex;
  width: 100%;
`;

const Left = styled.div`
  flex: 5;
  margin-right: 50px;
  height: 100%;
`;

const IdeaImage = styled.img`
  width: 100%;
  margin: 0 0 2rem;
  padding: 0;
  border-radius: 8px;
  border: 1px solid ${colors.separation};
`;

const MapWrapper = styled.div`
  border-radius: 8px;
  border: 1px solid ${colors.separation};
  height: 265px;
  position: relative;
  overflow: hidden;
  z-index: 2;

  &.map-enter {
    height: 0;
    opacity: 0;

    &.map-enter-active {
      height: 265px;
      opacity: 1;
      transition: all 250ms ease-out;
    }
  }

  &.map-exit {
    height: 265px;
    opacity: 1;

    &.map-exit-active {
      height: 0;
      opacity: 0;
      transition: all 250ms ease-out;
    }
  }
`;

const AddressWrapper = styled.div`
  color: #fff;
  font-size: ${fontSizes.base}px;
  font-weight: 300;
  background: rgba(0, 0, 0, 0.4);
  border-top: 1px solid ${colors.separation};
  margin: 0;
  padding: 10px;
  position: absolute;
  right: 0;
  left: 0;
  bottom: 0;
  z-index: 1000;
`;

const StyledOfficialFeedback = styled(OfficialFeedback)`
  margin-top: 70px;
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

const BudgetBox = styled.div`
  margin-top: 20px;
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
  border: solid 1px ${colors.adminTextColor};
  font-size: ${fontSizes.large}px;
  font-weight: 500;
`;

const Picks = styled.div`
  margin-top: 7px;
  display: flex;
  font-size: ${fontSizes.base}px;
  align-items: center;
`;

const LocationIconWrapper = styled.div`
  width: 22px;
  height: 36px;
  margin: 0;
  margin-right: 3px;
  padding: 0;
  border: none;
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

const LocationIcon = styled(Icon)`
  width: 18px;
  fill: ${colors.adminTextColor};
`;

const LocationButton = styled.button`
  display: flex;
  align-items: center;
  margin-bottom: 30px;
  margin-top: 20px;
  margin-right: 6px;
  text-align: left;
  font-weight: 400;
  transition: all 100ms ease-out;
  white-space: nowrap;

  &:hover {
    color: ${darken(0.2, colors.adminTextColor)};

    ${LocationIcon} {
      fill: ${darken(0.2, colors.adminTextColor)};
    }
  }
`;

interface State {
  showMap: boolean;
}

interface InputProps {
  ideaId: string | null;
  closeSideModal: () => void;
  handleClickEdit: () => void;
}

interface DataProps {
  idea: GetIdeaChildProps;
  ideaImages: GetIdeaImagesChildProps;
  ideaFiles: GetResourceFilesChildProps;
  tenant: GetTenantChildProps;
}

interface Props extends InputProps, DataProps {}

export class IdeaContent extends PureComponent<Props & InjectedLocalized & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      showMap: false
    };
  }

  handleClickDelete = () => {
    const { idea, closeSideModal } = this.props;
    const message = this.props.intl.formatMessage(messages.deleteIdeaConfirmation);

    if (!isNilOrError(idea)) {
      if (window.confirm(message)) {
        deleteIdea(idea.id);
        closeSideModal();
      }
    }
  }

  handleMapWrapperSetRef = (element: HTMLDivElement) => {
    if (element) {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }

  handleMapToggle = () => {
    this.setState((state) => {
      const showMap = !state.showMap;
      return { showMap };
    });
  }

  render() {
    const { idea, localize, ideaImages, ideaFiles, tenant, handleClickEdit, intl: { formatMessage } } = this.props;
    const { showMap } = this.state;
    if (!isNilOrError(idea)) {
      const ideaTitle = localize(idea.attributes.title_multiloc);

      const ideaImageLarge = !isNilOrError(ideaImages) && ideaImages.length > 0 ? get(ideaImages[0], 'attributes.versions.large', null) : null;

      const ideaLocation = (idea.attributes.location_point_geojson || null);
      const ideaAdress = (idea.attributes.location_description || null);

      return (
        <Container>
          <Top>
            <Button
              icon="edit"
              style="text"
              textColor={colors.adminTextColor}
              onClick={handleClickEdit}
            >
              <FormattedMessage {...messages.edit}/>
            </Button>
            <Button
              icon="delete"
              style="text"
              textColor={colors.adminTextColor}
              onClick={this.handleClickDelete}
            >
              <FormattedMessage {...messages.delete}/>
            </Button>
          </Top>
          <Content>
            <IdeaHeader
              ideaId={idea.id}
              ideaTitle={ideaTitle}
              projectId={idea.relationships.project.data.id}
            />
            <Row>
              <Left>
                {ideaImageLarge &&
                  <IdeaImage src={ideaImageLarge} alt={formatMessage(messages.imageAltText, { ideaTitle })} className="e2e-ideaImage"/>
                }
                <IdeaAuthor
                  authorId={get(idea, 'relationships.author.data.id', null)}
                  ideaCreatedAt={idea.attributes.created_at}
                  ideaId={idea.id}
                />
                <IdeaBody
                  ideaId={idea.id}
                  ideaBody={localize(idea.attributes.body_multiloc)}
                />
                {ideaLocation &&
                  <>
                    <CSSTransition
                      classNames="map"
                      in={showMap}
                      timeout={300}
                      mountOnEnter={true}
                      unmountOnExit={true}
                      exit={true}
                    >
                      <MapWrapper innerRef={this.handleMapWrapperSetRef}>
                        <IdeaMap location={ideaLocation} id={idea.id} />
                        {ideaAdress && <AddressWrapper>{ideaAdress}</AddressWrapper>}
                      </MapWrapper>
                    </CSSTransition>
                  </>
                }

                {ideaFiles && !isNilOrError(ideaFiles) &&
                  <FileAttachments files={ideaFiles} />
                }

                <StyledOfficialFeedback
                  ideaId={idea.id}
                />

                <Comments ideaId={idea.id} />
              </Left>
              <Right>
                <VotePreview ideaId={idea.id}/>

                {idea.attributes.budget && !isNilOrError(tenant) &&
                  <>
                    <BudgetBox>
                      <FormattedNumber
                        value={idea.attributes.budget}
                        style="currency"
                        currency={tenant.attributes.settings.core.currency}
                        minimumFractionDigits={0}
                        maximumFractionDigits={0}
                      />
                      <Picks>
                        <FormattedMessage {...messages.picks} values={{ picksNumber: idea.attributes.baskets_count }} />
                        &nbsp;
                        <InfoTooltip {...messages.basketsCountTooltip} size="small" position="top-left" />
                      </Picks>
                    </BudgetBox>
                  </>
                }

                <IdeaSettings ideaId={idea.id}/>

                {ideaLocation &&
                  <LocationButton onClick={this.handleMapToggle}>
                    <LocationIconWrapper>
                      <LocationIcon name={!showMap ? 'position' : 'close'} />
                    </LocationIconWrapper>
                      {!showMap
                        ? <FormattedMessage {...messages.openMap} />
                        : <FormattedMessage {...messages.closeMap} />
                      }
                  </LocationButton>
                }
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
  idea: ({ ideaId, render }) => <GetIdea id={ideaId}>{render}</GetIdea>,
  ideaFiles: ({ ideaId, render }) => <GetResourceFiles resourceId={ideaId} resourceType="idea">{render}</GetResourceFiles>,
  ideaImages: ({ ideaId, render }) => <GetIdeaImages ideaId={ideaId}>{render}</GetIdeaImages>,
  tenant: <GetTenant />
});

const IdeaContentWithHOCs = injectIntl(injectLocalize(IdeaContent));

const WrappedIdeaContent = (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaContentWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);

export default WrappedIdeaContent;
