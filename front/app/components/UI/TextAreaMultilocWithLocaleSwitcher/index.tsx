import React, { memo, useState, useCallback, useEffect } from 'react';

import {
  IconTooltip,
  LocaleSwitcher,
  Label,
  colors,
  boLabelStyle,
  stackedLabelStyle,
} from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';
import { SupportedLocale, Multiloc } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import TextArea, { Props as TextAreaProps } from 'components/UI/TextArea';

import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div``;

const LabelContainer = styled.div<{
  variant: TextAreaProps['variant'];
  stacked: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;

  ${({ variant }) =>
    variant === 'bo'
      ? css`
          flex-wrap: wrap;
          gap: 4px;
          margin-bottom: 4px;
        `
      : css`
          margin-bottom: 10px;
        `}

  ${({ stacked }) => stacked && stackedLabelStyle}
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

const LabelText = styled.span<{ variant: TextAreaProps['variant'] }>`
  ${({ variant }) =>
    variant === 'bo'
      ? boLabelStyle
      : css`
          color: ${colors.textSecondary};
        `}
`;

export interface Props extends Omit<TextAreaProps, 'value' | 'onChange'> {
  valueMultiloc: Multiloc | null | undefined;
  onChange: (value: Multiloc, locale: SupportedLocale) => void;
  labelTextElement?: JSX.Element;
  stackedLabel?: boolean;
  // Rendered inside the field; gets the selected locale (this component's own state).
  renderCounter?: (
    value: string | null,
    locale: SupportedLocale
  ) => React.ReactNode;
}

const TextAreaMultilocWithLocaleSwitcher = memo<Props>((props) => {
  const {
    valueMultiloc,
    onChange,
    className,
    label,
    labelTooltipText,
    labelTextElement,
    renderCounter,
    stackedLabel = false,
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
    const value = valueMultiloc?.[selectedLocale] || null;

    return (
      <Container className={className}>
        <LabelContainer variant={textAreaProps.variant} stacked={stackedLabel}>
          {label || labelTextElement ? (
            <StyledLabel htmlFor={id}>
              {labelTextElement || (
                <LabelText variant={textAreaProps.variant}>{label}</LabelText>
              )}
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
            variant={textAreaProps.variant}
          />
        </LabelContainer>

        <TextArea
          {...textAreaProps}
          value={value}
          locale={selectedLocale}
          onChange={handleValueOnChange}
          id={id}
        >
          {renderCounter?.(value, selectedLocale)}
        </TextArea>
      </Container>
    );
  }

  return null;
});

export default TextAreaMultilocWithLocaleSwitcher;
