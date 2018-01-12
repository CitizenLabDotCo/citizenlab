// Libs
import * as React from 'react';

// Components
import Map, { Props as MapProps } from 'components/Map';
import IdeaBox, { Props as IdeaBoxProps } from './IdeaBox';
import GetIdeas from 'utils/resourceLoaders/components/GetIdeas';

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
  height: 600px;
  margin-bottom: 2rem;
`;

// Typing
import { IIdeaData } from 'services/ideas';
interface Props {
  project?: string;
  phase?: string;
  topics?: string[];
  areas?: string[];
}

interface State {
  selectedIdea: string | null;
}

class IdeasMap extends React.Component<Props, State> {
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
        if (idea.attributes && idea.attributes.location_point_geojson) ideaPoints.push({ ...idea.attributes.location_point_geojson, data: idea.id });
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

  render() {
    return (
      <GetIdeas project={this.props.project} markers>
        {({ ideaMarkers }) => (
          <MapWrapper>
            {this.state.selectedIdea &&
              <StyledBox idea={this.state.selectedIdea} onClose={this.deselectIdea} />
            }
            <StyledMap points={this.getPoints(ideaMarkers)} onMarkerClick={this.selectIdea} />
          </MapWrapper>
        )}
      </GetIdeas>
    );
  }
}

export default IdeasMap;
