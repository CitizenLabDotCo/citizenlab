import React, { memo, useState, useCallback, useEffect } from 'react';

import {
  IconTooltip,
  LocaleSwitcher,
  Label,
  colors,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { SupportedLocale, Multiloc } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import TextArea, { Props as TextAreaProps } from 'components/UI/TextArea';

import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div``;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
`;

const StyledLabel = styled(Label)`
  flex: 1;
  padding: 0;
  margin: 0;
`;

const Spacer = styled.div`
  flex: 1;
`;

const StyledLocaleSwitcher = styled(LocaleSwitcher)`
  width: auto;
`;

const LabelText = styled.span`
  color: ${colors.textSecondary};
`;

export interface Props extends Omit<TextAreaProps, 'value' | 'onChange'> {
  valueMultiloc: Multiloc | null | undefined;
  onChange: (value: Multiloc, locale: SupportedLocale) => void;
  labelTextElement?: JSX.Element;
}

const TextAreaMultilocWithLocaleSwitcher = memo<Props>((props) => {
  const {
    valueMultiloc,
    onChange,
    className,
    label,
    labelTooltipText,
    labelTextElement,
    ...textAreaProps
  } = props;

  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale | null>(
    null
  );

  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();

  useEffect(() => {
    !isNilOrError(locale) && setSelectedLocale(locale);
  }, [locale]);

  const handleValueOnChange = useCallback(
    (value: string, locale: SupportedLocale) => {
      const newValueMultiloc = {
        ...(valueMultiloc || {}),
        [locale]: value,
      } as Multiloc;

      onChange(newValueMultiloc, locale);
    },
    [valueMultiloc, onChange]
  );

  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: SupportedLocale) => {
      setSelectedLocale(newSelectedLocale);
    },
    []
  );

  if (selectedLocale) {
    const id = `${props.id}-${selectedLocale}`;

    return (
      <Container className={className}>
        <LabelContainer>
          {label || labelTextElement ? (
            <StyledLabel htmlFor={id}>
              {labelTextElement || <LabelText>{label}</LabelText>}
              {labelTooltipText && <IconTooltip content={labelTooltipText} />}
            </StyledLabel>
          ) : (
            <Spacer />
          )}

          <StyledLocaleSwitcher
            onSelectedLocaleChange={handleOnSelectedLocaleChange}
            locales={!isNilOrError(tenantLocales) ? tenantLocales : []}
            selectedLocale={selectedLocale}
            values={{ valueMultiloc }}
          />
        </LabelContainer>

        <TextArea
          {...textAreaProps}
          value={valueMultiloc?.[selectedLocale] || null}
          locale={selectedLocale}
          onChange={handleValueOnChange}
          id={id}
        />
      </Container>
    );
  }

  return null;
});

export default TextAreaMultilocWithLocaleSwitcher;
