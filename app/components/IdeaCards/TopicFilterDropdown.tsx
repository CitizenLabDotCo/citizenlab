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
  alignment: 'left' | 'right';
  onChange: (value: any) => void;
};

type State = {
  currentTenant: ITenant | null;
  locale: Locale | null;
  topics: ITopics | null;
  selectedValues: string[];
  titleKey: number;
};

export default class TopicFilterDropdown extends PureComponent<Props, State> {
  subscriptions: Subscription[];

  constructor(props) {
    super(props);
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
    const { alignment } = this.props;
    const { currentTenant, locale, topics, selectedValues, titleKey } = this.state;

    if (currentTenant && locale && topics && topics.data && topics.data.length > 0) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;
      const options = topics.data.map((topic) => {
        return {
          text: getLocalized(topic.attributes.title_multiloc, locale, currentTenantLocales),
          value: topic.id
        };
      });

      if (options && options.length > 0) {
        return (
          <FilterSelector
            id="e2e-idea-filter-selector"
            title={<FormattedMessage {...messages.topicsTitle} key={titleKey} />}
            name="topics"
            selected={selectedValues}
            values={options}
            onChange={this.handleOnChange}
            multipleSelectionAllowed={true}
            last={true}
            left={alignment === 'left' ? '-5px' : undefined}
            mobileLeft={alignment === 'left' ? '-5px' : undefined}
            right={alignment === 'right' ? '-5px' : undefined}
            mobileRight={alignment === 'right' ? '-5px' : undefined}
          />
        );
      }
    }

    return null;
  }
}
