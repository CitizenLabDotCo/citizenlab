import React, { memo, useState, useCallback } from 'react';

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
  hideLocaleSwitcher?: boolean;
}

const QuillMutilocWithLocaleSwitcher = memo<Props>((props) => {
  const {
    valueMultiloc,
    onChange,
    label,
    labelTooltipText,
    hideLocaleSwitcher,
    ...quillProps
  } = props;

  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>(
    useLocale()
  );
  const tenantLocales = useAppConfigurationLocales();

  const handleValueOnChange = useCallback(
    (value: string) => {
      const newValueMultiloc = {
        ...(valueMultiloc || {}),
        [selectedLocale]: value,
      } as Multiloc;

      onChange(newValueMultiloc, selectedLocale);
    },
    [valueMultiloc, selectedLocale, onChange]
  );

  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: SupportedLocale) => {
      setSelectedLocale(newSelectedLocale);
    },
    []
  );

  const id = hideLocaleSwitcher ? props.id : `${props.id}-${selectedLocale}`;

  return (
    <Container id={props.id}>
      <LabelContainer>
        {label && (
          <StyledLabel htmlFor={id}>
            <span>{label}</span>
            {labelTooltipText && (
              <StyledIconTooltip
                // Added to ensure the content is visible when the multiloc is inside a modal.
                placement="auto"
                content={labelTooltipText}
              />
            )}
          </StyledLabel>
        )}

        {!label && <Spacer />}

        {!hideLocaleSwitcher && (
          <StyledLocaleSwitcher
            onSelectedLocaleChange={handleOnSelectedLocaleChange}
            locales={!isNilOrError(tenantLocales) ? tenantLocales : []}
            selectedLocale={selectedLocale}
            values={{ valueMultiloc }}
          />
        )}
      </LabelContainer>

      <QuillEditor
        {...quillProps}
        id={id}
        value={valueMultiloc?.[selectedLocale]}
        onChange={handleValueOnChange}
      />
    </Container>
  );
});

export default QuillMutilocWithLocaleSwitcher;
