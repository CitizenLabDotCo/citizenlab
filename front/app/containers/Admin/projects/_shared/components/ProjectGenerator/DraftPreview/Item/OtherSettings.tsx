import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { ProposedValues } from '../../draft';
import messages from '../../messages';

import ChangedValue from './ChangedValue';
import { getOtherSettingRows } from './otherSettingRows';
import SettingRow from './SettingRow';

type Props = {
  values: ProposedValues;
  // The keys that already have a row, so they don't show twice.
  shownKeys: string[];
  title?: string;
};

const OtherSettings = ({ values, shownKeys, title }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const rows = getOtherSettingRows(values, shownKeys, {
    formatMessage,
    localize,
  });

  if (rows.length === 0) return null;

  return (
    <Box mt="12px" pt="12px" borderTop={`1px solid ${colors.grey200}`}>
      <Text m="0px" mb="4px" fontSize="s" fontWeight="semi-bold">
        {title ?? formatMessage(messages.otherSettings)}
      </Text>
      {rows.map(({ key, label, value, previous }) => (
        <SettingRow key={key} label={label}>
          <Text m="0px" fontSize="s" wordBreak="break-all">
            <ChangedValue changed previous={previous}>
              {value}
            </ChangedValue>
          </Text>
        </SettingRow>
      ))}
    </Box>
  );
};

export default OtherSettings;
