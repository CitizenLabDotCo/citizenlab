import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
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
import GetInitiativeMarkers, { GetInitiativeMarkersChildProps } from 'resources/GetInitiativeMarkers';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// Typing
import { IGeotaggedInitiativeData } from 'services/Initiatives';

const Container = styled.div`
  > .create-Initiative-wrapper {
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
  projectIds?: string[] | null;
  phaseId?: string | null;
  className?: string;
}

interface DataProps {
  InitiativeMarkers: GetInitiativeMarkersChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  selectedInitiativeId: string | null;
  points: Point[];
}

export class InitiativesMap extends PureComponent<Props & WithRouterProps, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedInitiativeId: null,
      points: []
    };
  }

  componentDidMount() {
    const points = this.getPoints(this.props.InitiativeMarkers);
    this.setState({ points });
  }

  componentDidUpdate(prevProps: Props) {
    if (prevProps.InitiativeMarkers !== this.props.InitiativeMarkers) {
      const points = this.getPoints(this.props.InitiativeMarkers);
      this.setState({ points });
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

  noInitiativesWithLocationMessage = <FormattedMessage {...messages.noInitiativesWithLocation} />;

  render() {
    const { phaseId, projectIds, InitiativeMarkers, className } = this.props;
    const { selectedInitiativeId, points } = this.state;

    return (
      <Container className={className}>
        {InitiativeMarkers && InitiativeMarkers.length > 0 && points.length === 0 &&
          <StyledWarning text={this.noInitiativesWithLocationMessage} />
        }

        <StyledMap
          points={points}
          onMarkerClick={this.toggleInitiative}
          fitBounds={true}
          boxContent={selectedInitiativeId ? <InitiativePreview InitiativeId={selectedInitiativeId} /> : null}
          onBoxClose={this.deselectInitiative}
        />
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  InitiativeMarkers: ({ projectIds, phaseId, render }) => <GetInitiativeMarkers projectIds={projectIds} phaseId={phaseId}>{render}</GetInitiativeMarkers>
});

const InitiativesMapWithRouter = withRouter(InitiativesMap);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <InitiativesMapWithRouter {...inputProps} {...dataProps} />}
  </Data>
);
