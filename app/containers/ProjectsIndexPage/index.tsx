import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import HelmetIntl from 'components/HelmetIntl';
import ProjectCards from 'components/ProjectCards';
import ContentContainer from 'components/ContentContainer';

// style
import styled from 'styled-components';

// i18n
import messages from './messages';

const Container = styled.div`
  margin-top: 40px;
`;

export default class ProjectsIndexPage extends React.PureComponent<{}, {}> {
  render() {
    return (
      <div>
        <HelmetIntl title={messages.helmetTitle} description={messages.helmetDescription} />
        <ContentContainer>
          <Container>
            <ProjectCards />
          </Container>
        </ContentContainer>
      </div>
    );
  }
}
