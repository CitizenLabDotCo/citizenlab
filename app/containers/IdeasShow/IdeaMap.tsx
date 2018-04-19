// Libraries
import React from 'react';

// Components
import Map from 'components/Map';

// styling
import styled from 'styled-components';

const MapWrapper = styled.div`
  height: 265px;
`;

interface Props {
  location: GeoJSON.Point;
  id: string;
}

interface State {}

export default class IdeaMap extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {};
  }

  render() {
    const points: any = [{ ...this.props.location }];
    const center = this.props.location.coordinates;

    return (
      <MapWrapper>
        <Map
          points={points}
          center={center}
        />
      </MapWrapper>
    );
  }
}
