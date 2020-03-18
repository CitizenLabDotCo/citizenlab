import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import Leaflet from 'leaflet';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';
import { stringify } from 'qs';

// Tracking
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// Components
import Map, { Point } from 'components/Map';
import Warning from 'components/UI/Warning';
import IdeaPreview from './IdeaPreview';
import IdeaButton from 'components/IdeaButton';

// Resources
import GetIdeaMarkers, { GetIdeaMarkersChildProps } from 'resources/GetIdeaMarkers';
import GetWindowSize, { GetWindowSizeChildProps } from 'resources/GetWindowSize';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

// Typing
import { IGeotaggedIdeaData } from 'services/ideas';

const Container = styled.div`
  > .create-idea-wrapper {
    display: none;
  }
`;

const StyledWarning = styled(Warning)`
  margin-bottom: 10px;
`;

interface InputProps {
  projectIds?: string[] | null;
  phaseId?: string | null;
  className?: string;
}

interface DataProps {
  ideaMarkers: GetIdeaMarkersChildProps;
  windowSize: GetWindowSizeChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedIdeaId: string | null;
  points: Point[];
}

export class IdeasMap extends PureComponent<Props & WithRouterProps, State> {
  private addIdeaButtonElement: HTMLElement;
  private savedPosition: Leaflet.LatLng | null = null;

  constructor(props) {
    super(props);
    this.state = {
      selectedIdeaId: null,
      points: []
    };
  }

  componentDidMount() {
    const points = this.getPoints(this.props.ideaMarkers);
    this.setState({ points });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.ideaMarkers !== this.props.ideaMarkers) {
      const points = this.getPoints(this.props.ideaMarkers);
      this.setState({ points });
    }
  }

  getPoints = (ideas: IGeotaggedIdeaData[] | null | undefined | Error) => {
    const ideaPoints: Point[] = [];

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

    if (this.props.projectIds && this.addIdeaButtonElement) {
      Leaflet
        .popup()
        .setLatLng(position)
        .setContent(this.addIdeaButtonElement)
        .openOn(map);
    }

    return;
  }

  redirectToIdeaCreation = () => {
    if (this.savedPosition && this.props.params && this.props.params.slug) {
      const { lat, lng } = this.savedPosition;

      trackEventByName(tracks.createIdeaFromMap, { position: this.savedPosition, projectSlug: this.props.params.slug });

      clHistory.push({
        pathname: `/projects/${this.props.params.slug}/ideas/new`,
        search: stringify({ lat, lng }, { addQueryPrefix: true })
      });
    }
  }

  bindIdeaCreationButton = (element: HTMLDivElement) => {
    if (element) {
      this.addIdeaButtonElement = element;
    }
  }

  getMapHeight = () => {
    const { windowSize } = this.props;
    const smallerThanMaxTablet = windowSize ? windowSize <= viewportWidths.largeTablet : false;
    const smallerThanMinTablet = windowSize ? windowSize <= viewportWidths.smallTablet : false;
    let height = 550;

    if (smallerThanMinTablet) {
      height = 400;
    }

    if (smallerThanMaxTablet) {
      height = 500;
    }

    return height;
  }

  noIdeasWithLocationMessage = <FormattedMessage {...messages.noIdeasWithLocation} />;

  render() {
    const { phaseId, projectIds, ideaMarkers, className } = this.props;
    const { selectedIdeaId, points } = this.state;
    const mapHeight = this.getMapHeight();

    return (
      <Container className={className}>
        {ideaMarkers && ideaMarkers.length > 0 && points.length === 0 &&
          <StyledWarning text={this.noIdeasWithLocationMessage} />
        }

        <ScreenReaderOnly>
          <FormattedMessage {...messages.mapTitle} />
        </ScreenReaderOnly>

        <Map
          points={points}
          onMarkerClick={this.toggleIdea}
          onMapClick={this.onMapClick}
          fitBounds={true}
          boxContent={selectedIdeaId ? <IdeaPreview ideaId={selectedIdeaId} /> : null}
          onBoxClose={this.deselectIdea}
          mapHeight={mapHeight}
        />

        {projectIds && projectIds.length === 1 &&
          <div className="create-idea-wrapper" ref={this.bindIdeaCreationButton}>
            <IdeaButton
              projectId={projectIds[0]}
              phaseId={phaseId || undefined}
              onClick={this.redirectToIdeaCreation}
              participationContextType={phaseId ? 'phase' : 'project'}
            />
          </div>
        }
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  ideaMarkers: ({ projectIds, phaseId, render }) => <GetIdeaMarkers projectIds={projectIds} phaseId={phaseId}>{render}</GetIdeaMarkers>,
  windowSize: <GetWindowSize />
});

const IdeasMapWithRouter = withRouter(IdeasMap);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeasMapWithRouter {...inputProps} {...dataProps} />}
  </Data>
);
