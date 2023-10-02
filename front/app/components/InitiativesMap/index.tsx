import React, { PureComponent, useState } from 'react';
import { adopt } from 'react-adopt';
import { popup, LatLng, Map as LeafletMap } from 'leaflet';
import { isNilOrError } from 'utils/helperUtils';
import { Subscription } from 'rxjs';

// router
import { useSearchParams } from 'react-router-dom';
import { updateSearchParams } from 'utils/cl-router/updateSearchParams';

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
  setLeafletMapSelectedMarker,
} from 'components/UI/LeafletMap/events';

// Resources
import GetInitiativeMarkers, {
  GetInitiativeMarkersChildProps,
} from 'resources/GetInitiativeMarkers';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';

// Typing
import { IGeotaggedInitiativeData } from 'api/initiative_markers/types';
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
  id?: string;
  ariaLabelledBy?: string;
}

interface DataProps {
  initiativeMarkers: GetInitiativeMarkersChildProps;
  initiativePermissions: GetInitiativesPermissionsChildProps;
}

interface Props extends InputProps, DataProps {
  selectedInitiativeMarkerId: string | null;
  initiallySelectedMarkerId: string | null;
}

interface State {
  points: Point[];
  lat?: number | null;
  lng?: number | null;
  map?: LeafletMap | null;
}

export class InitiativesMap extends PureComponent<Props, State> {
  private addInitiativeButtonElement: HTMLElement;
  private subscriptions: Subscription[];

  constructor(props: Props) {
    super(props);
    this.state = {
      points: [],
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    this.subscriptions = [
      leafletMapSelectedMarker$.subscribe((initiativeId) => {
        this.handleInitiativeMarkerSelected(initiativeId);
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
    initiatives: IGeotaggedInitiativeData[] | null | undefined | Error
  ) => {
    const initiativePoints: Point[] = [];

    if (!isNilOrError(initiatives) && initiatives.length > 0) {
      initiatives.forEach((initiative) => {
        if (
          initiative.attributes &&
          initiative.attributes.location_point_geojson
        ) {
          initiativePoints.push({
            ...initiative.attributes.location_point_geojson,
            id: initiative.id,
          });
        }
      });
    }

    return initiativePoints;
  };

  deselectInitiative = () => {
    setLeafletMapSelectedMarker(null);
  };

  handleMapOnInit = (map: LeafletMap) => {
    this.setState({ map });
  };

  handleInitiativeMarkerSelected = (initiativeId: string | null) => {
    trackEventByName(tracks.clickOnInitiativeMapMarker, {
      extra: { initiativeId },
    });

    updateSearchParams({ initiative_map_id: initiativeId });
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

  render() {
    const {
      selectedInitiativeMarkerId,
      initiallySelectedMarkerId,
      initiativeMarkers,
      className,
      initiativePermissions,
      ariaLabelledBy,
      id,
    } = this.props;
    const { points, lat, lng } = this.state;

    if (!isNilOrError(initiativePermissions)) {
      const { enabled } = initiativePermissions;
      const proposalSubmissionEnabled = enabled === true || enabled === 'maybe';

      return (
        <Container
          className={className}
          aria-labelledby={ariaLabelledBy}
          id={id}
          tabIndex={0}
        >
          {initiativeMarkers &&
            initiativeMarkers.length > 0 &&
            points.length === 0 && (
              <StyledWarning>
                <FormattedMessage {...messages.noInitiativesWithLocation} />
              </StyledWarning>
            )}
          <Map
            initialSelectedPointId={initiallySelectedMarkerId ?? undefined}
            onInit={this.handleMapOnInit}
            points={points}
            boxContent={
              selectedInitiativeMarkerId ? (
                <InitiativePreview initiativeId={selectedInitiativeMarkerId} />
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
  initiativePermissions: (
    <GetInitiativesPermissions action="posting_initiative" />
  ),
});

export default (inputProps: InputProps) => {
  const [searchParams] = useSearchParams();
  const selectedInitiativeMarkerId = searchParams.get('initiative_map_id');
  const [initiallySelectedMarkerId] = useState<string | null>(
    selectedInitiativeMarkerId
  );

  return (
    <Data {...inputProps}>
      {(dataProps) => (
        <InitiativesMap
          selectedInitiativeMarkerId={selectedInitiativeMarkerId}
          initiallySelectedMarkerId={initiallySelectedMarkerId}
          {...inputProps}
          {...dataProps}
        />
      )}
    </Data>
  );
};
