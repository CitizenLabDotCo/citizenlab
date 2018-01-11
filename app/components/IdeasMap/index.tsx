// Libs
import * as React from 'react';
import { find } from 'lodash';
import Leaflet from 'leaflet';

// Components
import Map, { Props as MapProps } from 'components/Map';
import IdeaBox, { Props as IdeaBoxProps } from './IdeaBox';

// Styling
import styled from 'styled-components';

const StyledMap = styled<MapProps>(Map)`
  flex: 2;
  height: 600px;
`;

const StyledBox = styled<IdeaBoxProps>(IdeaBox)`
  flex: 1;
`;

const MapWrapper = styled.div`
  display: flex;
  margin-bottom: 2rem;
`;

// Typing
import { IIdeaData } from 'services/ideas';
interface Props {
  ideas?: IIdeaData[];
}

interface State {
  selectedIdea: IIdeaData | null;
}

export default class IdeasMap extends React.Component<Props, State> {
  private ideaPoints: any[] = [];
  private leafletElement: Leaflet;

  constructor(props) {
    super(props);

    this.updatePoints(props.ideas);
    this.state = {
      selectedIdea: null,
    };
  }

  componentWillReceiveProps(props) {
    this.updatePoints(props.ideas);
  }

  updatePoints = (ideas: IIdeaData[]) => {
    if (ideas) {
      this.ideaPoints = [];
      ideas.forEach((idea) => {
        if (idea.attributes.location_point_geojson) this.ideaPoints.push({ ...idea.attributes.location_point_geojson, data: idea.id });
      });
    }
  }

  selectIdea = (id) => {
    this.setState({ selectedIdea: find(this.props.ideas, { id }) as IIdeaData });
    if (this.leafletElement) this.leafletElement.invalidateSize();
  }

  deselectIdea = () => {
    this.setState({ selectedIdea: null });
    if (this.leafletElement) this.leafletElement.invalidateSize();
  }

  bindMap = (mapComponent) => {
    if (!this.leafletElement && mapComponent.leafletElement) this.leafletElement = mapComponent.leafletElement;
  }

  render() {
    return (
      <MapWrapper>
        {this.state.selectedIdea &&
          <StyledBox idea={this.state.selectedIdea} />
        }
        <StyledMap points={this.ideaPoints} onMarkerClick={this.selectIdea} ref={this.bindMap} />
      </MapWrapper>
    );
  }
}
