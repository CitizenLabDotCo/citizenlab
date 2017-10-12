import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import FilterSelector from 'components/FilterSelector';

// services
import { currentTenantStream, ITenant } from 'services/tenant';
import { localeStream } from 'services/locale';
import { areasStream, IAreas } from 'services/areas';

// i18n
import { getLocalized } from 'utils/i18n';
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

type Props = {
  onChange: (value: any) => void;
};

type State = {
  currentTenant: ITenant | null;
  locale: string | null;
  areas: IAreas | null;
  selectedAreas: string[];
};

class SelectAreas extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;
  subscriptions: Rx.Subscription[];

  constructor() {
    super();
    this.state = {
      currentTenant: null,
      locale: null,
      areas: null,
      selectedAreas: []
    };
  }

  componentWillMount() {
    const currentTenant$ = currentTenantStream().observable;
    const locale$ = localeStream().observable;
    const areas$ = areasStream().observable;

    this.subscriptions = [
      Rx.Observable.combineLatest(
        currentTenant$,
        locale$,
        areas$
      ).subscribe(([currentTenant, locale, areas]) => {
        this.setState({ currentTenant, locale, areas });
      })
    ];
  }

  componentWillUnmount() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
  }

  handleOnChange = (selectedAreas) => {
    this.setState({ selectedAreas });
    this.props.onChange(selectedAreas);
  }

  render() {
    const { currentTenant, locale, areas, selectedAreas } = this.state;
    const { formatMessage } = this.props.intl;
    let options: any = [];

    if (currentTenant && locale && areas && areas.data && areas.data.length > 0) {
      const currentTenantLocales = currentTenant.data.attributes.settings.core.locales;

      options = areas.data.map((area) => {
        return {
          text: getLocalized(area.attributes.title_multiloc, locale, currentTenantLocales),
          value: area.id
        };
      });
    }

    return (
      <FilterSelector
        title={formatMessage(messages.areasTitle)}
        name="areas"
        selected={selectedAreas}
        values={options}
        onChange={this.handleOnChange}
        multiple={true}
      />
    );
  }
}

export default injectIntl<Props>(SelectAreas);
