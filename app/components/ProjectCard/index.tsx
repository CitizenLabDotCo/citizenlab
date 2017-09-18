import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// router
import { Link } from 'react-router';

// components
import Icon from 'components/UI/Icon';
import Button from 'components/UI/Button';

// services
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
  height: 300px;
  border-radius: 5px;
  margin-bottom: 20px;
  background: #fafafa;
  border: solid 1px rgba(0, 0, 0, 0.1);

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
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
`;

const HeaderLogo = styled.img`
  height: 45px;
`;

const HeaderCount = styled.div`
  display: flex;
  align-items: center;
`;

const IdeaIcon = styled(Icon)`
  height: 28px;
  fill: #333;
  margin-right: 8px;
  margin-bottom: 5px;
`;

const IdeaCount = styled.div`
  color: #333;
  font-size: 18px;
  font-weight: 300;
`;

const InfoSeparator = styled.div`
  height: 1px;
  background: #ccc;
  margin-top: 15px;
  margin-bottom: 15px;
`;

const InfoText = styled.div`
  flex-grow: 1;
`;

const TextTitle = styled.h3`
  color: #333;
  font-size: 25px;
  line-ehight: 30px;
  font-weight: 400;
  margin: 15px 0;
`;

const TextBody = styled.div`
  font-size: 16px;
  font-weight: 300;
  color: #6b6b6b;
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

export default class Project extends React.PureComponent<Props, State> {
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

  render() {
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
        <ProjectContainer>
          {imageUrl && <ProjectImage src={imageUrl} />}
          <ProjectInfo>
  
            <InfoHeader>
              {tenantLogo && <HeaderLogo src={tenantLogo} />}
              <HeaderCount>
                <IdeaIcon name="idea" />
                <IdeaCount>
                  <FormattedMessage {...messages.xIdeas} values={{ x: ideasCount }} />
                </IdeaCount>
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
  
            {/*
            <InfoFooter>
              <Link to={`/projects/${slug}`}>
                <OpenProjectButton>
                  <FormattedMessage {...messages.openProjectButton} />
                </OpenProjectButton>
              </Link>
            </InfoFooter>
            */}
  
          </ProjectInfo>
        </ProjectContainer>
      );
    }

    return null;
  }
}
