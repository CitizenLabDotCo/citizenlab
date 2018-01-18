// Libs
import * as React from 'react';
import { flow } from 'lodash';
import Leaflet from 'leaflet';
import { browserHistory, withRouter } from 'react-router';

// Components
import Map, { Props as MapProps } from 'components/Map';
import IdeaBox, { Props as IdeaBoxProps } from './IdeaBox';
import Button from 'components/UI/Button';

// Injectors
import GetIdeas from 'utils/resourceLoaders/components/GetIdeas';
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
interface Props {
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

  constructor(props) {
    super(props);

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
      browserHistory.push(`/projects/${this.props.params.slug}/ideas/new?location=[${this.savedPosition.lat},${this.savedPosition.lng}]`);
    }
  }

  bindIdeaCreationButton = (element) => {
    if (!this.createIdeaButton) this.createIdeaButton = element;
  }

  render() {
    return (
      <GetIdeas project={this.props.project} markers>
        {({ ideaMarkers }) => (
          <MapWrapper>
            {this.state.selectedIdea &&
              <StyledBox idea={this.state.selectedIdea} onClose={this.deselectIdea} />
            }
            <StyledMap center={[0, 0]} points={this.getPoints(ideaMarkers)} onMarkerClick={this.selectIdea} onMapClick={this.onMapClick} />
            <div className="create-idea-wrapper" ref={this.bindIdeaCreationButton}>
              <Button onClick={this.redirectToIdeaCreation} icon="plus-circle">
                <FormattedMessage {...messages.postIdeaHere} />
              </Button>
            </div>
          </MapWrapper>
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
