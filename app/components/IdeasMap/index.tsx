// Libs
import * as React from 'react';
import Leaflet from 'leaflet';
import { browserHistory, withRouter, WithRouterProps } from 'react-router';

// Services & utils
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// Components
import Map, { Props as MapProps } from 'components/Map';
import IdeaBox, { Props as IdeaBoxProps } from './IdeaBox';
import IdeaButton from './IdeaButton';
import { Message } from 'semantic-ui-react';

// Injectors
import GetIdeaMarkers from 'utils/resourceLoaders/components/GetIdeaMarkers';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const StyledMap = styled<MapProps>(Map)`
  flex: 1;
  height: 400px;
  width: 100%;

  ${media.biggerThanPhone`
    flex-basis: 60%;
    height: 600px;
  `}
`;

const StyledBox = styled<IdeaBoxProps>(IdeaBox)`
  flex: 1;
  flex-basis: 100%;

  ${media.biggerThanPhone`
    flex-basis: 40%;
  `}
`;

const MapWrapper = styled.div`
  display: flex;
  height: 400px;
  margin-bottom: 2rem;

  ${media.biggerThanPhone`
    height: 600px;
  `}

  > .create-idea-wrapper {
    display: none;
  }
`;

// Typing
import { IIdeaData } from 'services/ideas';

interface Props {
  projectId?: string;
  phaseId?: string;
}

interface State {
  selectedIdea: string | null;
}

class IdeasMap extends React.PureComponent<Props & WithRouterProps, State> {
  private createIdeaButton: HTMLDivElement;
  private savedPosition: Leaflet.LatLng | null = null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      selectedIdea: null,
    };
  }

  getPoints = (ideas: Partial<IIdeaData>[] | null) => {
    const ideaPoints: any[] = [];

    if (ideas && ideas.length > 0) {      
      ideas.forEach((idea) => {
        if (idea.attributes && idea.attributes.location_point_geojson) {
          ideaPoints.push({
            ...idea.attributes.location_point_geojson,
            id: idea.id
          });
        }
      });
    }

    return ideaPoints;
  }

  selectIdea = (id) => {
    trackEvent(tracks.clickOnIdeaMapMarker, { ideaId: id });
    this.setState({ selectedIdea: id });
  }

  deselectIdea = () => {
    this.setState({ selectedIdea: null });
  }

  onMapClick = ({ map, position }: {map: Leaflet.Map, position: Leaflet.LatLng}) => {
    this.savedPosition = position;

    Leaflet
      .popup()
      .setLatLng(position)
      .setContent(this.createIdeaButton)
      .openOn(map);

    return;
  }

  redirectToIdeaCreation = () => {
    if (this.savedPosition && this.props.params && this.props.params.slug) {
      trackEvent(tracks.createIdeaFromMap, { position: this.savedPosition, projectSlug: this.props.params.slug });
      browserHistory.push(`/projects/${this.props.params.slug}/ideas/new?position=[${this.savedPosition.lat},${this.savedPosition.lng}]`);
    }
  }

  bindIdeaCreationButton = (element: HTMLDivElement) => {
    if (element) {
      this.createIdeaButton = element;
    }
  }

  render() {
    const { phaseId, projectId } = this.props;

    return (
      <GetIdeaMarkers projectId={projectId} phaseId={phaseId}>
        {({ ideaMarkers }) => {
          const { selectedIdea } = this.state;
          const points = this.getPoints(ideaMarkers);

          return (
            <>
              {ideaMarkers && ideaMarkers.length > 0 && points.length === 0 &&
                <Message info>
                  <FormattedMessage {...messages.noIdeasWithLocation} />
                </Message>
              }

              <MapWrapper>
                {selectedIdea &&
                  <StyledBox
                    idea={selectedIdea}
                    onClose={this.deselectIdea}
                  />
                }

                <StyledMap
                  points={points}
                  onMarkerClick={this.selectIdea}
                  onMapClick={this.onMapClick}
                />

                <div className="create-idea-wrapper" ref={this.bindIdeaCreationButton}>
                  <IdeaButton
                    projectId={projectId}
                    phaseId={phaseId}
                    onClick={this.redirectToIdeaCreation}
                  />
                </div>
              </MapWrapper>
            </>
          );
        }}
      </GetIdeaMarkers>
    );
  }
}

export default withRouter(IdeasMap);
