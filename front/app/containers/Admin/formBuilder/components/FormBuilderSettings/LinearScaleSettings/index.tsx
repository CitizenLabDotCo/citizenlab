import React, { useState, useEffect, useCallback } from 'react';

// react hook form
import { Controller, useFormContext } from 'react-hook-form';

// components
import {
  Box,
  Label,
  IconTooltip,
  LocaleSwitcher,
  Input,
} from '@citizenlab/cl2-component-library';
import { SectionField } from 'components/admin/Section';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Multiloc, Locale } from 'typings';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';
interface Props {
  name: string;
  onSelectedLocaleChange?: (locale: Locale) => void;
  locales: Locale[];
}

const LinearScaleSettings = ({
  onSelectedLocaleChange,
  name,
  locales,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const {
    // formState: { errors }, // TODO: Error handling
    control,
    setValue,
  } = useFormContext();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  // Handles locale change
  useEffect(() => {
    setSelectedLocale(locales[0]);
    onSelectedLocaleChange?.(locales[0]);
  }, [locales, onSelectedLocaleChange]);
  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: Locale) => {
      setSelectedLocale(newSelectedLocale);
      onSelectedLocaleChange?.(newSelectedLocale);
    },
    [onSelectedLocaleChange]
  );

  const defaultValues = [{}];

  if (selectedLocale) {
    return (
      <>
        <Controller
          name={name}
          control={control}
          defaultValue={defaultValues}
          render={({ field: { ref: _ref, value: choices } }) => {
            return (
              <SectionField>
                <Box marginBottom="8px">
                  <Label>
                    {formatMessage(messages.range)}
                    <IconTooltip
                      content={formatMessage(messages.rangeTooltip)}
                    />
                  </Label>
                  <Box width="40px" display="flex">
                    <Input
                      size="small"
                      type="number"
                      value={'test'}
                      onChange={(value) => {
                        const updatedChoices = choices;
                        setValue(name, updatedChoices);
                      }}
                    />
                  </Box>
                </Box>
                <Box display="flex" flexWrap="wrap" marginBottom="12px">
                  <Box marginTop="4px" marginRight="12px">
                    <Label>
                      {formatMessage(messages.labels)}
                      <IconTooltip
                        content={formatMessage(messages.labelsTooltip)}
                      />
                    </Label>
                  </Box>
                  <Box>
                    <LocaleSwitcher
                      onSelectedLocaleChange={handleOnSelectedLocaleChange}
                      locales={!isNilOrError(locales) ? locales : []}
                      selectedLocale={selectedLocale}
                      values={{
                        input_field: choices as Multiloc,
                      }}
                    />
                  </Box>
                </Box>
                <Input
                  size="small"
                  type="text"
                  value={'test'}
                  onChange={(value) => {
                    const updatedChoices = choices;
                    setValue(name, updatedChoices);
                  }}
                  label={'1'}
                />
                <Input
                  size="small"
                  type="text"
                  value={'test'}
                  onChange={(value) => {
                    const updatedChoices = choices;
                    setValue(name, updatedChoices);
                  }}
                  label={'5'}
                />
              </SectionField>
            );
          }}
        />
      </>
    );
  }
  return null;
};

export default injectIntl(LinearScaleSettings);
