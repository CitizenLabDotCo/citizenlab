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

const Container = styled.form`
  flex: 1;
  display: flex;
  align-items: center;
  align-self: stretch;
  margin: 0;
  padding: 0;
  position: relative;
`;

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

const StyledInput = styled(Input)`
  width: 100%;
`;

interface Props {
  value: string;
  onChange: (arg: string) => void;
}

type State = {};

class SearchInput extends React.PureComponent<Props & InjectedIntlProps, State> {
  handleOnChange = (value: string) => {
    this.props.onChange(value);
  }

  render() {
    const className = this.props['className'];
    const { value } = this.props;
    const { formatMessage } = this.props.intl;

    return (
      <Container className={className}>
        <StyledInput
          id="e2e-ideas-search"
          value={value}
          type="text"
          placeholder={formatMessage(messages.searchPlaceholder)}
          onChange={this.handleOnChange}
        />
        <SearchButton className="e2e-ideas-search-button" >
          <SearchIcon name="search" className="search-icon" />
        </SearchButton>
      </Container>
    );
  }
}

export default injectIntl<Props>(SearchInput);
