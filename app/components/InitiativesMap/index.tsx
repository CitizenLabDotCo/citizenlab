import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import Leaflet from 'leaflet';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

// Utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// Components
import Map, { Point } from 'components/Map';
import Warning from 'components/UI/Warning';
import InitiativePreview from './InitiativePreview';

// Resources
import GetInitiativeMarkers, {
  GetInitiativeMarkersChildProps,
} from 'resources/GetInitiativeMarkers';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { viewportWidths } from 'utils/styleUtils';

// Typing
import { IGeotaggedInitiativeData } from 'services/initiatives';
import InitiativeButton from 'components/InitiativeButton';

const Container = styled.div`
  > .create-initiative-wrapper {
    display: none;
  }
`;

const StyledWarning = styled(Warning)`
  margin-bottom: 10px;
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  initiativeMarkers: GetInitiativeMarkersChildProps;
  windowSize: GetWindowSizeChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedInitiativeId: string | null;
  points: Point[];
  lat?: number | null;
  lng?: number | null;
}

export class InitiativesMap extends PureComponent<
  Props & WithRouterProps,
  State
> {
  private addInitiativeButtonElement: HTMLElement;

  constructor(props) {
    super(props);
    this.state = {
      selectedInitiativeId: null,
      points: [],
    };
  }

  componentDidMount() {
    const points = this.getPoints(this.props.initiativeMarkers);
    this.setState({ points });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.initiativeMarkers !== this.props.initiativeMarkers) {
      const points = this.getPoints(this.props.initiativeMarkers);
      this.setState({ points });
    }
  }

  bindInitiativeCreationButton = (element: HTMLDivElement) => {
    if (element) {
      this.addInitiativeButtonElement = element;
    }
  };

  getPoints = (
    Initiatives: IGeotaggedInitiativeData[] | null | undefined | Error
  ) => {
    const InitiativePoints: Point[] = [];

    if (!isNilOrError(Initiatives) && Initiatives.length > 0) {
      Initiatives.forEach((Initiative) => {
        if (
          Initiative.attributes &&
          Initiative.attributes.location_point_geojson
        ) {
          InitiativePoints.push({
            ...Initiative.attributes.location_point_geojson,
            id: Initiative.id,
          });
        }
      });
    }

    return InitiativePoints;
  };

  toggleInitiative = (InitiativeId: string) => {
    trackEventByName(tracks.clickOnInitiativeMapMarker, {
      extra: { InitiativeId },
    });

    this.setState(({ selectedInitiativeId }) => {
      return {
        selectedInitiativeId:
          InitiativeId !== selectedInitiativeId ? InitiativeId : null,
      };
    });
  };

  deselectInitiative = () => {
    this.setState({ selectedInitiativeId: null });
  };

  onMapClick = (map: Leaflet.Map, position: Leaflet.LatLng) => {
    const { lat, lng } = position;
    this.setState({ lat, lng });

    if (this.addInitiativeButtonElement) {
      Leaflet.popup()
        .setLatLng(position)
        .setContent(this.addInitiativeButtonElement)
        .openOn(map);
    }

    return;
  };

  getMapHeight = () => {
    const { windowSize } = this.props;
    const smallerThanMaxTablet = windowSize
      ? windowSize <= viewportWidths.largeTablet
      : false;
    const smallerThanMinTablet = windowSize
      ? windowSize <= viewportWidths.smallTablet
      : false;
    let height = 550;

    if (smallerThanMinTablet) {
      height = 400;
    }

    if (smallerThanMaxTablet) {
      height = 500;
    }

    return height;
  };

  noInitiativesWithLocationMessage = (
    <FormattedMessage {...messages.noInitiativesWithLocation} />
  );

  render() {
    const { initiativeMarkers, className } = this.props;
    const { selectedInitiativeId, points, lat, lng } = this.state;
    const mapHeight = this.getMapHeight();

    return (
      <Container className={className}>
        {initiativeMarkers &&
          initiativeMarkers.length > 0 &&
          points.length === 0 && (
            <StyledWarning text={this.noInitiativesWithLocationMessage} />
          )}

        <Map
          points={points}
          onMarkerClick={this.toggleInitiative}
          boxContent={
            selectedInitiativeId ? (
              <InitiativePreview initiativeId={selectedInitiativeId} />
            ) : null
          }
          onBoxClose={this.deselectInitiative}
          onMapClick={this.onMapClick}
          mapHeight={mapHeight}
        />

        <div
          className="create-initiative-wrapper"
          ref={this.bindInitiativeCreationButton}
        >
          <InitiativeButton location="in_map" inMap lat={lat} lng={lng} />
        </div>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  initiativeMarkers: <GetInitiativeMarkers />,
  windowSize: <GetWindowSize />,
});

const InitiativesMapWithRouter = withRouter(InitiativesMap);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <InitiativesMapWithRouter {...inputProps} {...dataProps} />}
  </Data>
);
