// Libraries
import React from 'react';
import { throttle } from 'lodash';

// Styling
import { TitleWrapper, TextAndButtons, StyledSearch, Spacer } from './GroupHeader';

// i18l
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typings
export interface Props {
  onSearch: (newValue: string) => void;
}
export interface State {
  searchValue: string;
}

export class AllUsersHeader extends React.PureComponent<Props, State> {
  debounceSearch: (newValue: string) => void;

  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
    };
    this.debounceSearch = throttle(this.props.onSearch, 500);
  }

  handleSearchChange = (newValue: string) => {
    this.setState({ searchValue: newValue });
    this.debounceSearch(newValue);
  }

  render() {
    return (
      <TitleWrapper>
        <TextAndButtons>
          <FormattedMessage tagName="h1" {...messages.allUsers} />
        </TextAndButtons>
        <Spacer />
        <StyledSearch value={this.state.searchValue} onChange={this.handleSearchChange} />
      </TitleWrapper>
    );
  }
}

export default AllUsersHeader;
