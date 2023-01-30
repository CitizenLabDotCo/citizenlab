import React from 'react';

// i18n
import { Locale } from 'typings';

// components
import RangeInput from './RangeInput';
import ScaleLabelInput from './ScaleLabelsInput';
import { Box } from '@citizenlab/cl2-component-library';

interface Props {
  maximumName: string;
  minimumLabelName: string;
  maximumLabelName: string;
  onSelectedLocaleChange?: (locale: Locale) => void;
  locales: Locale[];
  platformLocale: Locale;
}

const LinearScaleSettings = ({
  onSelectedLocaleChange,
  maximumName,
  minimumLabelName,
  maximumLabelName,
  platformLocale,
  locales,
}: Props) => {
  return (
    <>
      <Box mb="16px">
        <RangeInput maximumName={maximumName} />
      </Box>
      <Box mb="32px">
        <ScaleLabelInput
          platformLocale={platformLocale}
          minimumLabelName={minimumLabelName}
          maximumLabelName={maximumLabelName}
          maximumName={maximumName}
          onSelectedLocaleChange={onSelectedLocaleChange}
          locales={locales}
        />
      </Box>
    </>
  );
};

export default LinearScaleSettings;
