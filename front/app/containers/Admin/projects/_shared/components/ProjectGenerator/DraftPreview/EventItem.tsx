import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import useLocalize from 'hooks/useLocalize';

import { DraftEvent, changeElementId } from '../draft';

import ApprovalActions from './ApprovalActions';
import DraftItem from './DraftItem';
import ItemIcon from './ItemIcon';
import ProposedChangeBadge from './ProposedChangeBadge';
import useEventLabels from './useEventLabels';

type Props = {
  event: DraftEvent;
  conversationId?: string;
};

const EventItem = ({ event, conversationId }: Props) => {
  const localize = useLocalize();
  const { timeOf, placeOf } = useEventLabels();
  const { change } = event;
  const removed = change?.kind === 'remove';
  const place = placeOf(event);

  return (
    <DraftItem
      id={change && changeElementId(change.toolCall.id)}
      pending={!!change}
      removed={removed}
    >
      <Box p="16px" display="flex" gap="14px">
        <ItemIcon name="calendar" highlighted={!!change} />
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
                {localize(event.title)}
              </Text>
              <Text m="0px" fontSize="s" color="textSecondary">
                {place ? `${timeOf(event)} · ${place}` : timeOf(event)}
              </Text>
            </Box>
            {change && <ProposedChangeBadge kind={change.kind} />}
          </Box>
          <ApprovalActions change={change} conversationId={conversationId} />
        </Box>
      </Box>
    </DraftItem>
  );
};

export default EventItem;
