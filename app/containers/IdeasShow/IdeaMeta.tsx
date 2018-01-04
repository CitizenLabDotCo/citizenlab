import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Helmet from 'react-helmet';

// services
import { currentTenantStream, ITenant } from 'services/tenant';
import { localeStream } from 'services/locale';
import { ideaByIdStream, IIdea } from 'services/ideas';
import { ideaImagesStream, IIdeaImages } from 'services/ideaImages';

// i18n
import { getLocalized } from 'utils/i18n';

// utils
import { stripHtml } from 'utils/textUtils';
import { Locale } from 'typings';

type Props = {
  ideaId: string;
};

type State = {
  locale: Locale | null;
  currentTenant: ITenant | null;
  idea: IIdea | null;
  ideaImages: IIdeaImages | null;
};

export default class IdeaMeta extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      locale: null,
      currentTenant: null,
      idea: null,
      ideaImages: null
    };
  }

  componentWillMount () {
    const { ideaId } = this.props;
    const locale$ = localeStream().observable;
    const currentTenant$ = currentTenantStream().observable;
    const idea$ = ideaByIdStream(ideaId).observable;
    const ideaImages$ = ideaImagesStream(ideaId).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        locale$,
        currentTenant$,
        idea$,
        ideaImages$
      ).subscribe(([locale, currentTenant, idea, ideaImages]) => {
        this.setState({
          locale,
          currentTenant,
          idea,
          ideaImages
        });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  render() {
    const { locale, currentTenant, idea, ideaImages } = this.state;

    if (locale && currentTenant && idea) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const ideaTitle = getLocalized(idea.data.attributes.title_multiloc, locale, currentTenantLocales);
      const ideaDescription = getLocalized(idea.data.attributes.body_multiloc, locale, currentTenantLocales);
      const ideaImage = (ideaImages && ideaImages.data.length > 0 ? ideaImages.data[0].attributes.versions.large : null);
      const ideaUrl = window.location.href;

      return (
        <Helmet>
          <title>{ideaTitle}</title>
          <meta property="og:title" content={ideaTitle} />
          <meta property="og:description" content={stripHtml(ideaDescription)} />
          {ideaImage && <meta property="og:image" content={ideaImage} />}
          <meta property="og:url" content={ideaUrl} />
          <meta name="twitter:card" content="summary_large_image" />
        </Helmet>
      );
    }

    return null;
  }
}
