import React, { PureComponent } from 'react';

// components
import FilterSelector from 'components/FilterSelector';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import {
  IdeaDefaultSortMethod,
  ideaDefaultSortMethodFallback,
} from 'services/participationContexts';

type Props = {
  id?: string | undefined;
  alignment: 'left' | 'right';
  onChange: (value: string) => void;
  defaultSortingMethod?: IdeaDefaultSortMethod;
};

type State = {
  selectedValue: string[];
};

class SortFilterDropdown extends PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: [
        props.defaultSortingMethod || ideaDefaultSortMethodFallback,
      ],
    };
  }

  handleOnChange = (selectedValue: string[]) => {
    this.setState({ selectedValue });
    this.props.onChange(selectedValue[0]);
  };

  sortTitle = (<FormattedMessage {...messages.sortTitle} />);

  render() {
    const { alignment } = this.props;
    const { selectedValue } = this.state;
    const options = [
      { text: <FormattedMessage {...messages.trending} />, value: 'trending' },
      { text: <FormattedMessage {...messages.random} />, value: 'random' },
      { text: <FormattedMessage {...messages.popular} />, value: 'popular' },
      { text: <FormattedMessage {...messages.newest} />, value: 'new' },
      { text: <FormattedMessage {...messages.oldest} />, value: '-new' },
    ];

    return (
      <FilterSelector
        id="e2e-ideas-sort-dropdown"
        title={this.sortTitle}
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
