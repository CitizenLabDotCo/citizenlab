// Libs
import * as React from 'react';
import { flow } from 'lodash';
import { renderToStaticMarkup } from 'react-dom/server';
import Leaflet from 'leaflet';

// Components
import Map, { Props as MapProps } from 'components/Map';
import IdeaBox, { Props as IdeaBoxProps } from './IdeaBox';

// Injectors
import GetIdeas from 'utils/resourceLoaders/components/GetIdeas';
import { injectTenant, InjectedTenant } from 'utils/resourceLoaders/tenantLoader';
import { injectLocale, InjectedLocale } from 'utils/resourceLoaders/localeLoader';

// i18n
import { IntlProvider } from 'react-intl';
import FormattedMessage from 'utils/cl-intl/FormattedMessage';
import messages from './messages';

// Styling
import styled, { ThemeProvider } from 'styled-components';
import { media } from 'utils/styleUtils';

const StyledMap = styled<MapProps>(Map)`
  flex: 1;
  height: 400px;

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
`;

// Typing
import { IIdeaData } from 'services/ideas';
import Button from 'components/UI/Button';
import { browserHistory } from 'react-router';
interface Props {
  project?: string;
  phase?: string;
  topics?: string[];
  areas?: string[];
}

interface State {
  selectedIdea: string | null;
}

class IdeasMap extends React.Component<Props & InjectedTenant & InjectedLocale, State> {
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
    function openIdeaCreation() {
      browserHistory.push(`/ideas/new/?latlng=${position.lat}.${position.lng}`);
    }

    Leaflet.popup()
    .setLatLng(position)
    .setContent(renderToStaticMarkup(
      <IntlProvider locale={this.props.locale}>
        <ThemeProvider theme={{ colorMain: this.props.tenant ? this.props.tenant.attributes.settings.core.color_main : '#ef0071' }}>
          <Button onClick={openIdeaCreation} icon="plus-circle">
            <FormattedMessage {...messages.postIdeaHere} />
          </Button>
        </ThemeProvider>
      </IntlProvider>
    ))
    .openOn(map);

    return;
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
          </MapWrapper>
        )}
      </GetIdeas>
    );
  }
}

export default flow([
  injectTenant(),
  injectLocale(),
])(IdeasMap);
