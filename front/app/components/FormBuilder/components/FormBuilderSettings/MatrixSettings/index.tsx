import React from 'react';

import { Title, Box } from '@citizenlab/cl2-component-library';
import { SupportedLocale } from 'typings';

import { IFlatCustomFieldWithIndex } from 'api/custom_fields/types';

import { useIntl } from 'utils/cl-intl';

import ConfigOptionsWithLocaleSwitcher from '../ConfigOptionsWithLocaleSwitcher';
import LinearScaleSettings from '../LinearScaleSettings';

import messages from './messages';

type Props = {
  field: IFlatCustomFieldWithIndex;
  locales: SupportedLocale[];
  platformLocale: SupportedLocale;
};

const MatrixSettings = ({ field, locales, platformLocale }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box mb="24px">
      <Title mt="40px" color="coolGrey600" variant="h4">
        {formatMessage(messages.columns)}
      </Title>
      <LinearScaleSettings
        platformLocale={platformLocale}
        maximumName={`customFields.${field.index}.maximum`}
        labelBaseName={`customFields.${field.index}`}
        locales={locales}
      />

      <Title mt="40px" color="coolGrey600" variant="h4">
        {formatMessage(messages.rows)}
      </Title>
      <ConfigOptionsWithLocaleSwitcher
        name={`customFields.${field.index}.matrix_statements`}
        locales={locales}
        platformLocale={platformLocale}
        inputType={field.input_type}
        listType="statement"
      />
    </Box>
  );
};

export default MatrixSettings;
