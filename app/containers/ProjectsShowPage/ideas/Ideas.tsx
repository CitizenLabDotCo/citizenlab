import React from 'react';

// components
import IdeaCards from 'components/IdeaCards';

// styling
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  type: 'project' | 'phase';
  id: string;
  defaultView: 'card' | 'map' | null;
}

interface State {}

export default class Ideas extends React.PureComponent<Props, State> {
  render() {
    const { type, id, defaultView } = this.props;
    const queryParameters = { [type]: id };

    return (
      <Container>
        <IdeaCards
          inputQueryParameters={queryParameters}
          showViewToggle={true}
          defaultView={defaultView}
        />
      </Container>
    );
  }
}
