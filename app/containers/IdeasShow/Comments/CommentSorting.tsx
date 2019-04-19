import React, { PureComponent } from 'react';
import FilterSelector from 'components/FilterSelector';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import styled from 'styled-components';

const Container = styled.div``;

interface Props {
  id?: string | undefined;
  onChange: (value: string) => void;
  className?: string;
}

interface State {
  selectedValue: string[];
}

export default class CommentSorting extends PureComponent<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      selectedValue: ['oldest_to_newest']
    };
  }

  handleOnChange = (selectedValue: string[]) => {
    this.setState({ selectedValue });
    this.props.onChange(selectedValue[0]);
  }

  title = <FormattedMessage {...messages.commentsSortTitle} />;

  sortOptions = [
    { text: <FormattedMessage {...messages.oldestToNewest} />, value: 'oldest_to_newest' },
    { text: <FormattedMessage {...messages.mostUpvoted} />, value: 'most_upvoted' },
  ];

  render() {
    const { className } = this.props;
    const { selectedValue } = this.state;

    return (
      <Container className={className}>
        <FilterSelector
          id="e2e-comments-sort-filter"
          title={this.title}
          name="sort"
          selected={selectedValue}
          values={this.sortOptions}
          onChange={this.handleOnChange}
          multiple={false}
          width="180px"
          right="-10px"
          mobileLeft="-5px"
        />
      </Container>
    );
  }
}
