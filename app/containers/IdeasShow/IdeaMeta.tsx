import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import Helmet from 'react-helmet';

// services
import { ideaByIdStream, IIdea } from 'services/ideas';
import { ideaImagesStream, IIdeaImages } from 'services/ideaImages';

// i18n
import i18n from 'utils/i18n';

// utils
import { stripHtml } from 'utils/textUtils';

type Props = {
  ideaId: string;
};

type State = {
  idea: IIdea | null;
  ideaImages: IIdeaImages | null;
};

export default class IdeaMeta extends React.PureComponent<Props, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      idea: null,
      ideaImages: null
    };
  }

  componentWillMount () {
    const { ideaId } = this.props;
    const idea$ = ideaByIdStream(ideaId).observable;
    const ideaImages$ = ideaImagesStream(ideaId).observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        idea$,
        ideaImages$
      ).subscribe(([idea, ideaImages]) => {
        this.setState({
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
    const { idea, ideaImages } = this.state;

    if (idea) {
      const ideaTitle = i18n.getLocalized(idea.data.attributes.title_multiloc);
      const ideaDescription = i18n.getLocalized(idea.data.attributes.body_multiloc);
      const ideaImage = (ideaImages && ideaImages.data.length > 0 ? ideaImages.data[0].attributes.versions.large : null);
      const ideaUrl = window.location.href;

      return (
        <Helmet>
          <title>{ideaDescription}</title>
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
