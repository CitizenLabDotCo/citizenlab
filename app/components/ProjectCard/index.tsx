import * as React from 'react';
import * as Rx from 'rxjs/Rx';

// router
import { browserHistory, Link } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectByIdStream, IProject } from 'services/projects';
import { projectImageStream, IProjectImage } from 'services/projectImages';

// i18n
import T from 'components/T';
import { getLocalized } from 'utils/i18n';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, color } from 'utils/styleUtils';
import { Locale } from 'typings';

const ProjectImage: any = styled.div`
  flex-basis: 176px;
  flex-shrink: 0;
  flex-grow: 0;
  width: 176px;
  min-height: 176px;
  border-radius: 6px;
  margin-right: 10px;
  background-image: url(${(props: any) => props.imageSrc});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
  overflow: hidden;
  opacity: 0.9;
  transition: opacity 250ms ease-out;
  will-change: opacity;

  ${media.smallerThanMaxTablet`
    width: 100%;
    margin: 0;
  `}
`;

const Container = styled(Link)`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 20px;
  background: #fff;
  border: solid 1px #e0e0e0;
  cursor: pointer;
  background: #fff;
  border: solid 1px #f8f8f8;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0px 1px 3px rgba(0, 0, 0, 0.15);
  transition: transform 250ms ease-out;
  will-change: transform;

  &:hover {
    transform: scale(1.008);

    ${ProjectImage} {
      opacity: 1;
    }
  }

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    align-items: left;
    padding: 20px;
  `}
`;

const ProjectImagePlaceholder = styled.div`
  flex-basis: 176px;
  flex-shrink: 0;
  flex-grow: 0;
  width: 176px;
  height: 176px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  margin-right: 10px;
  background: ${color('placeholderBg')};
  overflow: hidden;

  ${media.smallerThanMaxTablet`
    width: 100%;
    margin: 0;
  `}
`;

const ProjectImagePlaceholderIcon = styled(Icon) `
  height: 45px;
  fill: #fff;
`;

const ProjectContent = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-right: 30px;
  margin-left: 30px;
  padding-top: 15px;
  padding-bottom: 15px;

  ${media.smallerThanMaxTablet`
    margin: 0;
  `}

  ${media.phone`
    width: 100%;
    margin: 0;
    align-items: center;
  `}
`;

const ProjectTitle = styled.h3`
  color: #333;
  font-size: 23px;
  line-height: 29px;
  font-weight: 500;
  margin: 0;
  padding: 0;

  ${media.smallerThanMaxTablet`
    padding-top: 20px;
  `}

  ${media.phone`
    flex: 1;
    display: flex;
    justify-content: center;
    text-align: center;
  `}
`;

const ProjectDescription = styled.div`
  color: #84939E;
  font-size: 16px;
  line-height: 22px;
  font-weight: 300;
  margin-top: 12px;

  ${media.phone`
    display: none;
  `}
`;

const ProjectButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;

  ${media.smallerThanMaxTablet`
    width: 100%;
    margin-top: 20px;
  `}

  ${media.phone`
    align-items: center;
    justify-content: center;
  `}
`;

const ProjectButton = styled(Button) ``;

type Props = {
  id: string;
};

type State = {
  locale: Locale | null,
  currentTenant: ITenant | null;
  project: IProject | null;
  projectImage: IProjectImage | null;
};

class ProjectCard extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      project: null,
      projectImage: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { id } = this.props;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const project$ = projectByIdStream(id).observable.switchMap((project) => {
      const projectImages = project.data.relationships.project_images.data;

      if (projectImages && projectImages.length > 0) {
        return projectImageStream(project.data.id, projectImages[0].id).observable.map(projectImage => ({ project, projectImage }));
      }

      return Rx.Observable.of({ project, projectImage: null });
    });

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        project$
      ).subscribe(([locale, currentTenant, { project, projectImage }]) => {
        this.setState({ locale, currentTenant, project, projectImage });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  getProjectUrl = (project: IProject) => {
    const projectType = project.data.attributes.process_type;
    const rootProjectUrl = `/projects/${project.data.attributes.slug}`;
    const projectUrl = (projectType === 'timeline' ? `${rootProjectUrl}/timeline` : `${rootProjectUrl}/ideas`);

    return projectUrl;
  }

  goToProject = () => {
    const { project } = this.state;

    if (project) {
      const projectUrl = this.getProjectUrl(project);
      browserHistory.push(projectUrl);
    }
  }

  render() {
    const { locale, currentTenant, project, projectImage } = this.state;

    if (locale && currentTenant && project) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const titleMultiloc = project.data.attributes.title_multiloc;
      const preview = getLocalized(project.data.attributes.description_preview_multiloc, locale, currentTenantLocales);
      const imageUrl = (projectImage ? projectImage.data.attributes.versions.medium : null);
      const projectUrl = this.getProjectUrl(project);

      return (
        <Container to={projectUrl}>
          {imageUrl && <ProjectImage imageSrc={imageUrl} />}

          {!imageUrl &&
            <ProjectImagePlaceholder>
              <ProjectImagePlaceholderIcon name="project" />
            </ProjectImagePlaceholder>
          }

          <ProjectContent>
            <ProjectTitle>
              <T value={titleMultiloc} />
            </ProjectTitle>
            <ProjectDescription>
              {preview}
            </ProjectDescription>
          </ProjectContent>

          <ProjectButtonWrapper>
            <ProjectButton
              onClick={this.goToProject}
              text={<FormattedMessage {...messages.openProjectButton} />}
              style="primary-outlined"
              size="2"
              circularCorners={false}
            />
          </ProjectButtonWrapper>

        </Container>
      );
    }

    return null;
  }
}

export default ProjectCard;
