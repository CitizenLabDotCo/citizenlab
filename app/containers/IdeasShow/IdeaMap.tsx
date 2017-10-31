// Libraries
import * as React from 'react';
import Leaflet from 'leaflet';

// Components
import Map from 'components/Map';

// styling
import 'leaflet/dist/leaflet.css';
import styled from 'styled-components';

const MapWrapper = styled.div`
  height: 300px;

  .leaflet-container {
    height: 100%;
  }
`;

const customIcon = Leaflet.icon({
  iconUrl: ''
});

// Typing
interface Props {
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  visible: boolean;
}

interface State {
}

export default class IdeaMap extends React.Component<Props, State> {
  constructor(props: Props) {
    super();

    this.state = {};
  }

  render() {
    const { coordinates } = this.props.location;

    return (
      <Map center={coordinates} points={[coordinates]} />
    );
  }
}
