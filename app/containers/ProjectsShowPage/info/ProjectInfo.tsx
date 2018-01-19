import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isString } from 'lodash';
import 'moment-timezone';

// components
import ContentContainer from 'components/ContentContainer';
import EventsPreview from '../EventsPreview';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectByIdStream, IProject } from 'services/projects';
import { projectImagesStream, IProjectImages } from 'services/projectImages';

// i18n
import { getLocalized } from 'utils/i18n';

// style
import styled from 'styled-components';
import { media } from 'utils/styleUtils';

// utils
import { stripHtml } from 'utils/textUtils';

// typings
import { Locale } from 'typings';

const Container = styled.div`
  margin-top: 75px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;

  ${media.phone`
    display: block;
  `}
`;

const Left = styled.section`
  flex: 3;

  ${media.phone`
    margin-bottom: 20px;
  `}

  ${media.biggerThanPhone`
    padding-right: 30px;
  `}
`;

const IdeaBodyStyled = styled.div`
  margin-top: 45px;
  font-size: 18px;
  color: #777777;
`;

const Right = styled.aside`
  flex: 2;
  max-width: 400px;
  ${media.phone`
    display: none;
  `}
`;

const ProjectImages = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
`;

const ProjectImage = styled.img`
  margin: 5px;
  border-radius: 5px;

  &:first-child {
    width: 100%;
  }

  &:not(:first-child) {
    width: calc(33% - 9px);
  }
`;

type Props = {
  projectId: string;
};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
  project: IProject | null;
  projectImages: IProjectImages | null;
};

export default class ProjectInfo extends React.PureComponent<Props, State> {
  projectId$: Rx.BehaviorSubject<string>;
  subscriptions: Rx.Subscription[];

  constructor(props) {
    super(props);
    this.state = {
      locale: null,
      currentTenant: null,
      project: null,
      projectImages: null
    };
    this.projectId$ = new Rx.BehaviorSubject(null as any);
    this.subscriptions = [];
  }

  componentWillMount() {
    this.projectId$.next(this.props.projectId);

    this.subscriptions = [
      this.projectId$.distinctUntilChanged().filter(projectId => isString(projectId)).switchMap((projectId) => {
        const locale$ = localeStream().observable;
        const currentTenant$ = currentTenantStream().observable;
        const project$ = projectByIdStream(projectId).observable;

        return Rx.Observable.combineLatest(
          locale$,
          currentTenant$,
          project$
        );
      }).switchMap(([locale, currentTenant, project]) => {
        const projectImages$ = projectImagesStream(project.data.id).observable;
        return projectImages$.map(projectImages => ({ locale, currentTenant, project, projectImages }));
      })
      .subscribe(({ locale, currentTenant, project, projectImages }) => {
        this.setState({ locale, currentTenant, project, projectImages });
      })
    ];
  }

  componentWillReceiveProps(newProps: Props) {
    this.projectId$.next(newProps.projectId);
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const className = this.props['className'];
    const { locale, currentTenant, project, projectImages } = this.state;

    if (locale && currentTenant && project) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const description = stripHtml(getLocalized(project.data.attributes.description_multiloc, locale, currentTenantLocales));
      const images = (projectImages && projectImages.data && projectImages.data.length > 0 ? projectImages.data : null);

      return (
        <ContentContainer className={className}>
          <Container>
            <Left>
              <IdeaBodyStyled>
                {description}
              </IdeaBodyStyled>
            </Left>

            <Right>
              <ProjectImages>
                {images && images.filter((image) => image).map((image) => (
                  <ProjectImage key={image.id} src={image.attributes.versions.medium as string} />
                ))}
              </ProjectImages>
            </Right>
          </Container>

          <EventsPreview projectId={project.data.id} />
        </ContentContainer>
      );
    }

    return null;
  }
}
