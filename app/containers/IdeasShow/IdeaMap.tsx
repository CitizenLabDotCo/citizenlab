// Libraries
import * as React from 'react';

// Components
import { Map, Marker, TileLayer } from 'react-leaflet';

// Typing
interface Props {
  location: {
    type: 'Point';
    coordinates: number[];
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
      <Map center={coordinates} zoom={13}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution=""
        />
        <Marker position={coordinates} />
      </Map>
    );
  }
}
