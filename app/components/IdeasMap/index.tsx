// Libs
import React, { PureComponent } from 'react';
import Leaflet from 'leaflet';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// Services & utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// Components
import Map from 'components/Map';
import Warning from 'components/UI/Warning';
import IdeaBox from './IdeaBox';
import IdeaButton from './IdeaAddButton';

// Injectors
import GetIdeaMarkers, { GetIdeaMarkersChildProps } from 'resources/GetIdeaMarkers';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// Typing
import { IGeotaggedIdeaData } from 'services/ideas';

const timeout = 40000;

const StyledWarning = styled(Warning)`
  margin-bottom: 10px;
`;

const MapWrapper = styled.div`
  height: 600px;
  display: flex;
  align-items: stretch;
  margin-bottom: 2rem;

  ${media.smallerThanMaxTablet`
    height: 500px;
  `}

  ${media.smallerThanMinTablet`
    height: 400px;
  `}

  .create-idea-wrapper {
    display: none;
  }
`;

const StyledIdeaBox = styled(IdeaBox)`
  flex: 0 0 400px;

  ${media.smallerThanMaxTablet`
    flex: 0 0 40%;
  `}

  ${media.smallerThanMinTablet`
    flex: 0 0 80%;
  `}
`;

const StyledMap = styled(Map)`
  flex: 1;
  height: 100%;
  transition: all ${timeout}ms cubic-bezier(0.165, 0.84, 0.44, 1);

  ${media.biggerThanPhone`
    flex-basis: 60%;
  `}
`;

interface InputProps {
  projectIds?: string[] | null;
  phaseId?: string | null;
}

interface DataProps {
  ideaMarkers: GetIdeaMarkersChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedIdeaId: string | null;
}

export class IdeasMap extends PureComponent<Props & WithRouterProps, State> {
  private createIdeaButton: HTMLDivElement;
  private savedPosition: Leaflet.LatLng | null = null;

  constructor(props) {
    super(props);
    this.state = {
      selectedIdeaId: null,
    };
  }

  getPoints = (ideas: IGeotaggedIdeaData[] | null | undefined | Error) => {
    const ideaPoints: any[] = [];

    if (!isNilOrError(ideas) && ideas.length > 0) {
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

  toggleIdea = (ideaId: string) => {
    trackEventByName(tracks.clickOnIdeaMapMarker, { extra: { ideaId } });

    this.setState(({ selectedIdeaId }) => {
      return { selectedIdeaId: (ideaId !== selectedIdeaId ? ideaId : null) };
    });
  }

  deselectIdea = () => {
    this.setState({ selectedIdeaId: null });
  }

  onMapClick = (map: Leaflet.Map, position: Leaflet.LatLng) => {
    this.savedPosition = position;

    if (this.props.projectIds) {
      Leaflet
        .popup()
        .setLatLng(position)
        .setContent(this.createIdeaButton)
        .openOn(map);
    }

    return;
  }

  redirectToIdeaCreation = () => {
    if (this.savedPosition && this.props.params && this.props.params.slug) {
      trackEventByName(tracks.createIdeaFromMap, { position: this.savedPosition, projectSlug: this.props.params.slug });
      clHistory.push({
        pathname: `/projects/${this.props.params.slug}/ideas/new`,
        query: { position: `[${this.savedPosition.lat}, ${this.savedPosition.lng}]` }
      });
    }
  }

  bindIdeaCreationButton = (element: HTMLDivElement) => {
    if (element) {
      this.createIdeaButton = element;
    }
  }

  noIdeasWithLocationMessage = <FormattedMessage {...messages.noIdeasWithLocation} />;

  render() {
    const { phaseId, projectIds, ideaMarkers } = this.props;
    const { selectedIdeaId } = this.state;
    const points = this.getPoints(ideaMarkers);

    return (
      <>
        {ideaMarkers && ideaMarkers.length > 0 && points.length === 0 &&
          <StyledWarning text={this.noIdeasWithLocationMessage} />
        }

        <MapWrapper>
          {selectedIdeaId &&
            <StyledIdeaBox
              ideaId={selectedIdeaId}
              onClose={this.deselectIdea}
            />
          }

          <StyledMap
            points={points}
            onMarkerClick={this.toggleIdea}
            onMapClick={this.onMapClick}
            fitBounds={true}
          />

          {projectIds && projectIds.length === 1 &&
            <div className="create-idea-wrapper" ref={this.bindIdeaCreationButton}>
              <IdeaButton
                projectId={projectIds[0]}
                phaseId={phaseId}
                onClick={this.redirectToIdeaCreation}
              />
            </div>
          }
        </MapWrapper>
      </>
    );
  }
}

const IdeasMapWithRouter = withRouter(IdeasMap);

export default (inputProps: InputProps) => (
  <GetIdeaMarkers projectIds={inputProps.projectIds} phaseId={inputProps.phaseId}>
    {ideaMarkers => <IdeasMapWithRouter {...inputProps} ideaMarkers={ideaMarkers} />}
  </GetIdeaMarkers>
);
