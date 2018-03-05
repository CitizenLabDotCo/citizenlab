import * as React from 'react';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

type Props = {
  id?: string | undefined;
  onChange: (value: string) => void;
};

type State = {
  selectedValue: string[];
};

class SelectSort extends React.PureComponent<Props, State> {
  constructor(props: Props) {
    super(props as any);
    this.state = {
      selectedValue: ['trending']
    };
  }

  handleOnChange = (selectedValue: string[]) => {
    this.setState({ selectedValue });
    this.props.onChange(selectedValue[0]);
  }

  render() {
    const { selectedValue } = this.state;
    const options = [
      { text: <FormattedMessage {...messages.trending} />, value: 'trending' },
      { text: <FormattedMessage {...messages.popular} />, value: 'popular' },
      { text: <FormattedMessage {...messages.newest} />, value: 'new' },
      { text: <FormattedMessage {...messages.oldest} />, value: '-new' },
    ];

    return (
      <FilterSelector
        id="e2e-ideas-sort-filter"
        title={<FormattedMessage {...messages.sortTitle} />}
        name="sort"
        selected={selectedValue}
        values={options}
        onChange={this.handleOnChange}
        multiple={false}
        maxWidth={'250px'}
        mobileMaxWidth={'180px'}
      />
    );
  }
}

export default SelectSort;
