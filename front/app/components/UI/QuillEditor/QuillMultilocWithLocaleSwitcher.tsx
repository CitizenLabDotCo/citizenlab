import React, { memo, useState, useCallback, useEffect } from 'react';

import {
  IconTooltip,
  LocaleSwitcher,
  Label,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { SupportedLocale, Multiloc } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import QuillEditor, {
  Props as QuillEditorProps,
} from 'components/UI/QuillEditor';

import { isNilOrError } from 'utils/helperUtils';

const Container = styled.div``;

const LabelContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 16px;
`;

const StyledLabel = styled(Label)`
  margin-bottom: 0px;
`;

const StyledIconTooltip = styled(IconTooltip)``;

const Spacer = styled.div`
  flex: 1;
`;

const StyledLocaleSwitcher = styled(LocaleSwitcher)`
  width: auto;
`;

export interface Props
  extends Omit<
    QuillEditorProps,
    'value' | 'onChange' | 'locale' | 'labelTooltipText'
  > {
  valueMultiloc: Multiloc | null | undefined;
  labelTooltipText?: string | JSX.Element | null;
  onChange: (value: Multiloc, locale: SupportedLocale) => void;
}

const QuillMutilocWithLocaleSwitcher = memo<Props>((props) => {
  const {
    valueMultiloc,
    onChange,
    className,
    label,
    labelTooltipText,
    ...quillProps
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
      <Container className={className} id={props.id}>
        <LabelContainer>
          {label && (
            <StyledLabel htmlFor={id}>
              <span>{label}</span>
              {labelTooltipText && (
                <StyledIconTooltip content={labelTooltipText} />
              )}
            </StyledLabel>
          )}

          {!label && <Spacer />}

          <StyledLocaleSwitcher
            onSelectedLocaleChange={handleOnSelectedLocaleChange}
            locales={!isNilOrError(tenantLocales) ? tenantLocales : []}
            selectedLocale={selectedLocale}
            values={{ valueMultiloc }}
          />
        </LabelContainer>

        <QuillEditor
          {...quillProps}
          id={id}
          value={valueMultiloc?.[selectedLocale]}
          locale={selectedLocale}
          onChange={handleValueOnChange}
        />
      </Container>
    );
  }

  return null;
});

export default QuillMutilocWithLocaleSwitcher;
