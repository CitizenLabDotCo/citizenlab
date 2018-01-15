import * as React from 'react';
import { flow } from 'lodash';
import styled from 'styled-components';

import T from 'components/T';
import { IProjectData } from 'services/projects';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';


const Container = styled.div`

`;

type Props = {
  project: IProjectData;
};

type State = {

};

class ProjectCard extends React.Component<Props, State> {

  render() {
    const { title_multiloc: titleMultiloc } = this.props.project.attributes;
    return (
      <Container>
        <T value={titleMultiloc} />
      </Container>
    );
  }
}

export default ProjectCard;
