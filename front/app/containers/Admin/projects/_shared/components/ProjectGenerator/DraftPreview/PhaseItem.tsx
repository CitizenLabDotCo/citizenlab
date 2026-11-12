import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import { DraftPhase, changeElementId } from '../draft';

import AccessRightsChange from './AccessRightsChange';
import ApprovalActions from './ApprovalActions';
import DraftItem from './DraftItem';
import ItemIcon from './ItemIcon';
import { METHOD_ICONS } from './methodIcons';
import ProposedChangeBadge from './ProposedChangeBadge';
import usePhaseLabels from './usePhaseLabels';

type Props = {
  phase: DraftPhase;
  conversationId?: string;
};

const PhaseItem = ({ phase, conversationId }: Props) => {
  const localize = useLocalize();
  const { descriptionOf, methodOf, datesOf } = usePhaseLabels();
  const { change } = phase;
  const removed = change?.kind === 'remove';
  const description = descriptionOf(phase);

  return (
    <DraftItem
      id={change && changeElementId(change.toolCall.id)}
      pending={!!change}
      removed={removed}
    >
      <Box p="16px" display="flex" gap="14px">
        <ItemIcon name={METHOD_ICONS[phase.method]} highlighted={!!change} />
        <Box
          flex="1"
          minWidth="0"
          display="flex"
          flexDirection="column"
          gap="8px"
        >
          <Box
            display="flex"
            alignItems="flex-start"
            justifyContent="space-between"
            gap="8px"
          >
            <Box minWidth="0">
              <Text
                m="0px"
                fontWeight="bold"
                textDecoration={removed ? 'line-through' : undefined}
              >
                {localize(phase.title)}
              </Text>
              <Text m="0px" fontSize="s" color="textSecondary">
                {`${methodOf(phase)} · ${datesOf(phase)}`}
              </Text>
            </Box>
            {change && <ProposedChangeBadge kind={change.kind} />}
          </Box>
          {description && (
            <Text m="0px" color="textSecondary">
              {description}
            </Text>
          )}
          <AccessRightsChange change={change} />
          <ApprovalActions change={change} conversationId={conversationId} />
        </Box>
      </Box>
    </DraftItem>
  );
};

export default PhaseItem;
