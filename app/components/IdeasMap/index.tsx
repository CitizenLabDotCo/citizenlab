// Libs
import * as React from 'react';

// Components
import Map, { Props as MapProps } from 'components/Map';
import IdeaBox, { Props as IdeaBoxProps } from './IdeaBox';
import GetIdeas from 'utils/resourceLoaders/components/GetIdeas';

// Styling
import styled from 'styled-components';
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

  render() {
    return (
      <GetIdeas project={this.props.project} markers>
        {({ ideaMarkers }) => (
          <MapWrapper>
            {this.state.selectedIdea &&
              <StyledBox idea={this.state.selectedIdea} onClose={this.deselectIdea} />
            }
            <StyledMap center={[0, 0]} points={this.getPoints(ideaMarkers)} onMarkerClick={this.selectIdea} />
          </MapWrapper>
        )}
      </GetIdeas>
    );
  }
}

export default IdeasMap;
