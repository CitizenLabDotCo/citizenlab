import React, { useCallback, useEffect, useState } from 'react';

import {
  Box,
  Label,
  IconTooltip,
  Input,
  LocaleSwitcher,
} from '@citizenlab/cl2-component-library';
import { Controller, useFormContext } from 'react-hook-form';
import { WrappedComponentProps } from 'react-intl';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const StyledLabel = styled(Label)`
  margin-top: auto;
  margin-bottom: auto;
`;
interface Props {
  minimumLabelName: string;
  maximumLabelName: string;
  maximumName: string;
  onSelectedLocaleChange?: (locale: SupportedLocale) => void;
  locales: SupportedLocale[];
  platformLocale: SupportedLocale;
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
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale | null>(
    platformLocale
  );

  // Handles locale change
  useEffect(() => {
    setSelectedLocale(platformLocale);
    onSelectedLocaleChange?.(platformLocale);
  }, [platformLocale, onSelectedLocaleChange]);

  const defaultValues = [{}];

  const handleOnSelectedLocaleChange = useCallback(
    (newSelectedLocale: SupportedLocale) => {
      setSelectedLocale(newSelectedLocale);
      onSelectedLocaleChange?.(newSelectedLocale);
    },
    [onSelectedLocaleChange]
  );

  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    // We want to prevent the form builder from being closed when enter is pressed
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

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
                          setValue(minimumLabelName, updatedMultiloc, {
                            shouldDirty: true,
                          });
                        }}
                        onKeyDown={handleKeyDown}
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
                          setValue(maximumLabelName, updatedMultiloc, {
                            shouldDirty: true,
                          });
                        }}
                        onKeyDown={handleKeyDown}
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
