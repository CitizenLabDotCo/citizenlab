import React, { useCallback, useEffect, useState } from 'react';

import {
  Box,
  Label,
  IconTooltip,
  Input,
  LocaleSwitcher,
} from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
import styled from 'styled-components';
import { SupportedLocale } from 'typings';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';

const StyledLabel = styled(Label)`
  margin-top: auto;
  margin-bottom: auto;
`;
interface Props {
  labelBaseName: string;
  maximumName: string;
  onSelectedLocaleChange?: (locale: SupportedLocale) => void;
  locales: SupportedLocale[];
  platformLocale: SupportedLocale;
}

const ScaleLabelsInput = ({
  labelBaseName,
  maximumName,
  onSelectedLocaleChange,
  locales,
  platformLocale,
}: Props) => {
  const { setValue, getValues } = useFormContext();
  const [selectedLocale, setSelectedLocale] = useState<SupportedLocale | null>(
    platformLocale
  );
  const { formatMessage } = useIntl();

  // Handles locale change
  useEffect(() => {
    setSelectedLocale(platformLocale);
    onSelectedLocaleChange?.(platformLocale);
  }, [platformLocale, onSelectedLocaleChange]);

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

  const maxValue = getValues(maximumName);

  if (selectedLocale) {
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
            />
          </Box>
        </Box>
        {Array.from({ length: maxValue }).map((_, index) => {
          const labelMultiloc = getValues(
            `${labelBaseName}.linear_scale_label_${index + 1}_multiloc`
          );

          return (
            <Box display="flex" gap="36px" marginBottom="16px" key={index}>
              <Box mt="12px">
                <Label value={(index + 1).toString()} />
              </Box>
              <Input
                className={`e2e-linear-scale-label`}
                type="text"
                value={labelMultiloc?.[selectedLocale]}
                onChange={(value) => {
                  const updatedMultiloc = labelMultiloc;
                  updatedMultiloc[selectedLocale] = value;
                  setValue(
                    `${labelBaseName}.linear_scale_label_${index + 1}_multiloc`,
                    updatedMultiloc,
                    {
                      shouldDirty: true,
                    }
                  );
                }}
                onKeyDown={handleKeyDown}
              />
            </Box>
          );
        })}
      </>
    );
  }
  return null;
};

export default ScaleLabelsInput;
