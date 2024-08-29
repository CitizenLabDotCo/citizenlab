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
}

const LinearScaleSettings = ({
  onSelectedLocaleChange,
  maximumName,
  labelBaseName,
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
          labelBaseName={labelBaseName}
          maximumName={maximumName}
          onSelectedLocaleChange={onSelectedLocaleChange}
          locales={locales}
        />
      </Box>
    </>
  );
};

export default LinearScaleSettings;
