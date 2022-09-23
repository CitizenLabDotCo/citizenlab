import React from 'react';

// i18n
import { Locale } from 'typings';

// components
import RangeInput from './RangeInput';
import ScaleLabelInput from './ScaleLabelsInput';

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
}: Props) => {
  return (
    <>
      <RangeInput maximumName={maximumName} />
      <ScaleLabelInput
        minimumLabelName={minimumLabelName}
        maximumLabelName={maximumLabelName}
        maximumName={maximumName}
        onSelectedLocaleChange={onSelectedLocaleChange}
        locales={locales}
      />
    </>
  );
};

export default LinearScaleSettings;
