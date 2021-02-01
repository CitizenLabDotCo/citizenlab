import React, { useState } from 'react';
import styled from 'styled-components';
import { Input, Button, Icon } from 'cl2-component-library';
import useLocale from 'hooks/useLocale';
import { isNilOrError } from 'utils/helperUtils';
import { ScreenReaderOnly } from 'utils/a11y';
// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import messages from './messages';

const Container = styled.div`
  position: relative;
  display: flex;
`;

const StyledInput = styled(Input)``;

const EyeIcon = styled(Icon)`
  width: 22px;
  height: 15px;
`;

const EyeClosedIcon = styled(Icon)`
  width: 22px;
  height: 19px;
  margin-bottom: -1px;
`;

const ShowPasswordButton = styled(Button)`
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
`;

interface Props {
  id: string;
  value: string | null;
  error?: string | null;
  onChange: (password: string) => void;
  onBlur?: () => void;
  setRef?: (element: HTMLInputElement) => void;
  autocomplete?: 'current-password' | 'new-password';
  placeholder?: string;
}

const PasswordInput = ({
  id,
  value,
  error,
  autocomplete,
  placeholder,
  onChange,
  onBlur,
  setRef,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const locale = useLocale();
  const [showPassword, setShowPassword] = useState(false);

  const handleOnChange = (password: string) => {
    onChange(password);
  };
  const handleOnBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };
  const handleOnClick = () => {
    setShowPassword(!showPassword);
  };

  if (!isNilOrError(locale)) {
    return (
      <Container>
        <StyledInput
          type={showPassword ? 'text' : 'password'}
          id={id}
          value={value}
          error={error}
          onChange={handleOnChange}
          onBlur={handleOnBlur}
          autocomplete={autocomplete}
          placeholder={placeholder}
          setRef={setRef}
        />
        <ShowPasswordButton
          locale={locale}
          onClick={handleOnClick}
          buttonStyle="text"
          height={'100%'}
        >
          {showPassword ? (
            <EyeIcon name="eye" title={formatMessage(messages.hidePassword)} />
          ) : (
            <EyeClosedIcon
              name="eyeClosed"
              title={formatMessage(messages.showPassword)}
            />
          )}
        </ShowPasswordButton>
        <ScreenReaderOnly aria-live="polite">
          {formatMessage(
            showPassword
              ? messages.a11y_passwordVisible
              : messages.a11y_passwordHidden
          )}
        </ScreenReaderOnly>
      </Container>
    );
  }

  return null;
};

export default injectIntl(PasswordInput);
