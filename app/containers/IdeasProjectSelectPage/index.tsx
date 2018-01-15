import * as React from 'react';
import { flow } from 'lodash';
import styled from 'styled-components';
import { injectResources, InjectedResourcesLoaderProps } from 'utils/resourceLoaders/resourcesLoader';

import { projectsStream, IProjectData } from 'services/projects';

import ProjectCard from './ProjectCard';
import OpenProjectCard from './OpenProjectCard';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';


const Container = styled.div`
  display: flex;
  flex-direction: row;
`;

const PageTitle = styled.h1`

`;

const LeftColumn = styled.div`

`;

const RightColumn = styled.div`

`;

const ColumnTitle = styled.h2`

`;

const ColumnSubtitle = styled.h3`

`;

type Props = {};

type State = {};

class IdeasProjectSelectPage extends React.Component<Props & InjectedResourcesLoaderProps<IProjectData>, State> {

  hasOpenProject = () => {
    return true;
  }

  render() {
    const projects = this.props.projects.all;
    const hasOpenProject = this.hasOpenProject();

    return (
      <Container>
        <PageTitle>
          <FormattedMessage {...messages.pageTitle} />
        </PageTitle>
        <LeftColumn>
          <ColumnTitle>
            <FormattedMessage {...messages.cityProjects} />
          </ColumnTitle>
          <ColumnSubtitle>
            <FormattedMessage {...messages.cityProjectsExplanation} />
          </ColumnSubtitle>
          {projects && projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
            />
          ))}
        </LeftColumn>
        {projects && hasOpenProject &&
          <RightColumn>
            <ColumnTitle>
              <FormattedMessage {...messages.openProject} />
            </ColumnTitle>
            <ColumnSubtitle>
              <FormattedMessage {...messages.openProjectExplanation} />
            </ColumnSubtitle>
            <OpenProjectCard
              project={projects[0]}
            />
          </RightColumn>
        }
      </Container>
    );
  }
}

export default injectResources('projects', projectsStream)(IdeasProjectSelectPage);
