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
  Text,
} from '@citizenlab/cl2-component-library';

// i18n
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';
import { Locale } from 'typings';
import messages from './messages';

// utils
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  maximumName: string;
  minimumLabelName: string;
  maximumLabelName: string;
  onSelectedLocaleChange?: (locale: Locale) => void;
  locales: Locale[];
}

const LinearScaleSettings = ({
  onSelectedLocaleChange,
  maximumName,
  minimumLabelName,
  maximumLabelName,
  locales,
  intl: { formatMessage },
}: Props & InjectedIntlProps) => {
  const { control, setValue, getValues } = useFormContext();
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
          name={maximumName}
          control={control}
          defaultValue={defaultValues}
          render={({ field: { ref: _ref, value } }) => {
            return (
              <>
                <Box marginBottom="8px">
                  <Label>
                    {formatMessage(messages.range)}
                    <IconTooltip
                      content={formatMessage(messages.selectRangeTooltip)}
                    />
                  </Label>
                  <Box display="flex" gap={'16px'}>
                    <Text fontWeight="bold">{'1'}</Text>
                    <Text>{formatMessage(messages.toLabel)}</Text>
                    <Box width="60px" my="auto">
                      <Input
                        type="number"
                        min="2"
                        max="7"
                        value={value}
                        onChange={(value) => {
                          setValue(maximumName, value);
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </>
            );
          }}
        />
        <Controller
          name={minimumLabelName}
          control={control}
          defaultValue={defaultValues}
          render={({ field: { ref: _ref, value: minLabelMultiloc } }) => {
            return (
              <Controller
                name={maximumLabelName}
                control={control}
                defaultValue={defaultValues}
                render={({ field: { ref: _ref, value: maxLabelMultiloc } }) => {
                  return (
                    <>
                      <Box display="flex" mr="12px" my="16px">
                        <Label>
                          {formatMessage(messages.labels)}
                          <IconTooltip
                            content={formatMessage(
                              messages.labelsTooltipContent
                            )}
                          />
                        </Label>
                        <LocaleSwitcher
                          onSelectedLocaleChange={handleOnSelectedLocaleChange}
                          locales={!isNilOrError(locales) ? locales : []}
                          selectedLocale={selectedLocale}
                          values={{
                            input_field: minLabelMultiloc && maxLabelMultiloc,
                          }}
                        />
                      </Box>
                      <Box display="flex" gap="36px" marginBottom="16px">
                        <Box mt="12px">
                          <Label value="1" />
                        </Box>
                        <Input
                          type="text"
                          value={minLabelMultiloc[selectedLocale]}
                          onChange={(value) => {
                            const updatedMultiloc = minLabelMultiloc;
                            updatedMultiloc[selectedLocale] = value;
                            setValue(minimumLabelName, updatedMultiloc);
                          }}
                        />
                      </Box>
                      <Box display="flex" gap="36px" marginBottom="16px">
                        <Box mt="12px">
                          <Label value={getValues(maximumName)} />
                        </Box>
                        <Input
                          type="text"
                          value={maxLabelMultiloc[selectedLocale]}
                          onChange={(value) => {
                            const updatedMultiloc = maxLabelMultiloc;
                            updatedMultiloc[selectedLocale] = value;
                            setValue(maximumLabelName, updatedMultiloc);
                          }}
                        />
                      </Box>
                    </>
                  );
                }}
              />
            );
          }}
        />
      </>
    );
  }
  return null;
};

export default injectIntl(LinearScaleSettings);
