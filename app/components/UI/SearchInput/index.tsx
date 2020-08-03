import React, {
  memo,
  useState,
  useCallback,
  useEffect,
  useMemo,
  MouseEvent,
} from 'react';
import { isEmpty } from 'lodash-es';
import { LiveMessage } from 'react-aria-live';

// components
import Icon from 'components/UI/Icon';
import Input from 'components/UI/Input';

// i18n
import messages from './messages';
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';

// styling
import styled from 'styled-components';
import { colors } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div`
  position: relative;
`;

const StyledInput = styled(Input)`
  input {
    padding-right: 40px;

    &::-ms-clear {
      display: none;
    }
  }
`;

const SearchIcon = styled(Icon)`
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
  fill: ${colors.label};
`;

const IconContainer = styled.div`
  position: absolute;
  right: 12px;
  top: 12px;
`;

const CloseIcon = styled(Icon)`
  flex: 0 0 14px;
  width: 14px;
  height: 14px;
  fill: ${colors.label};
`;

const CloseButton = styled.button`
  width: 20px;
  height: 20px;
  padding: 0;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  cursor: pointer;

  &:hover {
    ${CloseIcon} {
      fill: #000;
    }
  }
`;

interface Props {
  onChange: (arg: string | null) => void;
  placeholder?: string;
  ariaLabel?: string;
  className?: string;
}

const SearchInput = memo<Props & InjectedIntlProps>(
  ({ onChange, placeholder, ariaLabel, className, intl }) => {
    const [searchTerm, setSearchTerm] = useState<string | null>(null);

    const handleOnChange = useCallback((value: string) => {
      const newValue = !isEmpty(value) ? value : null;
      setSearchTerm(newValue);
    }, []);

    const handleOnReset = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        event.preventDefault();

        if (!isEmpty(searchTerm)) {
          setSearchTerm(null);
        }
      },
      [searchTerm]
    );

    useEffect(() => {
      // debounce input
      const handler = setTimeout(() => {
        onChange(searchTerm);
      }, 500);

      return () => clearTimeout(handler);
    }, [searchTerm]);

    const searchPlaceholder = useMemo(() => {
      return placeholder || intl.formatMessage(messages.searchPlaceholder);
    }, [placeholder]);

    const searchAriaLabel = useMemo(() => {
      return ariaLabel || intl.formatMessage(messages.searchAriaLabel);
    }, [ariaLabel]);

    return (
      <Container className={className || ''}>
        <StyledInput
          className="e2e-search-input"
          type="text"
          aria-label={searchAriaLabel}
          placeholder={searchPlaceholder}
          value={searchTerm || ''}
          onChange={handleOnChange}
        />

        <ScreenReaderOnly aria-live="polite">
          <FormattedMessage {...messages.searchTerm} values={{ searchTerm }} />
        </ScreenReaderOnly>

        <IconContainer>
          {isEmpty(searchTerm) ? (
            <SearchIcon ariaHidden name="search2" />
          ) : (
            <CloseButton onClick={handleOnReset}>
              <CloseIcon
                title={intl.formatMessage(messages.removeSearchTerm)}
                name="close"
              />
            </CloseButton>
          )}
        </IconContainer>

        <LiveMessage
          message={
            searchTerm
              ? intl.formatMessage(messages.a11y_searchTerm, { searchTerm })
              : intl.formatMessage(messages.a11y_searchTermBlank)
          }
          aria-live="polite"
        />
      </Container>
    );
  }
);

export default injectIntl(SearchInput);
