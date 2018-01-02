import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';
import * as moment from 'moment';
import 'moment-timezone';

// components
import ContentContainer from 'components/ContentContainer';

// services
import { localeStream, updateLocale } from 'services/locale';
import { currentTenantStream, ITenant } from 'services/tenant';
import { projectBySlugStream, IProject } from 'services/projects';
import { projectImagesStream, IProjectImages } from 'services/projectImages';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import { getLocalized } from 'utils/i18n';

// style
import styled, { css } from 'styled-components';
import { transparentize, lighten, darken } from 'polished';
import { media } from 'utils/styleUtils';

// utils
import { stripHtml } from 'utils/textUtils';

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

/*
const ProjectSideLabel = styled.header`
  font-size: 16px;
  font-weight: bold;
  color: #233046;
  margin-top: 25px;
`;

const ProjectTopicsStyled = styled.div`
  display: flex;
  justify-content: space-between;
  margin: 29px 0;
`;

const ProjectTopicStyled = styled.div`
  width: 150px;
  height: 49px;
  text-align: right;
  font-size: 16px;
  font-weight: bold;
  color: #5a5a5a;
  background-color: #eaeaea;
  border-radius: 5px;
  margin: 0 13px 0 12px;
  display: flex;
  align-items: center;
`;

const ProjectTopicIconStyled = styled(Image)`
  float: left;
  margin: 16px 10px;
  width: 23px;
  height: 23.8px;
`;
*/

type Props = {
  params: {
    slug: string;
  };
};

type State = {
  locale: string | null;
  currentTenant: ITenant | null;
  project: IProject | null;
  projectImages: IProjectImages | null;
};

export default class info extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      project: null,
      projectImages: null
    };
    this.subscriptions = [];
  }

  componentWillMount() {
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const project$ = projectBySlugStream(this.props.params.slug).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        project$
      ).switchMap(([locale, currentTenant, project]) => {
        const projectImages$ = projectImagesStream(project.data.id).observable;
        return projectImages$.map(projectImages => ({ locale, currentTenant, project, projectImages }));
      })
      .subscribe(({ locale, currentTenant, project, projectImages }) => {
        this.setState({ locale, currentTenant, project, projectImages });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const className = this.props['className'];
    const { slug } = this.props.params;
    const { locale, currentTenant, project, projectImages } = this.state;

    if (locale && currentTenant && project) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const title = getLocalized(project.data.attributes.title_multiloc, locale, currentTenantLocales);
      const description = stripHtml(getLocalized(project.data.attributes.description_multiloc, locale, currentTenantLocales));
      const images = (projectImages && projectImages.data && projectImages.data.length > 0 ? projectImages.data : null);
      const url = location.pathname;

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
                  <ProjectImage key={image.id} src={image.attributes.versions.medium} />
                ))}
              </ProjectImages>

              {/*
              <section>
                <ProjectSideLabel>
                  <FormattedMessage {...messages.topics} />
                </ProjectSideLabel>
                <ProjectTopicsStyled>
                  {topics && topics.map((topic) => (<article><ProjectTopicStyled>
                    <ProjectTopicIconStyled src={topic.icon} />
                    <T value={topic.title_multiloc} />
                  </ProjectTopicStyled></article>))}
                </ProjectTopicsStyled>
              </section>
              */}
            </Right>
          </Container>
        </ContentContainer>
      );
    }

    return null;
  }
}
