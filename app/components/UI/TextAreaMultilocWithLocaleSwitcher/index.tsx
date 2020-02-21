import React, { memo, useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import TextArea, { Props as TextAreaProps } from 'components/UI/TextArea';
import Label from 'components/UI/Label';
import FormLocaleSwitcher from 'components/admin/FormLocaleSwitcher';
import IconTooltip from 'components/UI/IconTooltip';

// hooks
import useLocale from 'hooks/useLocale';

// style
import styled from 'styled-components';

// typings
import { Locale, Multiloc } from 'typings';

const Container = styled.div``;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StyledLabel = styled(Label)`
  flex: 1;
  padding-bottom: 0px;
`;

const Spacer = styled.div`
  flex: 1;
`;

const StyledFormLocaleSwitcher = styled(FormLocaleSwitcher)`
  width: auto;
`;

export interface Props extends Omit<TextAreaProps, 'value' | 'onChange'> {
  valueMultiloc: Multiloc | null | undefined;
  onChange: (value: Multiloc, locale: Locale) => void;
}

const TextAreaMultilocWithLocaleSwitcher = memo<Props>((props) => {
  const { valueMultiloc, onChange, className, label, labelTooltipText, ...textAreaProps } = props;

  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  const locale = useLocale();

  useEffect(() => {
    !isNilOrError(locale) && setSelectedLocale(locale);
  }, [locale]);

  const handleValueOnChange = useCallback((value: string, locale: Locale) => {
    const newValueMultiloc = {
      ...(valueMultiloc || {}),
      [locale]: value
    } as Multiloc;

    onChange(newValueMultiloc, locale);
  }, [valueMultiloc, onChange]);

  const handleOnSelectedLocaleChange = useCallback((newSelectedLocale: Locale) => {
    setSelectedLocale(newSelectedLocale);
  }, []);

  if (selectedLocale) {
    const id = `${props.id}-${selectedLocale}`;

    return (
      <Container className={className}>
        <LabelContainer>
          {label ? (
            <StyledLabel htmlFor={id}>
              <span>{label}</span>
              {labelTooltipText && <IconTooltip content={labelTooltipText} />}
            </StyledLabel>
          ) : <Spacer />}

          <StyledFormLocaleSwitcher
            onLocaleChange={handleOnSelectedLocaleChange}
            selectedLocale={selectedLocale}
            values={{ valueMultiloc: valueMultiloc as Multiloc }}
          />
        </LabelContainer>

        <TextArea
          {...textAreaProps}
          value={valueMultiloc?.[selectedLocale] || null}
          locale={selectedLocale}
          onChange={handleValueOnChange}
        />
      </Container>
    );
  }

  return null;
});

export default TextAreaMultilocWithLocaleSwitcher;
