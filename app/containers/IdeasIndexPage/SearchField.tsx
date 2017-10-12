import * as React from 'react';

// libraries
import queryString from 'query-string';

// i18n
import { injectIntl, InjectedIntlProps, FormattedMessage } from 'react-intl';
import messages from './messages';

// components
import Icon from 'components/UI/Icon';
import Input from 'components/UI/Input';

// style
import styled from 'styled-components';

const SearchButton = styled.button`
  background: none;
  border: none;
  margin: 0 0 0 -36px;
  padding: 0;
  z-index: 2;
`;

const SearchIcon = styled(Icon)`
  fill: #84939E;
  height: 21px;
  cursor: pointer;

  &:hover {
    fill: #000;
  }
`;

const SearchInput = styled(Input)``;

const StyledForm = styled.form`
  flex: 1 1 100%;
  display: flex;
  align-items: center;
  align-self: stretch;

  @media (min-width: 500px) {
    flex-basis: auto;

    ${SearchInput} {
      width: 100%;
      max-width: 300px;
    }
  }
`;

interface Props {
  value: string;
  onChange: (arg: string) => void;
}

type State = {};

class SearchField extends React.PureComponent<Props & InjectedIntlProps, State> {
  handleOnChange = (value: string) => {
    this.props.onChange(value);
  }

  render() {
    const { value } = this.props;
    const { formatMessage } = this.props.intl;

    return (
      <StyledForm>
        <SearchInput
          id="e2e-ideas-search"
          value={value}
          type="text"
          placeholder={formatMessage(messages.searchPlaceholder)}
          onChange={this.handleOnChange}
        />
        <SearchButton className="e2e-ideas-search-button" >
          <SearchIcon name="search" className="search-icon" />
        </SearchButton>
      </StyledForm>
    );
  }
}

export default injectIntl<Props>(SearchField);
