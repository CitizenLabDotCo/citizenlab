import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

// services
import { state, IStateStream } from 'services/state';
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectByIdStream, IProject } from 'services/projects';
import { projectImagesStream, IProjectImages } from 'services/projectImages';

// i18n
import T from 'containers/T';
import { FormattedMessage } from 'react-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

const ProjectContainer = styled.div`
  width: 100%;
  display: flex;
  height: 400px;
  background: #fff;
  border-radius: 5px;
  margin-bottom: 20px;

  ${media.phone`
    flex-direction: column;
    height: auto;
  `}
`;

const ProjectImage = styled.img`
  height: 100%;
  object-fit: cover;
  border-radius: 5px 0 0 5px;

  ${media.phone`
    height: 150px;
  `}
`;

const ProjectInfo = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 30px 40px;

  ${media.phone`
    padding: 20px;
  `}
`;

const InfoHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLogo = styled.img`
`;

const HeaderCount = styled.div`
  display: flex;
  color: #8F8F8F;
  font-size: 16px;
  font-weight: 500;
`;

const InfoSeparator = styled.div`
  border: 1px solid #EAEAEA;
  height: 1px;
  margin: 10px 0;
`;

const InfoText = styled.div`
  flex-grow: 1;
`;

const TextTitle = styled.h3`
  color: #222222;
  font-size: 25px;
  font-weight: bold;
  margin: 15px 0;
`;

const TextBody = styled.div`
  font-size: 16px;
  font-weight: 300;
  color: #6B6B6B;
`;

const InfoFooter = styled.div`
`;

const OpenProjectButton = styled(Button)`
  width: 100%;
`;

type Props = {
  id: string;
};

type State = {
  currentTenant: ITenant | null;
  project: IProject | null;
  projectImages: IProjectImages | null;
};

export const namespace = 'ProjectCard/index';

export default class Project extends React.PureComponent<Props, State> {
  state$: IStateStream<State>;
  subscriptions: Rx.Subscription[];

  componentWillMount() {
    const { id } = this.props;
    const currentTenant$ = currentTenantStream().observable;
    const project$ = projectByIdStream(id).observable;
    const projectImages$ = projectImagesStream(id).observable;
    const initialState: State = { currentTenant: null, project: null, projectImages: null };
    const instanceNamespace = `${namespace}/${id}`;
    this.state$ = state.createStream<State>(instanceNamespace, instanceNamespace, initialState);

    this.subscriptions = [
      this.state$.observable.subscribe(state => this.setState(state)),

      Rx.Observable.combineLatest(
        currentTenant$, 
        project$,
        projectImages$
      ).subscribe(([currentTenant, project, projectImages]) => {
        this.state$.next({ currentTenant, project, projectImages });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { currentTenant, project, projectImages } = this.state;

    if (currentTenant && project) {
      const tenantLogo = currentTenant.data.attributes.logo.small;
      const slug = project.data.attributes.slug;
      const titleMultiloc = project.data.attributes.title_multiloc;
      const descriptionMultiloc = project.data.attributes.description_multiloc;
      const ideasCount = project.data.attributes.ideas_count;
      const image = (projectImages && projectImages.data.length > 0 ? projectImages.data[0] : null);
      const imageUrl = (image ? image.attributes.versions.medium : null);

      return (
        <ProjectContainer>
          {imageUrl && <ProjectImage src={imageUrl} />}
          <ProjectInfo>
  
            <InfoHeader>
              {tenantLogo && <HeaderLogo src={tenantLogo} />}
              <HeaderCount>
                <Icon name="idea" />
                <FormattedMessage {...messages.xIdeas} values={{ x: ideasCount }} />
              </HeaderCount>
            </InfoHeader>
  
            <InfoSeparator />
  
            <InfoText>
              <TextTitle>
                <T value={titleMultiloc} />
              </TextTitle>
              {descriptionMultiloc &&
                <TextBody>
                  <T value={descriptionMultiloc} />
                </TextBody>
              }
            </InfoText>
  
            <InfoFooter>
              <Link to={`/projects/${slug}`}>
                <OpenProjectButton>
                  <FormattedMessage {...messages.openProjectButton} />
                </OpenProjectButton>
              </Link>
            </InfoFooter>
  
          </ProjectInfo>
        </ProjectContainer>
      );
    }

    return null;
  }
}
