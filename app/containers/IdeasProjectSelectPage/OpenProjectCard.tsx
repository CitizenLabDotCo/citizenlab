import * as React from 'react';
import styled from 'styled-components';

import { IProjectData } from 'services/projects';
import T from 'components/T';

const Container = styled.div`

`;

type Props = {
  project: IProjectData;
};

type State = {};

class OpenProjectCard extends React.Component<Props, State> {

  render() {
    const { title_multiloc: titleMultiloc } = this.props.project.attributes;
    return (
      <Container>
        <T value={titleMultiloc} />
      </Container>
    );
  }
}

export default OpenProjectCard;
