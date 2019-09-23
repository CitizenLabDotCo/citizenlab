import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import Leaflet from 'leaflet';
import { withRouter, WithRouterProps } from 'react-router';
import { isNilOrError } from 'utils/helperUtils';
import clHistory from 'utils/cl-router/history';

// Utils
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// Components
import Map, { Point } from 'components/Map';
import Warning from 'components/UI/Warning';
import IdeaPreview from './IdeaPreview';
import IdeaAddButton from './IdeaAddButton';

// Resources
import GetIdeaMarkers, { GetIdeaMarkersChildProps } from 'resources/GetIdeaMarkers';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { media, invisibleA11yText } from 'utils/styleUtils';

// Typing
import { IGeotaggedIdeaData } from 'services/ideas';

const Container = styled.div`
  > .create-idea-wrapper {
    display: none;
  }
`;

const MapTitle = styled.span`
  &.screenreader-only {
    ${invisibleA11yText}
  }
`;

const StyledWarning = styled(Warning)`
  margin-bottom: 10px;
`;

const StyledMap = styled(Map)`
  height: 550px;

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
  ideaMarkers: GetIdeaMarkersChildProps;
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
      trackEventByName(tracks.createIdeaFromMap, { position: this.savedPosition, projectSlug: this.props.params.slug });

      clHistory.push({
        pathname: `/projects/${this.props.params.slug}/ideas/new`,
        query: { position: `[${this.savedPosition.lat}, ${this.savedPosition.lng}]` }
      });
    }
  }

  bindIdeaCreationButton = (element: HTMLDivElement) => {
    if (element) {
      this.addIdeaButtonElement = element;
    }
  }

  noIdeasWithLocationMessage = <FormattedMessage {...messages.noIdeasWithLocation} />;

  render() {
    const { phaseId, projectIds, ideaMarkers, className } = this.props;
    const { selectedIdeaId, points } = this.state;

    return (
      <Container className={className}>
        {ideaMarkers && ideaMarkers.length > 0 && points.length === 0 &&
          <StyledWarning text={this.noIdeasWithLocationMessage} />
        }

        <MapTitle className="screenreader-only">
          <FormattedMessage {...messages.mapTitle} />
        </MapTitle>

        <StyledMap
          points={points}
          onMarkerClick={this.toggleIdea}
          onMapClick={this.onMapClick}
          fitBounds={true}
          boxContent={selectedIdeaId ? <IdeaPreview ideaId={selectedIdeaId} /> : null}
          onBoxClose={this.deselectIdea}
        />

        {projectIds && projectIds.length === 1 &&
          <div className="create-idea-wrapper" ref={this.bindIdeaCreationButton}>
            <IdeaAddButton
              projectId={projectIds[0]}
              phaseId={phaseId}
              onClick={this.redirectToIdeaCreation}
            />
          </div>
        }
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  ideaMarkers: ({ projectIds, phaseId, render }) => <GetIdeaMarkers projectIds={projectIds} phaseId={phaseId}>{render}</GetIdeaMarkers>
});

const IdeasMapWithRouter = withRouter(IdeasMap);

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <IdeasMapWithRouter {...inputProps} {...dataProps} />}
  </Data>
);
