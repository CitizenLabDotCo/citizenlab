import React, { useCallback, useEffect, useState } from 'react';

// react hook form
import { Controller, useFormContext } from 'react-hook-form';

// components
import {
  Box,
  Label,
  IconTooltip,
  Input,
  LocaleSwitcher,
} from '@citizenlab/cl2-component-library';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';
import { Locale } from 'typings';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  minimumLabelName: string;
  maximumLabelName: string;
  maximumName: string;
  onSelectedLocaleChange?: (locale: Locale) => void;
  locales: Locale[];
}

const ScaleLabelsInput = ({
  minimumLabelName,
  maximumLabelName,
  maximumName,
  onSelectedLocaleChange,
  locales,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const { control, setValue, getValues } = useFormContext();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(null);

  // Handles locale change
  useEffect(() => {
    setSelectedLocale(locales[0]);
    onSelectedLocaleChange?.(locales[0]);
  }, [locales, onSelectedLocaleChange]);

  const defaultValues = [{}];

  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: Locale) => {
      setSelectedLocale(newSelectedLocale);
      onSelectedLocaleChange?.(newSelectedLocale);
    },
    [onSelectedLocaleChange]
  );

  if (selectedLocale) {
    return (
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
                    <Box display="flex" mr="0px" my="16px">
                      <Label>
                        {formatMessage(messages.labels)}
                        <IconTooltip
                          content={formatMessage(messages.labelsTooltipContent)}
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
    );
  }
  return null;
};

export default injectIntl(ScaleLabelsInput);
