import React, { PureComponent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { adopt } from 'react-adopt';

// components
import IdeaAuthor from 'containers/IdeasShow/IdeaAuthor';
import IdeaHeader from 'containers/IdeasShow/IdeaHeader';

// utils
import { get, trimEnd } from 'lodash-es';
import linkifyHtml from 'linkifyjs/html';

// resources
import GetResourceFiles, { GetResourceFilesChildProps } from 'resources/GetResourceFiles';
import GetIdea, { GetIdeaChildProps } from 'resources/GetIdea';
import GetIdeaImages, { GetIdeaImagesChildProps } from 'resources/GetIdeaImages';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// animations
import CSSTransition from 'react-transition-group/CSSTransition';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import IdeaBody from 'containers/IdeasShow/IdeaBody';
import IdeaMap from 'containers/IdeasShow/IdeaMap';
import { darken } from 'polished';
import Icon from 'components/UI/Icon';
import OfficialFeedback from 'containers/IdeasShow/OfficialFeedback';
import Comments from 'containers/IdeasShow/Comments';
import VotePreview from './VotePreview';
import FileAttachments from 'components/UI/FileAttachments';

const Container = styled.div`
  height: 100%;
  width: 100%;
  position: relative;
`;

const Top = styled.div`
  display: flex;
  position: fixed;
  top: 0;
  height: 50px;
  width: 100%;
  background-color: ${colors.adminBackground};
  padding-left: 30px;
  padding-right: 50px;
  z-index: 1;
`;

const Content = styled.div`
  padding: 30px;
  margin-top: 50px;
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
  fill: ${colors.label};
`;

const LocationButton = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  margin-bottom: 30px;
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  margin-top: 20px;
  margin-right: 6px;
  max-width: 200px;
  font-size: ${fontSizes.base}px;
  line-height: 19px;
  text-align: left;
  font-weight: 400;
  transition: all 100ms ease-out;
  white-space: nowrap;

  &:hover {
    color: ${darken(0.2, colors.label)};

    ${LocationIcon} {
      fill: ${darken(0.2, colors.label)};
    }
  }
`;

interface State {
  showMap: boolean;
}

interface InputProps {
  ideaId: string | null;
}

interface DataProps {
  idea: GetIdeaChildProps;
  ideaImages: GetIdeaImagesChildProps;
  ideaFiles: GetResourceFilesChildProps;
}

interface Props extends InputProps, DataProps {}

class IdeaPreview extends PureComponent<Props & InjectedLocalized & InjectedIntlProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      showMap: false
    };
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
    const { idea, localize, ideaImages, ideaFiles, intl: { formatMessage } } = this.props;
    const { showMap } = this.state;
    if (!isNilOrError(idea)) {
      const ideaTitle = localize(idea.attributes.title_multiloc);

      const ideaImageLarge = !isNilOrError(ideaImages) && ideaImages.length > 0 ? get(ideaImages[0], 'attributes.versions.large', null) : null;

      let ideaBody = localize(idea.attributes.body_multiloc);
      ideaBody = trimEnd(ideaBody, '<p><br></p>');
      ideaBody = trimEnd(ideaBody, '<p></p>');
      ideaBody = linkifyHtml(ideaBody);

      const ideaLocation = (idea.attributes.location_point_geojson || null);
      const ideaAdress = (idea.attributes.location_description || null);

      return (
        <Container>
          <Top>
            <button>edit</button>
            <button>mark as spam</button>
            <button>delete</button>
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
                  ideaBody={ideaBody}
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
});

const IdeaPreviewWithHOCs = injectIntl(injectLocalize(IdeaPreview));

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeaPreviewWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
