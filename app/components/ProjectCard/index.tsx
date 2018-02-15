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
  height: 200px;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 200px;
  display: flex;
  border-radius: 4px;
  margin-right: 10px;
  overflow: hidden;
  position: relative;

  ${media.smallerThanMaxTablet`
    width: 100%;
    flex-basis: 150px;
    margin: 0;
  `}
`;

const ProjectImagePlaceholder = styled.div`
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
  flex: 1;
  background-image: url(${(props: any) => props.imageSrc});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: cover;
`;

const Container = styled(Link)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  padding: 16px;
  margin-bottom: 25px;
  background: #fff;
  cursor: pointer;
  background: #fff;
  border-radius: 5px;
  overflow: hidden;
  border: solid 1px #e4e4e4;
  /* box-shadow: 0 1px 1px 0 rgba(10, 16, 34, .2); */

  ${media.biggerThanMaxTablet`
    min-height: 222px;
  `}

  ${media.smallerThanMaxTablet`
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 15px;
  `}
`;

const ProjectContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  padding-top: 10px;
  padding-bottom: 15px;
  margin-right: 40px;
  margin-left: 30px;

  ${media.smallerThanMaxTablet`
    align-items: flex-start;
    margin: 0;
    padding: 15px;
    padding-top: 0px;
  `}
`;

const ProjectContentInner = styled.div`
  display: flex;
  flex-direction: column;
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
`;

const ProjectDescription = styled.div`
  color: ${(props) => props.theme.colors.label};
  font-size: 16px;
  line-height: 24px;
  font-weight: 300;
  margin-top: 20px;
`;

const ProjectMetaItems = styled.div`
  color: ${(props) => props.theme.colorMain};
  color: ${(props) => props.theme.colors.label};
  font-size: 16px;
  font-weight: 400;
  line-height: 20px;
  display: flex;
  margin-top: 25px;

  ${media.smallerThanMaxTablet`
    display: none;
  `}
`;

const ProjectMetaItem = styled.div`
  display: flex;
  align-items: center;
`;

const ProjectMetaIcon = styled(Icon)`
  height: 24px;
  fill: ${(props) => props.theme.colorMain};
  fill: ${(props) => props.theme.colors.label};
  margin-right: 6px;
  margin-top: -6px;
`;

const ProjectButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-right: 20px;

  ${media.smallerThanMaxTablet`
    width: 100%;
    margin-right: 0px;
    margin-top: 20px;
    margin-bottom: 10px;
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
    const projectUrl = (projectType === 'timeline' ? `${rootProjectUrl}/process` : `${rootProjectUrl}/ideas`);

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

            {/* <ProjectImageOverlay /> */}
          </ProjectImageContainer>

          <ProjectContent>
            <ProjectContentInner>
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
            </ProjectContentInner>
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
