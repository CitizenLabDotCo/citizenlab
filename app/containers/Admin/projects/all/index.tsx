import * as React from 'react';
import { sortBy, get } from 'lodash';
import * as Rx from 'rxjs/Rx';

// style
import styled from 'styled-components';
import { color } from 'utils/styleUtils';

// services
import { projectsStream, IProjects } from 'services/projects';

// localisation
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';
import messages from '../messages';

// components
import { Link } from 'react-router';
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

const Title = styled.h1`
  color: #333;
  font-size: 35px;
  line-height: 40px;
  font-weight: 600;
  margin: 0;
  padding: 0;
  margin-bottom: 30px;
`;

const ProjectsList = styled.ul`
  display: flex;
  flex-wrap: wrap;
  list-style: none;
  margin: 0;
  margin: -5px;
  margin-bottom: 50px;
  padding: 0;
`;

const ProjectImage = styled.img`
  width: 100%;
  height: 100px;
  border-radius: 5px;
  object-fit: cover;
`;

const ProjectImagePlaceholder = styled.div`
  width: 100%;
  height: 100px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 5px;
  background: ${color('placeholderBg')};
`;

const ProjectImagePlaceholderIcon = styled(Icon) `
  height: 50px;
  fill: #fff;
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
  font-weight: 400;
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
  width: 260px;
  height: 250px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  margin: 10px;
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
  height: 28px;
  fill: #999;
  transition: all 100ms ease-out;
`;

const AddProjectText = styled.div`
  color: #999;
  font-size: 17px;
  line-height: 23px;
  font-weight: 400;
  text-align: center;
  margin-top: 8px;
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

  constructor(props) {
    super(props);
    this.state = {
      projects: null,
    };
  }

  componentDidMount() {
    const projects$ = projectsStream().observable;
    this.subscription = projects$.subscribe((unsortedProjects) => {
      const projects = sortBy(unsortedProjects.data, (project) => project.attributes.created_at).reverse();
      this.setState({ projects: { data: projects } });
    });
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render () {
    const { projects } = this.state;

    return (
      <>
        <Title>
          <FormattedMessage {...messages.overviewPageTitle} />
        </Title>

        <ProjectsList className="e2e-projects-list">

          <AddProjectCard className="new-project e2e-new-project">
            <AddProjectLink to="/admin/projects/new">
              <AddProjectIcon name="plus-circle" />
              <AddProjectText>
                <FormattedMessage {...messages.addNewProject} />
              </AddProjectText>
            </AddProjectLink>
          </AddProjectCard>

          {projects && projects.data && projects.data.map((project) => {
            const projectImage = get(project, 'attributes.header_bg.small', null);

            return (
              <ProjectCard key={project.id} className="e2e-project-card">

                {projectImage && <ProjectImage src={projectImage} alt="" role="presentation" />}

                {!projectImage &&
                  <ProjectImagePlaceholder>
                    <ProjectImagePlaceholderIcon name="project" />
                  </ProjectImagePlaceholder>
                }

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
      </>
    );
  }
}
