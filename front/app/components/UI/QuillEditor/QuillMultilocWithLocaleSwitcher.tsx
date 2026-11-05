import React, { memo, useState, useCallback, useRef, useEffect } from 'react';

import {
  Box,
  IconTooltip,
  LocaleSwitcher,
  Label,
  boInputLabelStyle,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';
import { SupportedLocale, Multiloc } from 'typings';

import useAppConfigurationLocales from 'hooks/useAppConfigurationLocales';
import useLocale from 'hooks/useLocale';

import MachineTranslationHint from 'components/UI/MultilocTranslation/MachineTranslationHint';
import MultilocTranslateAction from 'components/UI/MultilocTranslation/MultilocTranslateAction';
import useMultilocTranslation from 'components/UI/MultilocTranslation/useMultilocTranslation';
import QuillEditor, {
  Props as QuillEditorProps,
} from 'components/UI/QuillEditor';

import { isNilOrError } from 'utils/helperUtils';
import { sanitizeForClassname } from 'utils/JSONFormUtils';

const Container = styled.div``;

const LabelContainer = styled.div<{ variant: QuillEditorProps['variant'] }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  flex-wrap: wrap;
  gap: 16px;

  ${({ variant }) => variant === 'bo' && boInputLabelStyle}
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
  maxCharCount?: number;
  minCharCount?: number;
  setRef?: (el: HTMLElement | null) => void;
  ariaInvalid?: boolean;
  ariaDescribedBy?: string;
}

const QuillMutilocWithLocaleSwitcher = memo<Props>((props) => {
  const {
    valueMultiloc,
    onChange,
    label,
    labelTooltipText,
    hideLocaleSwitcher,
    maxCharCount,
    minCharCount,
    setRef,
    ariaDescribedBy,
    ariaInvalid,
    ...quillProps
  } = props;

  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale>(
    useLocale()
  );
  const tenantLocales = useAppConfigurationLocales();
  const translation = useMultilocTranslation({
    valueMultiloc,
    onChange: (multiloc) => onChange(multiloc, selectedLocale),
    html: true,
  });

  useEffect(() => {
    if (setRef && containerRef.current) {
      setRef(containerRef.current);
    }
  }, [setRef]);

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
    <Container id={props.id} ref={containerRef}>
      <LabelContainer variant={quillProps.variant}>
        {label && (
          <StyledLabel
            id={`${sanitizeForClassname(props.id)}-label`}
            htmlFor={id}
          >
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
          <Box display="flex" alignItems="center">
            <MultilocTranslateAction
              translation={translation}
              selectedLocale={selectedLocale}
            />
            <StyledLocaleSwitcher
              onSelectedLocaleChange={handleOnSelectedLocaleChange}
              locales={!isNilOrError(tenantLocales) ? tenantLocales : []}
              selectedLocale={selectedLocale}
              values={{ valueMultiloc }}
              variant={quillProps.variant}
            />
          </Box>
        )}
      </LabelContainer>

      <QuillEditor
        {...quillProps}
        id={id}
        ariaLabelledBy={
          label ? `${sanitizeForClassname(props.id)}-label` : undefined
        }
        ariaDescribedBy={ariaDescribedBy}
        ariaInvalid={ariaInvalid}
        value={valueMultiloc?.[selectedLocale]}
        onChange={handleValueOnChange}
        maxCharCount={maxCharCount}
        minCharCount={minCharCount}
      />
      {!hideLocaleSwitcher && (
        <MachineTranslationHint
          translation={translation}
          selectedLocale={selectedLocale}
        />
      )}
    </Container>
  );
});

export default QuillMutilocWithLocaleSwitcher;
