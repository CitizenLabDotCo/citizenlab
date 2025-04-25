import React from 'react';

import { Box, Toggle } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';
import { SupportedLocale } from 'typings';

import { useIntl } from 'utils/cl-intl';

import ScaleLabelInput from '../LinearAndRatingSettings/ScaleLabelsInput';

import messages from './messages';

interface Props {
  maximumName: string;
  askFollowUpName: string;
  labelBaseName: string;
  onSelectedLocaleChange?: (locale: SupportedLocale) => void;
  locales: SupportedLocale[];
  platformLocale: SupportedLocale;
}

const SentimentLinearScaleSettings = ({
  onSelectedLocaleChange,
  maximumName,
  askFollowUpName,
  labelBaseName,
  platformLocale,
  locales,
}: Props) => {
  const { formatMessage } = useIntl();
  const { setValue, getValues } = useFormContext();

  return (
    <Box mb="32px">
      <ScaleLabelInput
        platformLocale={platformLocale}
        labelBaseName={labelBaseName}
        maximumName={maximumName}
        onSelectedLocaleChange={onSelectedLocaleChange}
        locales={locales}
      />
      <Box mt="24px" mb="-20px">
        <Toggle
          checked={getValues(askFollowUpName)}
          onChange={() => {
            setValue(askFollowUpName, !getValues(askFollowUpName), {
              shouldDirty: true,
            });
          }}
          label={formatMessage(messages.askFollowUpToggleLabel)}
        />
      </Box>
    </Box>
  );
};

export default SentimentLinearScaleSettings;
