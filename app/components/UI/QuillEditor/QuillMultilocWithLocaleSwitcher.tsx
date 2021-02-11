import React, { memo, useState, useCallback, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import QuillEditor, {
  Props as QuillEditorProps,
} from 'components/UI/QuillEditor';
import { IconTooltip, LocaleSwitcher, Label } from 'cl2-component-library';

// hooks
import useLocale from 'hooks/useLocale';
import useAppConfigurationLocales from 'hooks/useTenantLocales';

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
  margin-bottom: 0px;
`;

const StyledIconTooltip = styled(IconTooltip)``;

const Spacer = styled.div`
  flex: 1;
`;

const StyledLocaleSwitcher = styled(LocaleSwitcher)`
  width: auto;
  margin-left: 20px;
`;

export interface Props
  extends Omit<
    QuillEditorProps,
    'value' | 'onChange' | 'locale' | 'labelTooltip'
  > {
  valueMultiloc: Multiloc | null | undefined;
  labelTooltipText?: string | JSX.Element | null;
  onChange: (value: Multiloc, locale: Locale) => void;
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

  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  const locale = useLocale();
  const tenantLocales = useAppConfigurationLocales();

  useEffect(() => {
    !isNilOrError(locale) && setSelectedLocale(locale);
  }, [locale]);

  const handleValueOnChange = useCallback(
    (value: string, locale: Locale) => {
      const newValueMultiloc = {
        ...(valueMultiloc || {}),
        [locale]: value,
      } as Multiloc;

      onChange(newValueMultiloc, locale);
    },
    [valueMultiloc, onChange]
  );

  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: Locale) => {
      setSelectedLocale(newSelectedLocale);
    },
    []
  );

  if (selectedLocale) {
    const id = `${props.id}-${selectedLocale}`;

    return (
      <Container className={className}>
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
