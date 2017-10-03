import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link, browserHistory } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

// services
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectByIdStream, IProject } from 'services/projects';
import { projectImagesStream, IProjectImages } from 'services/projectImages';

// i18n
import T from 'components/T';
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  border-radius: 6px;
  padding: 10px;
  margin-bottom: 20px;
  background: #fff;
  border: solid 1px #e6e6e6;
  /* box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1); */

  ${media.phone`
    flex-direction: column;
  `}
`;

const ProjectImage: any = styled.div`
  flex-basis: 176px;
  flex-shrink: 0;
  flex-grow: 0;
  width: 176px;
  height: 176px;
  border-radius: 6px;
  margin-right: 10px;
  background-image: url(${(props: any) => props.imageSrc});
  background-repeat: no-repeat;
  background-position: center center;
  background-size: center;
  overflow: hidden;

  ${media.phone`
    width: 100%;
    margin-right: 0px;
  `}
`;

const ProjectImagePlaceholder = styled.div`
  flex-basis: 176px;
  flex-shrink: 0;
  flex-grow: 0;
  width: 176px;
  height: 176px;
  border-radius: 6px;
  margin-right: 10px;
  background: #cfd6db;
  overflow: hidden;

  ${media.phone`
    width: 100%;
    margin-right: 0px;
  `}
`;

const ProjectContent = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-right: 30px;
  margin-left: 30px;
  ${media.phone`
    margin: 0.5rem 0;
  `}
`;

const ProjectTitle = styled.h3`
  color: #333;
  font-size: 21px;
  line-height: 24px;
  font-weight: 500;
`;

const ProjectDescription = styled.div`
  color: #84939E;
  font-size: 15px;
  font-weight: 300;
  line-height: 20px;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
  overflow: hidden;
  max-height: 100px;
  ${media.phone`
    display: none;
  `}
`;

const ReadMoreWrapper = styled.div`
  margin-top: 5px;
  ${media.phone`
    display: none;
  `}
`;

const ReadMore = styled.div`
  color: #84939E;
  font-size: 15px;
  font-weight: 400;
  text-decoration: underline;
  display: inline-block;
  cursor: pointer;

  &:hover {
    color: #000;
  }
`;

const ProjectButtonWrapper = styled.div`
  height: 100%;
  display: flex;
  align-items: center;
  margin-right: 20px;
  ${media.phone`
    margin: 0.5rem 0;
  `}
`;

const ProjectButton = styled(Button) ``;

type Props = {
  id: string;
};

type State = {
  currentTenant: ITenant | null;
  project: IProject | null;
  projectImages: IProjectImages | null;
};

class Project extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      currentTenant: null,
      project: null,
      projectImages: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const { id } = this.props;
    const currentTenant$ = currentTenantStream().observable;
    const project$ = projectByIdStream(id).observable;
    const projectImages$ = projectImagesStream(id).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        currentTenant$,
        project$,
        projectImages$
      ).subscribe(([currentTenant, project, projectImages]) => {
        this.setState({ currentTenant, project, projectImages });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  goToProject = () => {
    const { project } = this.state;

    if (project) {
      browserHistory.push(`/projects/${project.data.attributes.slug}`);
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { currentTenant, project, projectImages } = this.state;

    if (currentTenant && project) {
      const tenantLogo = currentTenant.data.attributes.logo.medium;
      const slug = project.data.attributes.slug;
      const titleMultiloc = project.data.attributes.title_multiloc;
      const descriptionMultiloc = project.data.attributes.description_multiloc;
      const ideasCount = project.data.attributes.ideas_count;
      const image = (projectImages && projectImages.data.length > 0 ? projectImages.data[0] : null);
      const imageUrl = (image ? image.attributes.versions.medium : null);

      return (
        <Container>
          {imageUrl ? <ProjectImage imageSrc={imageUrl} /> : <ProjectImagePlaceholder />}

          <ProjectContent>
            <ProjectTitle><T value={titleMultiloc} /></ProjectTitle>
            <ProjectDescription><T value={descriptionMultiloc} /></ProjectDescription>
            <ReadMoreWrapper>
              <ReadMore onClick={this.goToProject}>
                <FormattedMessage {...messages.readMore} />
              </ReadMore>
            </ReadMoreWrapper>
          </ProjectContent>

          <ProjectButtonWrapper>
            <ProjectButton
              onClick={this.goToProject}
              text={formatMessage(messages.openProjectButton)}
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

export default injectIntl<Props>(Project);
