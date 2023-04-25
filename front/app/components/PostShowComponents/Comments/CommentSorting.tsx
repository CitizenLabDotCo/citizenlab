import React, { PureComponent } from 'react';
import FilterSelector from 'components/FilterSelector';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import styled from 'styled-components';
import { CommentsSort } from 'api/comments/types';

const Container = styled.div``;

interface Props {
  id?: string | undefined;
  onChange: (value: CommentsSort) => void;
  selectedValue: CommentsSort[];
  className?: string;
}

interface State {}

export default class CommentSorting extends PureComponent<Props, State> {
  handleOnChange = (selectedValue: [CommentsSort]) => {
    this.setState({ selectedValue });
    this.props.onChange(selectedValue[0]);
  };

  title = (<FormattedMessage {...messages.commentsSortTitle} />);

  sortOptions = [
    { text: <FormattedMessage {...messages.mostRecent} />, value: 'new' },
    {
      text: <FormattedMessage {...messages.mostUpvoted} />,
      value: '-upvotes_count',
    },
  ];

  render() {
    const { className, selectedValue } = this.props;

    return (
      <Container className={className}>
        <FilterSelector
          id="e2e-comments-sort-filter"
          title={this.title}
          name="sort"
          selected={selectedValue}
          values={this.sortOptions}
          onChange={this.handleOnChange}
          multipleSelectionAllowed={false}
          width="180px"
          right="-10px"
          mobileLeft="-5px"
        />
      </Container>
    );
  }
}
