// Libraries
import React from 'react';


// Styling
import { TitleWrapper, TextAndButtons, StyledSearch, Spacer } from './GroupHeader';

// i18l
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// Typings
export interface Props {
  onSearch: (string) => void;
}
export interface State {
  searchValue: string;
}

export class AllUsersHeader extends React.PureComponent<Props, State> {
  constructor(props) {
    super(props);
    this.state = {
      searchValue: '',
    };
  }

  handleSearchChange = (newValue) => {
    this.setState({ searchValue: newValue });
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
