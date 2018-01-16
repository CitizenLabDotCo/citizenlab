import * as React from 'react';
import * as Rx from 'rxjs/Rx';
import { isFunction } from 'lodash';

// router
import { browserHistory } from 'react-router';
import { Location } from 'history';

// components
import Helmet from 'react-helmet';

// services
import { localeStream } from 'services/locale';
import { currentTenantStream } from 'services/tenant';
import { projectBySlugStream, IProject } from 'services/projects';
import { projectImagesStream, IProjectImages } from 'services/projectImages';

// utils
import { stripHtml } from 'utils/textUtils';

// i18n
import { getLocalized } from 'utils/i18n';

// typings
import { Locale } from 'typings';

type Props = {
  projectSlug: string;
};

type State = {
  locale: Locale | null;
  currentTenantLocales: Locale[] | null;
  project: IProject | null;
  projectImages: IProjectImages | null;
  location: Location | null;
  loaded: boolean;
};

export default class Meta extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];
  unlisten: Function | null;

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenantLocales: null,
      project: null,
      projectImages: null,
      location: null,
      loaded: false
    };
    this.subscriptions = [];
    this.unlisten = null;
  }

  componentWillMount() {
    const { projectSlug } = this.props;
    const locale$ = localeStream().observable;
    const currentTenantLocales$ = currentTenantStream().observable.map(currentTenant => currentTenant.data.attributes.settings.core.locales);
    const project$ = projectBySlugStream(projectSlug).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenantLocales$,
        project$
      ).switchMap(([locale, currentTenantLocales, project]) => {
        const projectImages$ = projectImagesStream(project.data.id).observable;
        return projectImages$.map((projectImages) => ({ locale, currentTenantLocales, project, projectImages }));
      }).subscribe(({ locale, currentTenantLocales, project }) => {
        this.setState({ locale, currentTenantLocales, project, loaded: true });
      })
    ];
  }

  componentDidMount() {
    this.unlisten = browserHistory.listen((location: Location) => {
      this.setState({ location });
    });
  }

  componentWillUnmount() {
    if (isFunction(this.unlisten)) {
      this.unlisten();
    }

    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { locale, currentTenantLocales, project, projectImages, loaded } = this.state;

    if (loaded && locale && currentTenantLocales && project) {
      const title = getLocalized(project.data.attributes.title_multiloc, locale, currentTenantLocales);
      const description = stripHtml(getLocalized(project.data.attributes.description_multiloc, locale, currentTenantLocales));
      const image = (projectImages && projectImages.data && projectImages.data.length > 0 ? projectImages.data[0].attributes.versions.large : null);
      const url = window.location.href;

      return (
        <Helmet>
          <title>{title}</title>
          <meta property="og:title" content={title} />
          <meta property="og:description" content={description} />
          {image && <meta property="og:image" content={image} />}
          <meta property="og:url" content={url} />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
      );
    }

    return null;
  }
}
