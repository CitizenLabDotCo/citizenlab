import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import Leaflet from 'leaflet';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

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
  points: Point[];
  selectedIdeaId: string | null;
  selectedLatLng: Leaflet.LatLng | null;
}

export class IdeasMap extends PureComponent<Props & WithRouterProps, State> {
  ideaButtonRef: HTMLElement;

  constructor(props) {
    super(props);
    this.state = {
      points: [],
      selectedIdeaId: null,
      selectedLatLng: null
    };
  }

  static getDerivedStateFromProps(props: Props & WithRouterProps, _state: State) {
    const { ideaMarkers } = props;
    const ideaPoints: Point[] = [];

    if (!isNilOrError(ideaMarkers) && ideaMarkers.length > 0) {
      ideaMarkers.forEach((ideaMarker) => {
        if (ideaMarker.attributes && ideaMarker.attributes.location_point_geojson) {
          ideaPoints.push({
            ...ideaMarker.attributes.location_point_geojson,
            id: ideaMarker.id
          });
        }
      });
    }

    return { points: ideaPoints };
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
    this.setState({ selectedLatLng: position });

    if (this.props.projectIds && this.ideaButtonRef) {
      Leaflet
        .popup()
        .setLatLng(position)
        .setContent(this.ideaButtonRef)
        .openOn(map);
    }

    return;
  }

  setIdeaButtonRef = (element: HTMLDivElement) => {
    this.ideaButtonRef = element;
  }

  getMapHeight = () => {
    const { windowSize } = this.props;
    const smallerThanMaxTablet = windowSize ? windowSize <= viewportWidths.largeTablet : false;
    const smallerThanMinTablet = windowSize ? windowSize <= viewportWidths.smallTablet : false;
    const height = smallerThanMinTablet ? 400 : (smallerThanMaxTablet ? 500 : 550);
    return height;
  }

  noIdeasWithLocationMessage = <FormattedMessage {...messages.noIdeasWithLocation} />;

  render() {
    const { phaseId, projectIds, ideaMarkers, className } = this.props;
    const { selectedIdeaId, points, selectedLatLng: selectedPosition } = this.state;
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
          projectId={projectIds && projectIds.length === 1 ? projectIds[0] : null}
        />

        {projectIds && projectIds.length === 1 &&
          <div className="create-idea-wrapper" ref={this.setIdeaButtonRef}>
            <IdeaButton
              projectId={projectIds[0]}
              phaseId={phaseId || undefined}
              participationContextType={phaseId ? 'phase' : 'project'}
              latLng={selectedPosition}
            />
          </div>
        }
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  windowSize: <GetWindowSize />,
  ideaMarkers: ({ projectIds, phaseId, render }) => <GetIdeaMarkers projectIds={projectIds} phaseId={phaseId}>{render}</GetIdeaMarkers>
});

const IdeasMapWithRouter = withRouter(IdeasMap);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeasMapWithRouter {...inputProps} {...dataProps} />}
  </Data>
);
