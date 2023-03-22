import React, { PureComponent } from 'react';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// utils
import { defaultSortingOptions } from 'utils/participationMethodUtils';

type Props = {
  id?: string | undefined;
  alignment: 'left' | 'right';
  onChange: (value: string) => void;
};

type State = {
  selectedValue: string[];
};

class SortFilterDropdown extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedValue: ['new'],
    };
  }

  handleOnChange = (selectedValue: string[]) => {
    this.setState({ selectedValue });
    this.props.onChange(selectedValue[0]);
  };

  render() {
    const { alignment } = this.props;
    const { selectedValue } = this.state;
    const options = defaultSortingOptions.filter(
      (option) => option.value !== 'trending' && option.value !== 'popular'
    );

    return (
      <FilterSelector
        id="e2e-initiatives-sort-dropdown"
        title={<FormattedMessage {...messages.sortTitle} />}
        name="sort"
        selected={selectedValue}
        values={options}
        onChange={this.handleOnChange}
        multipleSelectionAllowed={false}
        width="180px"
        left={alignment === 'left' ? '-5px' : undefined}
        mobileLeft={alignment === 'left' ? '-5px' : undefined}
        right={alignment === 'right' ? '-5px' : undefined}
        mobileRight={alignment === 'right' ? '-5px' : undefined}
      />
    );
  }
}

export default SortFilterDropdown;
