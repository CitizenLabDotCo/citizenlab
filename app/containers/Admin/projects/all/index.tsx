import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// style
import styled from 'styled-components';
import { darken } from 'polished';
import { media } from 'utils/styleUtils';

// services
import { projectsStream, IProjects } from 'services/projects';

// localisation
import { FormattedMessage } from 'react-intl';
import T from 'components/T';
import messages from '../messages';

// components
import { Link } from 'react-router';
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

const headerBG = require('assets/img/gray-header.png');

const ProjectsList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
`;

const ProjectImage = styled.img`
  width: 100%;
  height: 100px;
  border-radius: 5px;
  object-fit: cover;
`;

const ButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 10px;
`;

const GoToProjectButton = styled(Button)``;

const ProjectTitle = styled.h1`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #333;
  font-size: 18px;
  line-height: 22px;
  font-weight: 500;
  text-align: center;
  margin: 0;
  margin-left: 5px;
  margin-right: 5px;
  padding: 0;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-height: 23px;
  max-height: 46px;
`;

const ProjectCard = styled.li`
  width: 270px;
  height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 13px;
  padding: 15px;
  overflow: hidden;
  border-radius: 5px;
  border: solid 1px #e4e4e4;
  background: white;
`;

const AddProjectLink = styled(Link)`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const AddProjectIcon = styled(Icon)`
  height: 30px;
  fill: #999;
  transition: all 100ms ease-out;
`;

const AddProjectText = styled.div`
  color: #999;
  font-size: 20px;
  line-height: 24px;
  font-weight: 400;
  text-align: center;
  margin-top: 15px;
  transition: all 100ms ease-out;
`;

const AddProjectCard = ProjectCard.extend`
  cursor: pointer;
  padding: 0;
  border-color: #999;
  border-width: 1.5px;
  border-style: dashed;
  background: transparent;
  transition: all 100ms ease-out;

  &:hover {
    border-color: #000;

    ${AddProjectIcon} {
      fill: #000;
    }

    ${AddProjectText} {
      color: #000;
    }
  }
`;

type Props = {};

type State = {
  projects: IProjects | null
};

export default class AdminProjectsList extends React.PureComponent<Props, State> {
  subscription: Rx.Subscription;

  constructor () {
    super();
    this.state = {
      projects: null,
    };
  }

  componentDidMount() {
    const projects$ = projectsStream().observable;
    this.subscription = projects$.subscribe((projects) => this.setState({ projects }));
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render () {
    const { projects } = this.state;

    return (
      <ProjectsList className="e2e-projects-list">

        <AddProjectCard className="new-project e2e-new-project">
          <AddProjectLink to="/admin/projects/new">
            <AddProjectIcon name="plus" />
            <AddProjectText>
              <FormattedMessage {...messages.addNewProject} />
            </AddProjectText>
          </AddProjectLink>
        </AddProjectCard>

        {projects && projects.data && projects.data.map((project) => {
          const projectImage = (_.has(project, 'attributes.header_bg.medium') ? project.attributes.header_bg.medium : headerBG);

          return (
            <ProjectCard key={project.id} className="e2e-project-card">

              <ProjectImage src={projectImage} alt="" role="presentation" />

              <ProjectTitle>
                <T value={project.attributes.title_multiloc} />
              </ProjectTitle>

              <ButtonWrapper>
                <GoToProjectButton 
                  style="primary-outlined" 
                  linkTo={`/admin/projects/${project.attributes.slug}/edit`}
                  circularCorners={false}
                >
                  <FormattedMessage {...messages.editProject} />
                </GoToProjectButton>
              </ButtonWrapper>

            </ProjectCard>
          );
        })}

      </ProjectsList>
    );
  }
}
