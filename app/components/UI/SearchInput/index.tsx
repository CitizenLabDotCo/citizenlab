import React, { PureComponent } from 'react';
import { isString, isEmpty } from 'lodash-es';

// components
import Icon from 'components/UI/Icon';
import Input from 'components/UI/Input';
import Label from 'components/UI/Label';

// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';

const Container = styled.form`
  width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
`;

const StyledInput = styled(Input)`
  width: 100%;

  input {
    width: 100%;
    padding-right: 45px;

    &::-ms-clear {
      display: none;
    }
  }
`;

const StyledIcon = styled(Icon)`
  width: 100%;
  height: 100%;
  fill: ${colors.clIconSecondary};
`;

const IconWrapper = styled.div`
  width: 21px;
  height: 21px;
  position: absolute;
  top: 14px;
  right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;

  &.clear {
    cursor: pointer;

    ${StyledIcon} {
      width: 13px;
      height: 13px;
    }

    &:hover {
      ${StyledIcon} {
        fill: #000;
      }
    }
  }
`;

interface Props {
  value: string;
  onChange: (arg: string) => void;
  onFocus?: () => void;
  className?: string;
}

type State = {};

class SearchInput extends PureComponent<Props & InjectedIntlProps, State> {
  handleOnChange = (value: string) => {
    this.props.onChange(value);
  }

  handleOnClick = (event) => {
    event.preventDefault();

    const { value } = this.props;

    if (isString(value) && !isEmpty(value)) {
      this.props.onChange('');
    }
  }

  handleSubmit = (event) => {
    event.preventDefault();
  }

  render() {
    const className = this.props['className'];
    const { value, onFocus } = this.props;
    const { formatMessage } = this.props.intl;
    const iconName = (isString(value) && !isEmpty(value) ? 'close2' : 'search');
    const canClear = (isString(value) && !isEmpty(value));
    const placeholder = formatMessage(messages.searchPlaceholder);

    return (
      <Container className={className} onSubmit={this.handleSubmit}>
        <Label htmlFor="e2e-ideas-search" hidden value={placeholder} />
        <StyledInput
          id="e2e-ideas-search"
          value={value}
          type="text"
          placeholder={placeholder}
          onChange={this.handleOnChange}
          onFocus={onFocus}
        />
        <IconWrapper onClick={this.handleOnClick} className={canClear ? 'clear' : ''}>
          <StyledIcon name={iconName} />
        </IconWrapper>
      </Container>
    );
  }
}

export default injectIntl<Props>(SearchInput);
