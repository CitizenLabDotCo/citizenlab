// Libraries
import * as React from 'react';

// Components
import Map from 'components/Map';

// styling
import styled from 'styled-components';

const StyledMap = styled(Map)`
  height: 265px;
`;

// Typing
interface Props {
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
}

interface State {
}

export default class IdeaMap extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {};
  }

  render() {
    const { coordinates } = this.props.location;

    return (
      <StyledMap center={coordinates} points={[coordinates]} />
    );
  }
}
