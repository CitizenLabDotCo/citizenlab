import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { DraftPhase } from '../../draft';
import messages from '../../messages';
import ChangedValue from '../Item/ChangedValue';
import SettingRow from '../Item/SettingRow';

import { getSettingRows, hasSettings } from './phaseSettingRows';

type Props = {
  phase: DraftPhase;
};

const PhaseSettings = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const format = { formatMessage, localize };
  const rows = getSettingRows(phase.method, phase.settings, format);
  const previousRows = phase.previous
    ? getSettingRows(phase.previous.method, phase.previous.settings, format)
    : [];

  // A proposed phase only lists the settings the assistant chose.
  if (rows.length === 0) {
    return (
      <Text m="0px" fontSize="s" color="textSecondary">
        {formatMessage(
          hasSettings(phase.method)
            ? messages.defaultSettings
            : messages.noSettings
        )}
      </Text>
    );
  }

  return (
    <Box>
      {rows.map(({ label, value, keys }) => (
        <SettingRow key={label.id} label={formatMessage(label)}>
          <Text m="0px" fontSize="s">
            <ChangedValue
              changed={keys.some((key) => phase.changed.includes(key))}
              previous={
                previousRows.find((row) => row.label.id === label.id)?.value
              }
            >
              {value}
            </ChangedValue>
          </Text>
        </SettingRow>
      ))}
    </Box>
  );
};

export default PhaseSettings;
