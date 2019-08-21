import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import Leaflet from 'leaflet';
import clHistory from 'utils/cl-router/history';

import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';

// Utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// Components
import Map, { Point } from 'components/Map';
import Warning from 'components/UI/Warning';
import Button from 'components/UI/Button';
import InitiativePreview from './InitiativePreview';

// Resources
import GetInitiativeMarkers, { GetInitiativeMarkersChildProps } from 'resources/GetInitiativeMarkers';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// Typing
import { IGeotaggedInitiativeData } from 'services/initiatives';

const Container = styled.div`
  > .create-initiative-wrapper {
    display: none;
  }
`;

const StyledWarning = styled(Warning)`
  margin-bottom: 10px;
`;

const StyledMap = styled(Map)`
  height: 600px;

  ${media.smallerThanMaxTablet`
    height: 500px;
  `}

  ${media.smallerThanMinTablet`
    height: 400px;
  `}
`;

interface InputProps {
  className?: string;
}

interface DataProps {
  initiativeMarkers: GetInitiativeMarkersChildProps;
}

interface Props extends InputProps, DataProps { }

interface State {
  selectedInitiativeId: string | null;
  points: Point[];
}

export class InitiativesMap extends PureComponent<Props & WithRouterProps, State> {
  private addInitiativeButtonElement: HTMLElement;
  private savedPosition: Leaflet.LatLng | null = null;

  constructor(props) {
    super(props);
    this.state = {
      selectedInitiativeId: null,
      points: []
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
  }

  getPoints = (Initiatives: IGeotaggedInitiativeData[] | null | undefined | Error) => {
    const InitiativePoints: Point[] = [];

    if (!isNilOrError(Initiatives) && Initiatives.length > 0) {
      Initiatives.forEach((Initiative) => {
        if (Initiative.attributes && Initiative.attributes.location_point_geojson) {
          InitiativePoints.push({
            ...Initiative.attributes.location_point_geojson,
            id: Initiative.id
          });
        }
      });
    }

    return InitiativePoints;
  }

  toggleInitiative = (InitiativeId: string) => {
    trackEventByName(tracks.clickOnInitiativeMapMarker, { extra: { InitiativeId } });

    this.setState(({ selectedInitiativeId }) => {
      return { selectedInitiativeId: (InitiativeId !== selectedInitiativeId ? InitiativeId : null) };
    });
  }

  deselectInitiative = () => {
    this.setState({ selectedInitiativeId: null });
  }

  onMapClick = (map: Leaflet.Map, position: Leaflet.LatLng) => {
    this.savedPosition = position;

    if (this.addInitiativeButtonElement) {
      Leaflet
        .popup()
        .setLatLng(position)
        .setContent(this.addInitiativeButtonElement)
        .openOn(map);
    }

    return;
  }

  redirectToInitiativeCreation = () => {
    if (this.savedPosition) {
      trackEventByName(tracks.createInitiativeFromMap, { position: this.savedPosition });

      clHistory.push({
        pathname: '/initiatives/new',
        query: { position: `[${this.savedPosition.lat}, ${this.savedPosition.lng}]` }
      });
    }
  }

  noInitiativesWithLocationMessage = <FormattedMessage {...messages.noInitiativesWithLocation} />;

  render() {
    const { initiativeMarkers, className } = this.props;
    const { selectedInitiativeId, points } = this.state;

    return (
      <Container className={className}>
        {initiativeMarkers && initiativeMarkers.length > 0 && points.length === 0 &&
          <StyledWarning text={this.noInitiativesWithLocationMessage} />
        }

        <StyledMap
          points={points}
          onMarkerClick={this.toggleInitiative}
          fitBounds={true}
          boxContent={selectedInitiativeId ? <InitiativePreview initiativeId={selectedInitiativeId} /> : null}
          onBoxClose={this.deselectInitiative}
          onMapClick={this.onMapClick}
        />

        <div className="create-initiative-wrapper" ref={this.bindInitiativeCreationButton}>
          <Button
            onClick={this.redirectToInitiativeCreation}
            icon="plus-circle"
            size="2"
            text={<FormattedMessage {...messages.postInitiativeHere} />}
          />
        </div>
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  initiativeMarkers: <GetInitiativeMarkers />
});

const InitiativesMapWithRouter = withRouter(InitiativesMap);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <InitiativesMapWithRouter {...inputProps} {...dataProps} />}
  </Data>
);
