// Libs
import * as React from 'react';
import { flow, pick } from 'lodash';
import Leaflet from 'leaflet';
import { browserHistory, withRouter } from 'react-router';

// Services & utils
import { trackEvent } from 'utils/analytics';
import tracks from './tracks';

// Components
import Map, { Props as MapProps } from 'components/Map';
import IdeaBox, { Props as IdeaBoxProps } from './IdeaBox';
import IdeaButton from './IdeaButton';
import { Message } from 'semantic-ui-react';

// Injectors
import GetIdeas, { SearchQueryProps } from 'utils/resourceLoaders/components/GetIdeas';
import { injectTenant, InjectedTenant } from 'utils/resourceLoaders/tenantLoader';
import { injectLocale, InjectedLocale } from 'utils/resourceLoaders/localeLoader';

// i18n
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const StyledMap = styled<MapProps>(Map)`
  flex: 1;
  height: 400px;
  width: 100%;

  ${media.biggerThanPhone`
    flex-basis: 60%;
    height: 600px;
  `}
`;

const StyledBox = styled<IdeaBoxProps>(IdeaBox)`
  flex: 1;
  flex-basis: 100%;

  ${media.biggerThanPhone`
    flex-basis: 40%;
  `}
`;

const MapWrapper = styled.div`
  display: flex;
  height: 400px;
  margin-bottom: 2rem;

  ${media.biggerThanPhone`
    height: 600px;
  `}

  > .create-idea-wrapper {
    display: none;
  }
`;

// Typing
import { IIdeaData } from 'services/ideas';
interface Props extends SearchQueryProps {
  project?: string;
  phase?: string;
  topics?: string[];
  areas?: string[];
  params?: {
    [key: string]: string | number;
  };
}

interface State {
  selectedIdea: string | null;
}

class IdeasMap extends React.Component<Props & InjectedTenant & InjectedLocale, State> {
  private createIdeaButton: HTMLElement;
  private savedPosition: Leaflet.LatLng | null = null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      selectedIdea: null,
    };
  }

  getPoints = (ideas: Partial<IIdeaData>[]) => {
    if (ideas) {
      const ideaPoints: any[] = [];
      ideas.forEach((idea) => {
        if (idea.attributes && idea.attributes.location_point_geojson) ideaPoints.push({ ...idea.attributes.location_point_geojson, id: idea.id });
      });
      return ideaPoints;
    } else {
      return [];
    }
  }

  selectIdea = (id) => {
    trackEvent(tracks.clickOnIdeaMapMarker, { ideaId: id });
    this.setState({ selectedIdea: id });
  }

  deselectIdea = () => {
    this.setState({ selectedIdea: null });
  }

  onMapClick = ({ map, position }: {map: Leaflet.Map, position: Leaflet.LatLng}): void => {
    this.savedPosition = position;

    Leaflet.popup()
    .setLatLng(position)
    .setContent(this.createIdeaButton)
    .openOn(map);

    return;
  }

  redirectToIdeaCreation = () => {
    if (this.savedPosition && this.props.params && this.props.params.slug) {
      trackEvent(tracks.createIdeaFromMap, { position: this.savedPosition, projectSlug: this.props.params.slug });
      browserHistory.push(`/projects/${this.props.params.slug}/ideas/new?location=[${this.savedPosition.lat},${this.savedPosition.lng}]`);
    }
  }

  bindIdeaCreationButton = (element) => {
    if (!this.createIdeaButton) this.createIdeaButton = element;
  }

  render() {
    const searchProps = pick(this.props, 'areas', 'currentPageNumber', 'pageSize', 'phase', 'project', 'searchTerm', 'sortAttribute', 'sortDirection', 'status', 'topics');

    return (
      <GetIdeas {...searchProps} markers>
        {({ ideaMarkers }) => (
          <React.Fragment>
            {ideaMarkers.length > 0 && this.getPoints(ideaMarkers).length === 0 &&
              <Message info>
                <FormattedMessage {...messages.noIdeasWithLocation} />
              </Message>
            }
            <MapWrapper>
              {this.state.selectedIdea &&
                <StyledBox idea={this.state.selectedIdea} onClose={this.deselectIdea} />
              }
              <StyledMap points={this.getPoints(ideaMarkers)} onMarkerClick={this.selectIdea} onMapClick={this.onMapClick} />
              <div className="create-idea-wrapper" ref={this.bindIdeaCreationButton}>
                <IdeaButton
                  phaseId={this.props.phase}
                  projectId={this.props.project}
                  onClick={this.redirectToIdeaCreation}
                />
              </div>
            </MapWrapper>
          </React.Fragment>
        )}
      </GetIdeas>
    );
  }
}

export default flow([
  withRouter,
  injectTenant(),
  injectLocale(),
])(IdeasMap);
