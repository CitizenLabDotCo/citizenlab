import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SupportedLocale } from 'typings';

import RangeInput from './RangeInput';
import ScaleLabelInput from './ScaleLabelsInput';

interface Props {
  maximumName: string;
  minimumLabelName: string;
  maximumLabelName: string;
  onSelectedLocaleChange?: (locale: SupportedLocale) => void;
  locales: SupportedLocale[];
  platformLocale: SupportedLocale;
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
