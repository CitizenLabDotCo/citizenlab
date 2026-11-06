import React from 'react';

import {
  Box,
  CollapsibleContainer,
  Text,
} from '@citizenlab/cl2-component-library';

import { AiAssistantConversationStatus } from 'api/ai_assistant_conversations/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { DraftEvent, changeElementId } from '../../draft';
import messages from '../../messages';
import ChangedText from '../Item/ChangedText';
import ChangedValue from '../Item/ChangedValue';
import DraftItem from '../Item/DraftItem';
import ItemActions from '../Item/ItemActions';
import OtherSettings from '../Item/OtherSettings';
import ProposedChangeBadge from '../Item/ProposedChangeBadge';

import DetailSection from './DetailSection';
import ItemIcon from './ItemIcon';
import TimelineBar from './TimelineBar';
import { TimelineScale, eventSpan } from './timelineScale';
import useEventLabels from './useEventLabels';

const ROW_KEYS = [
  'title_multiloc',
  'description_multiloc',
  'location_multiloc',
  'address_1',
  'online_link',
  'start_at',
  'end_at',
];

type Props = {
  event: DraftEvent;
  scale: TimelineScale;
  conversationId?: string;
  status?: AiAssistantConversationStatus;
};

const EventRow = ({ event, scale, conversationId, status }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { descriptionOf, timeOf, placeOf, fullLocationOf } = useEventLabels();

  const { change, changed, previous } = event;
  const removed = change?.kind === 'remove';
  const isChanged = (key: string) => changed.includes(key);
  const locationChanged =
    isChanged('location_multiloc') || isChanged('address_1');

  const title = localize(event.title);
  const description = descriptionOf(event);
  const previousDescription = previous && descriptionOf(previous);
  const place = placeOf(event);
  const previousPlace = previous && placeOf(previous);
  const fullLocation = fullLocationOf(event);
  const previousFullLocation = previous && fullLocationOf(previous);

  return (
    <DraftItem
      id={change && changeElementId(change.toolCall.id)}
      pending={!!change}
      removed={removed}
    >
      <Box p="16px" display="flex" gap="12px">
        <ItemIcon name="calendar" highlighted={!!change} />
        <Box
          flex="1"
          minWidth="0"
          display="flex"
          flexDirection="column"
          gap="8px"
        >
          <Box display="flex" alignItems="flex-start" gap="16px">
            <Box flex="1" minWidth="0">
              <Text
                m="0px"
                fontWeight="semi-bold"
                textDecoration={removed ? 'line-through' : undefined}
              >
                <ChangedValue
                  changed={isChanged('title_multiloc')}
                  previous={previous && localize(previous.title)}
                >
                  {title}
                </ChangedValue>
              </Text>
              <Text m="0px" fontSize="s" color="textSecondary">
                <ChangedValue
                  changed={isChanged('start_at') || isChanged('end_at')}
                  previous={previous && timeOf(previous)}
                >
                  {timeOf(event)}
                </ChangedValue>
                {(place || previousPlace) && (
                  <>
                    {' · '}
                    <ChangedValue
                      changed={locationChanged}
                      previous={previousPlace}
                    >
                      {place}
                    </ChangedValue>
                  </>
                )}
              </Text>
            </Box>
            <Box
              width="200px"
              flexShrink={0}
              display="flex"
              flexDirection="column"
              alignItems="flex-end"
              gap="10px"
              pt="4px"
            >
              {change && <ProposedChangeBadge kind={change.kind} />}
              <TimelineBar
                scale={scale}
                span={eventSpan(event.startAt, event.endAt)}
                tone={removed ? 'removed' : change ? 'pending' : 'saved'}
                point
              />
            </Box>
          </Box>

          <CollapsibleContainer
            key={change?.toolCall.id ?? 'saved'}
            title={formatMessage(messages.details)}
            titleVariant="h6"
            titleAs="h4"
            titleFontWeight="normal"
            isOpenByDefault={!!change && !removed}
          >
            {(description || previousDescription) && (
              <DetailSection title={formatMessage(messages.description)}>
                <ChangedText
                  changed={isChanged('description_multiloc')}
                  previous={previousDescription}
                >
                  {description}
                </ChangedText>
              </DetailSection>
            )}
            {(fullLocation || previousFullLocation) && (
              <DetailSection title={formatMessage(messages.location)}>
                <Text m="0px" fontSize="s">
                  <ChangedValue
                    changed={locationChanged}
                    previous={previousFullLocation}
                  >
                    {fullLocation}
                  </ChangedValue>
                </Text>
              </DetailSection>
            )}
            {(event.onlineLink || previous?.onlineLink) && (
              <DetailSection title={formatMessage(messages.onlineLink)}>
                <Text m="0px" fontSize="s" wordBreak="break-all">
                  <ChangedValue
                    changed={isChanged('online_link')}
                    previous={previous?.onlineLink}
                  >
                    {event.onlineLink}
                  </ChangedValue>
                </Text>
              </DetailSection>
            )}
            <OtherSettings values={event.values} shownKeys={ROW_KEYS} />
          </CollapsibleContainer>

          <ItemActions
            change={change}
            conversationId={conversationId}
            status={status}
            toMessage={(request) =>
              formatMessage(messages.refineEventRequest, { title, request })
            }
          />
        </Box>
      </Box>
    </DraftItem>
  );
};

export default EventRow;
