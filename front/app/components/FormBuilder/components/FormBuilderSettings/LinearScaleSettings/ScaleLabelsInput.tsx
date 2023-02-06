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
import styled from 'styled-components';

const StyledLabel = styled(Label)`
  margin-top: auto;
  margin-bottom: auto;
`;
interface Props {
  minimumLabelName: string;
  maximumLabelName: string;
  maximumName: string;
  onSelectedLocaleChange?: (locale: Locale) => void;
  locales: Locale[];
  platformLocale: Locale;
}

const ScaleLabelsInput = ({
  minimumLabelName,
  maximumLabelName,
  maximumName,
  onSelectedLocaleChange,
  locales,
  platformLocale,
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const { control, setValue, getValues } = useFormContext();
  const [selectedLocale, setSelectedLocale] = useState<Locale | null>(
    platformLocale
  );

  // Handles locale change
  useEffect(() => {
    setSelectedLocale(platformLocale);
    onSelectedLocaleChange?.(platformLocale);
  }, [platformLocale, onSelectedLocaleChange]);

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
                    <Box
                      justifyContent="space-between"
                      display="flex"
                      flexWrap="wrap"
                      gap="12px"
                      mr="0px"
                      my="16px"
                    >
                      <StyledLabel>
                        {formatMessage(messages.labels)}
                        <IconTooltip
                          maxTooltipWidth={250}
                          content={formatMessage(messages.labelsTooltipContent)}
                        />
                      </StyledLabel>
                      <Box>
                        <LocaleSwitcher
                          onSelectedLocaleChange={handleOnSelectedLocaleChange}
                          locales={!isNilOrError(locales) ? locales : []}
                          selectedLocale={selectedLocale}
                          values={{
                            input_field: minLabelMultiloc && maxLabelMultiloc,
                          }}
                        />
                      </Box>
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
