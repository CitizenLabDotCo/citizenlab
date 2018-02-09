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
import { FormattedMessage, injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media, color } from 'utils/styleUtils';
import { Locale } from 'typings';

const ProjectImageContainer =  styled.div`
  width: 180px;
  height: 180px;
  flex-basis: 180px;
  flex-shrink: 0;
  flex-grow: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  margin-right: 10px;
  overflow: hidden;
  position: relative;

  ${media.smallerThanMaxTablet`
    width: 100%;
    margin: 0;
  `}
`;

const ProjectImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${color('placeholderBg')};
`;

const ProjectImagePlaceholderIcon = styled(Icon) `
  height: 45px;
  fill: #fff;
`;

const ProjectImage: any = styled.div`
  width: 100%;
  height: 100%;
  flex: 1;
  background-image: url(${(props: any) => props.imageSrc});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
`;

const ProjectImageOverlay = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: #fff;
  opacity: 0.1;
  transition: opacity 250ms ease-out;
`;

const Container = styled(Link)`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 25px;
  background: #fff;
  cursor: pointer;
  background: #fff;
  border-radius: 5px;
  overflow: hidden;
  border: solid 1px #e4e4e4;
  transition: transform 250ms ease-out;
  will-change: transform;

  &:hover {
    transform: scale(1.008);

    ${ProjectImageOverlay} {
      opacity: 0;
    }
  }

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    align-items: left;
    padding: 20px;
  `}
`;

const ProjectContent = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-right: 30px;
  margin-left: 30px;
  padding-top: 15px;
  padding-bottom: 20px;

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
  color: #576773;
  font-size: 18px;
  line-height: 26px;
  font-weight: 300;
  margin-top: 10px;

  ${media.phone`
    display: none;
  `}
`;

const ProjectMetaItems = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  display: flex;
  margin-top: 30px;
`;

const ProjectMetaItem = styled.div`
  display: flex;
  align-items: center;
`;

const ProjectMetaIcon = styled(Icon)`
  height: 24px;
  fill: ${(props) => props.theme.colors.label};
  margin-right: 8px;
  margin-top: -6px;
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

class ProjectCard extends React.PureComponent<Props & InjectedIntlProps, State> {
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

  componentDidMount() {
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
    const className = this.props['className'];
    const { formatMessage } = this.props.intl;
    const { locale, currentTenant, project, projectImage } = this.state;

    if (locale && currentTenant && project) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const titleMultiloc = project.data.attributes.title_multiloc;
      const preview = getLocalized(project.data.attributes.description_preview_multiloc, locale, currentTenantLocales);
      const imageUrl = (projectImage ? projectImage.data.attributes.versions.medium : null);
      const projectUrl = this.getProjectUrl(project);
      const ideasCount = project.data.attributes.ideas_count;

      return (
        <Container to={projectUrl} className={className}>

          <ProjectImageContainer>
            {imageUrl && <ProjectImage imageSrc={imageUrl} />}

            {!imageUrl &&
              <ProjectImagePlaceholder>
                <ProjectImagePlaceholderIcon name="project" />
              </ProjectImagePlaceholder>
            }

            <ProjectImageOverlay />
          </ProjectImageContainer>

          <ProjectContent>
            <ProjectTitle>
              <T value={titleMultiloc} />
            </ProjectTitle>
            <ProjectDescription>
              {preview}
            </ProjectDescription>
            <ProjectMetaItems>
              <ProjectMetaItem>
                <ProjectMetaIcon name="idea" />
                <FormattedMessage 
                  {...messages.xIdeas} 
                  values={{
                    ideasCount,
                    ideas: formatMessage(messages.ideas),
                    idea: formatMessage(messages.idea)
                  }}
                />
              </ProjectMetaItem>
            </ProjectMetaItems>
          </ProjectContent>

          <ProjectButtonWrapper>
            <ProjectButton
              onClick={this.goToProject}
              text={<FormattedMessage {...messages.openProjectButton} />}
              style="primary"
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

export default injectIntl<Props>(ProjectCard);
