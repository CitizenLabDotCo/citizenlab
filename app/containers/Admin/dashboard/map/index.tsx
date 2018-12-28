import React, { PureComponent } from 'react';
import styled from 'styled-components';
import GetGeotaggedIdeas, { GetGeotaggedIdeasChildProps } from 'resources/GetGeotaggedIdeas';
import { IGeotaggedIdeaData } from 'services/ideas';
import { isNilOrError } from 'utils/helperUtils';

import MapComponent from 'components/Map';
import IdeaPane from './IdeaPane';

import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

const MapWrapper = styled.div`
  display: flex;
  align-items: stretch;
  height: 600px;
`;

const StyledMap = styled(MapComponent)`
  width: 100%;
  height: 600px;
`;

const StyledIdeaPane = styled(IdeaPane)`
  flex: 0 0 300px;
`;

interface InputProps {}
interface DataProps {
  ideas: GetGeotaggedIdeasChildProps;
}
interface Props extends DataProps, InputProps {}

interface State {
  selectedIdeaId: string | null;
}

class Map extends PureComponent<Props, State> {

  constructor(props) {
    super(props);
    this.state = {
      selectedIdeaId: null,
    };
  }

  getPoints = (ideas: IGeotaggedIdeaData[]) => {
    return ideas
      .filter(idea => idea.attributes.location_point_geojson)
      .map(idea => (
        {
          ...idea.attributes.location_point_geojson,
          id: idea.id,
        }
      ));
  }

  toggleIdea = (id: string) => {
    this.setState(({ selectedIdeaId }) => {
      return { selectedIdeaId: (id !== selectedIdeaId ? id : null) };
    });
  }

  render() {
    const { ideas } = this.props;
    const { selectedIdeaId } = this.state;
    if (isNilOrError(ideas)) return null;

    return (
      <div>
        <p>
          <FormattedMessage {...messages.mapHelperText}/>
        </p>
        <MapWrapper>
          <StyledMap
            points={this.getPoints(ideas)}
            onMarkerClick={this.toggleIdea}
          />
          {selectedIdeaId &&
            <StyledIdeaPane
              ideaId={selectedIdeaId}
            />
          }
        </MapWrapper>
      </div>
    );
  }
}

export default (inputProps: InputProps) => (
  <GetGeotaggedIdeas>
    {ideas => <Map ideas={ideas} {...inputProps} />}
  </GetGeotaggedIdeas>
);
