import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { SupportedLocale } from 'typings';

import RangeInput from './RangeInput';
import ScaleLabelInput from './ScaleLabelsInput';

interface Props {
  maximumName: string;
  labelBaseName: string;
  onSelectedLocaleChange?: (locale: SupportedLocale) => void;
  locales: SupportedLocale[];
  platformLocale: SupportedLocale;
  inputType: 'linear_scale' | 'rating' | 'matrix_linear_scale';
}

const LinearAndRatingSettings = ({
  onSelectedLocaleChange,
  maximumName,
  labelBaseName,
  platformLocale,
  locales,
  inputType,
}: Props) => {
  return (
    <>
      <Box mb="16px">
        <RangeInput maximumName={maximumName} inputType={inputType} />
      </Box>
      {['matrix_linear_scale', 'linear_scale'].includes(inputType) && (
        <Box mb="32px">
          <ScaleLabelInput
            platformLocale={platformLocale}
            labelBaseName={labelBaseName}
            maximumName={maximumName}
            onSelectedLocaleChange={onSelectedLocaleChange}
            locales={locales}
          />
        </Box>
      )}
    </>
  );
};

export default LinearAndRatingSettings;
