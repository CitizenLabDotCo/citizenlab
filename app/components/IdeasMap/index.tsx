import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { popup, LatLng, Map as LeafletMap } from 'leaflet';
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
import GetIdeaMarkers, {
  GetIdeaMarkersChildProps,
} from 'resources/GetIdeaMarkers';
import GetWindowSize, {
  GetWindowSizeChildProps,
} from 'resources/GetWindowSize';
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div`
  > .create-idea-wrapper {
    display: none;
  }
`;

const IdeaButtonWrapper = styled.div``;

const StyledMap = styled(Map)`
  height: calc(100vh - 300px);
  max-height: 750px;

  ${media.smallerThan1100px`
    height: calc(100vh - 180px);
  `}
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
  project: GetProjectChildProps;
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {
  points: Point[];
  selectedIdeaId: string | null;
  selectedLatLng: LatLng | null;
}

export class IdeasMap extends PureComponent<Props & WithRouterProps, State> {
  ideaButtonRef: HTMLElement;

  constructor(props) {
    super(props);
    this.state = {
      points: [],
      selectedIdeaId: null,
      selectedLatLng: null,
    };
  }

  static getDerivedStateFromProps(
    props: Props & WithRouterProps,
    _state: State
  ) {
    const { ideaMarkers } = props;
    const ideaPoints: Point[] = [];

    if (!isNilOrError(ideaMarkers) && ideaMarkers.length > 0) {
      ideaMarkers.forEach((ideaMarker) => {
        if (
          ideaMarker.attributes &&
          ideaMarker.attributes.location_point_geojson
        ) {
          ideaPoints.push({
            ...ideaMarker.attributes.location_point_geojson,
            id: ideaMarker.id,
          });
        }
      });
    }

    return { points: ideaPoints };
  }

  toggleIdea = (ideaId: string) => {
    trackEventByName(tracks.clickOnIdeaMapMarker, { extra: { ideaId } });

    this.setState(({ selectedIdeaId }) => {
      return { selectedIdeaId: ideaId !== selectedIdeaId ? ideaId : null };
    });
  };

  deselectIdea = () => {
    this.setState({ selectedIdeaId: null });
  };

  onMapClick = (map: LeafletMap, position: LatLng) => {
    this.setState({ selectedLatLng: position });
    const { project, phase } = this.props;
    const ideaPostingEnabled =
      (!isNilOrError(project) && project.attributes.posting_enabled) ||
      (!isNilOrError(phase) && phase.attributes.posting_enabled);

    if (ideaPostingEnabled && this.ideaButtonRef) {
      popup().setLatLng(position).setContent(this.ideaButtonRef).openOn(map);
    }

    return;
  };

  setIdeaButtonRef = (element: HTMLDivElement) => {
    this.ideaButtonRef = element;
  };

  render() {
    const { phaseId, projectIds, ideaMarkers, className } = this.props;
    const {
      selectedIdeaId,
      points,
      selectedLatLng: selectedPosition,
    } = this.state;
    const projectId =
      projectIds && projectIds.length === 1 ? projectIds[0] : null;

    return (
      <Container className={className}>
        {ideaMarkers && ideaMarkers.length > 0 && points.length === 0 && (
          <StyledWarning
            text={<FormattedMessage {...messages.nothingOnMapWarning} />}
          />
        )}

        <ScreenReaderOnly>
          <FormattedMessage {...messages.a11y_mapTitle} />
        </ScreenReaderOnly>

        <StyledMap
          points={points}
          onMarkerClick={this.toggleIdea}
          onMapClick={this.onMapClick}
          fitBounds={true}
          boxContent={
            selectedIdeaId ? <IdeaPreview ideaId={selectedIdeaId} /> : null
          }
          onBoxClose={this.deselectIdea}
          projectId={
            projectIds && projectIds.length === 1 ? projectIds[0] : null
          }
        />

        {projectId && (
          <IdeaButtonWrapper
            className="create-idea-wrapper"
            ref={this.setIdeaButtonRef}
          >
            <IdeaButton
              projectId={projectId}
              phaseId={phaseId || undefined}
              participationContextType={phaseId ? 'phase' : 'project'}
              latLng={selectedPosition}
              inMap={true}
            />
          </IdeaButtonWrapper>
        )}
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  project: ({ params, render }) => (
    <GetProject projectSlug={params.slug}>{render}</GetProject>
  ),
  windowSize: <GetWindowSize />,
  ideaMarkers: ({ projectIds, phaseId, render }) => (
    <GetIdeaMarkers projectIds={projectIds} phaseId={phaseId}>
      {render}
    </GetIdeaMarkers>
  ),
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {(dataProps) => <IdeasMap {...inputProps} {...dataProps} />}
  </Data>
));
