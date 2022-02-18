import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { popup, LatLng, Map as LeafletMap } from 'leaflet';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription } from 'rxjs';

// Utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// Components
import Map, { Point } from 'components/Map';
import Warning from 'components/UI/Warning';
import InitiativePreview from './InitiativePreview';

// Events
import {
  leafletMapSelectedMarker$,
  leafletMapClicked$,
} from 'components/UI/LeafletMap/events';

// Resources
import GetInitiativeMarkers, {
  GetInitiativeMarkersChildProps,
} from 'resources/GetInitiativeMarkers';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';

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
  id: string;
  ariaLabelledBy: string;
}

interface DataProps {
  initiativeMarkers: GetInitiativeMarkersChildProps;
  windowSize: GetWindowSizeChildProps;
  initiativePermissions: GetInitiativesPermissionsChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedInitiativeId: string | null;
  points: Point[];
  lat?: number | null;
  lng?: number | null;
  map?: LeafletMap | null;
}

export class InitiativesMap extends PureComponent<
  Props & WithRouterProps,
  State
> {
  private addInitiativeButtonElement: HTMLElement;
  private subscriptions: Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      selectedInitiativeId: null,
      points: [],
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      leafletMapSelectedMarker$.subscribe((InitiativeId) => {
        if (InitiativeId) {
          this.handleInitiativeMarkerSelected(InitiativeId);
        }
      }),
      leafletMapClicked$.subscribe((latLng) => {
        this.handleMapClicked(latLng);
      }),
    ];

    const points = this.getPoints(this.props.initiativeMarkers);
    this.setState({ points });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.initiativeMarkers !== this.props.initiativeMarkers) {
      const points = this.getPoints(this.props.initiativeMarkers);
      this.setState({ points });
    }
  }

  componentWillUnmount() {
    this.subscriptions?.forEach((subscription) => subscription.unsubscribe());
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

  deselectInitiative = () => {
    this.setState({ selectedInitiativeId: null });
  };

  handleMapOnInit = (map: LeafletMap) => {
    this.setState({ map });
  };

  handleInitiativeMarkerSelected = (InitiativeId: string) => {
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

  handleMapClicked = (position: LatLng) => {
    const { lat, lng } = position;
    const { map } = this.state;

    this.setState({ lat, lng });

    if (this.addInitiativeButtonElement && position && map) {
      popup()
        .setLatLng(position)
        .setContent(this.addInitiativeButtonElement)
        .openOn(map);
    }

    return;
  };

  noInitiativesWithLocationMessage = (
    <FormattedMessage {...messages.noInitiativesWithLocation} />
  );

  render() {
    const {
      initiativeMarkers,
      className,
      initiativePermissions,
      ariaLabelledBy,
      id,
    } = this.props;
    const { selectedInitiativeId, points, lat, lng } = this.state;

    if (!isNilOrError(initiativePermissions)) {
      const { enabled } = initiativePermissions;
      const proposalSubmissionEnabled = enabled === true || enabled === 'maybe';

      return (
        <Container
          className={className}
          aria-labelledBy={ariaLabelledBy}
          id={id}
          tabIndex={0}
        >
          {initiativeMarkers &&
            initiativeMarkers.length > 0 &&
            points.length === 0 && (
              <StyledWarning text={this.noInitiativesWithLocationMessage} />
            )}

          <Map
            onInit={this.handleMapOnInit}
            points={points}
            boxContent={
              selectedInitiativeId ? (
                <InitiativePreview initiativeId={selectedInitiativeId} />
              ) : null
            }
            onBoxClose={this.deselectInitiative}
          />

          <div
            className="create-initiative-wrapper"
            ref={this.bindInitiativeCreationButton}
          >
            {proposalSubmissionEnabled ? (
              <InitiativeButton location="in_map" lat={lat} lng={lng} />
            ) : (
              <Warning>
                <FormattedMessage {...messages.newProposalsNotPermitted} />
              </Warning>
            )}
          </div>
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  initiativeMarkers: <GetInitiativeMarkers />,
  windowSize: <GetWindowSize />,
  initiativePermissions: (
    <GetInitiativesPermissions action="posting_initiative" />
  ),
});

const InitiativesMapWithRouter = withRouter(InitiativesMap);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <InitiativesMapWithRouter {...inputProps} {...dataProps} />}
  </Data>
);
