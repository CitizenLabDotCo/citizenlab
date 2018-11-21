import React, { PureComponent } from 'react';
import { Subscription, combineLatest } from 'rxjs';

// components
import FilterSelector from 'components/FilterSelector';

// services
import { currentTenantStream, ITenant } from 'services/tenant';
import { localeStream } from 'services/locale';
import { topicsStream, ITopics } from 'services/topics';

// i18n
import { getLocalized } from 'utils/i18n';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { Locale } from 'typings';

type Props = {
  id?: string | undefined;
  onChange: (value: any) => void;
};

type State = {
  currentTenant: ITenant | null;
  locale: Locale | null;
  topics: ITopics | null;
  selectedValues: string[];
  titleKey: number;
};

export default class SelectTopic extends PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props: Props) {
    super(props as any);
    this.state = {
      currentTenant: null,
      locale: null,
      topics: null,
      selectedValues: [],
      titleKey: Math.floor(Math.random() * 10000000)
    };
    this.subscriptions = [];
  }

  componentDidMount() {
    const currentTenant$ = currentTenantStream().observable;
    const locale$ = localeStream().observable;
    const topics$ = topicsStream().observable;

    this.subscriptions = [
      combineLatest(
        currentTenant$,
        locale$,
        topics$
      ).subscribe(([currentTenant, locale, topics]) => {
        this.setState({ currentTenant, locale, topics });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnChange = (selectedValues) => {
    this.setState({ selectedValues });
    this.props.onChange(selectedValues);
  }

  render() {
    const { currentTenant, locale, topics, selectedValues, titleKey } = this.state;
    let options: any = [];

    if (currentTenant && locale && topics && topics.data && topics.data.length > 0) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;

      options = topics.data.map((topic) => {
        return {
          text: getLocalized(topic.attributes.title_multiloc, locale, currentTenantLocales),
          value: topic.id
        };
      });

      if (options && options.length > 0) {
        return (
          <FilterSelector
            title={<FormattedMessage {...messages.topicsTitle} key={titleKey} />}
            name="topics"
            selected={selectedValues}
            values={options}
            onChange={this.handleOnChange}
            multiple={true}
            right="-10px"
            mobileLeft="-5px"
          />
        );
      }
    }

    return null;
  }
}
