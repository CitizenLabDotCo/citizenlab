import React from 'react';

import {
  bo,
  Box,
  colors,
  Text,
  Toggle,
} from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';
import useUpdatePhase from 'api/phases/useUpdatePhase';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import AutoShareNotice from './AutoShareNotice';
import Card from './Card';

const TOGGLE_ID = 'auto-share-results';

interface Props {
  phase: IPhaseData;
}

const AutoShareResults = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const { mutate: updatePhase, isPending } = useUpdatePhase();
  const enabled = !!phase.attributes.autoshare_results_enabled;

  return (
    <Card fillHeight>
      <Box display="flex" flexDirection="column" gap="8px">
        {enabled && <AutoShareNotice phase={phase} />}
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="12px"
          minHeight="44px"
          p="8px 12px"
          border={`1px solid ${colors.grey200}`}
          borderRadius={bo.borderRadius}
        >
          <Box as="label" htmlFor={TOGGLE_ID} cursor="pointer">
            <Text as="span" variant="boControl" m="0">
              {formatMessage(messages.autoShareResults)}
            </Text>
          </Box>
          <Toggle
            id={TOGGLE_ID}
            variant="bo"
            checked={enabled}
            disabled={isPending}
            onChange={() =>
              updatePhase({
                phaseId: phase.id,
                autoshare_results_enabled: !enabled,
              })
            }
          />
        </Box>
      </Box>
    </Card>
  );
};

export default AutoShareResults;
