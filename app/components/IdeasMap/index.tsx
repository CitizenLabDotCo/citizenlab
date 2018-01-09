// Libs
import * as React from 'react';
import { IIdeaData } from 'services/ideas';

// Components
import Map from 'components/Map';

// Typing
interface Props {
  ideas?: IIdeaData[];
}

export default class IdeasMap extends React.Component<Props> {
  private ideaPoints: any[] = [];

  constructor(props) {
    super(props);

    this.updatePoints(props.ideas);
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

  render() {
    return (
      <Map points={this.ideaPoints} onMarkerClick={console.log} />
    );
  }
}
