import React from 'react';

import { bo, Box, colors } from '@citizenlab/cl2-component-library';

import { ICauseData } from 'api/causes/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import StatRow from '../InputManager/SideColumn/StatRow';

import messages from './messages';

interface Props {
  causes: ICauseData[];
  selectedCauseIds: string[];
  onToggleCause: (causeId: string) => void;
}

// The phase total, then a row per cause. A cause with volunteers filters the
// list to them; a second click clears that filter.
const CauseStats = ({ causes, selectedCauseIds, onToggleCause }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const total = causes.reduce(
    (sum, cause) => sum + cause.attributes.volunteers_count,
    0
  );
  const onlySelected = selectedCauseIds.length === 1 && selectedCauseIds[0];

  return (
    <Box p="8px" borderRadius={bo.panelBorderRadius} background={colors.white}>
      <StatRow label={formatMessage(messages.volunteers)} value={total} />
      {causes.map((cause) => {
        const count = cause.attributes.volunteers_count;

        return (
          <StatRow
            key={cause.id}
            label={localize(cause.attributes.title_multiloc)}
            value={count}
            onClick={count > 0 ? () => onToggleCause(cause.id) : undefined}
            pressed={onlySelected === cause.id}
          />
        );
      })}
    </Box>
  );
};

export default CauseStats;
