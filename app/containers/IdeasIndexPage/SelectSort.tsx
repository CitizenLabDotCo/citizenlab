import * as React from 'react';
import * as _ from 'lodash';
import * as Rx from 'rxjs/Rx';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import { injectIntl, InjectedIntlProps } from 'react-intl';
import messages from './messages';

type Props = {
  id?: string | undefined;
  onChange: (value: any) => void;
};

type State = {
  selectedValue: string[];
};

class SelectSort extends React.PureComponent<Props & InjectedIntlProps, State> {
  state: State;

  constructor() {
    super();
    this.state = {
      selectedValue: ['trending']
    };
  }

  handleOnChange = (selectedValue) => {
    this.setState({ selectedValue });
    this.props.onChange(selectedValue);
  }

  render() {
    const { selectedValue } = this.state;
    const { formatMessage } = this.props.intl;
    const options = [
      { text: formatMessage(messages.trending), value: 'trending' },
      { text: formatMessage(messages.popular), value: 'popular' },
      { text: formatMessage(messages.newest), value: 'new' },
      { text: formatMessage(messages.oldest), value: '-new' },
    ];

    return (
      <FilterSelector
        id="e2e-ideas-sort-filter"
        title={formatMessage(messages.sortTitle)}
        name="sort"
        selected={selectedValue}
        values={options}
        onChange={this.handleOnChange}
        multiple={false}
      />
    );
  }
}

export default injectIntl<Props>(SelectSort);
