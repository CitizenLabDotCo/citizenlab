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
import i18n from 'utils/i18n';
import T from 'containers/T';
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
  border: solid 1px #e5e5e5;
  cursor: pointer;
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
`;

const ProjectContent = styled.div`
  flex: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  margin-right: 30px;
  margin-left: 30px;
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
`;

const ReadMoreWrapper = styled.div`
  margin-top: 5px;
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
      const title = i18n.getLocalized(project.data.attributes.title_multiloc);
      const description = i18n.getLocalized(project.data.attributes.description_multiloc);
      const ideasCount = project.data.attributes.ideas_count;
      const image = (projectImages && projectImages.data.length > 0 ? projectImages.data[0] : null);
      const imageUrl = (image ? image.attributes.versions.medium : null);

      return (
        <Container>
          {imageUrl && <ProjectImage imageSrc={imageUrl} />}

          <ProjectContent>
            <ProjectTitle>{title}</ProjectTitle>
            <ProjectDescription>{title}</ProjectDescription>
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

export default injectIntl<Props>(Project);
