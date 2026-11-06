import React from 'react';

import {
  Box,
  CollapsibleContainer,
  Text,
} from '@citizenlab/cl2-component-library';

import { AiAssistantConversationStatus } from 'api/ai_assistant_conversations/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { DraftPhase, changeElementId } from '../../draft';
import messages from '../../messages';
import ChangedText from '../Item/ChangedText';
import ChangedValue from '../Item/ChangedValue';
import DraftItem from '../Item/DraftItem';
import ItemActions from '../Item/ItemActions';
import OtherSettings from '../Item/OtherSettings';
import ProposedChangeBadge from '../Item/ProposedChangeBadge';

import DetailSection from './DetailSection';
import ItemIcon from './ItemIcon';
import { METHOD_ICONS } from './methodIcons';
import PhaseAccessRights from './PhaseAccessRights';
import { getSettingKeys } from './phaseSettingRows';
import PhaseSettings from './PhaseSettings';
import TimelineBar from './TimelineBar';
import { TimelineScale, phaseSpan } from './timelineScale';
import usePhaseLabels from './usePhaseLabels';

const ROW_KEYS = [
  'phase_id',
  'title_multiloc',
  'description_multiloc',
  'start_at',
  'end_at',
  'participation_method',
  'placement_type',
];

type Props = {
  phase: DraftPhase;
  scale: TimelineScale;
  conversationId?: string;
  status?: AiAssistantConversationStatus;
};

const PhaseRow = ({ phase, scale, conversationId, status }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { descriptionOf, methodOf, datesOf } = usePhaseLabels();

  const { change, permissionChange, changed, previous } = phase;
  const pending = change ?? permissionChange;
  const removed = change?.kind === 'remove';
  const isChanged = (key: string) => changed.includes(key);

  const title = localize(phase.title);
  const description = descriptionOf(phase);
  const previousDescription = previous && descriptionOf(previous);
  const settingKeys = getSettingKeys(phase.method, phase.settings, {
    formatMessage,
    localize,
  });

  return (
    <DraftItem
      id={pending && changeElementId(pending.toolCall.id)}
      pending={!!pending}
      removed={removed}
    >
      <Box p="16px" display="flex" gap="12px">
        <ItemIcon name={METHOD_ICONS[phase.method]} highlighted={!!pending} />
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
                  changed={isChanged('participation_method')}
                  previous={previous && methodOf(previous)}
                >
                  {methodOf(phase)}
                </ChangedValue>
                {' · '}
                <ChangedValue
                  changed={isChanged('start_at') || isChanged('end_at')}
                  previous={previous && datesOf(previous)}
                >
                  {datesOf(phase)}
                </ChangedValue>
              </Text>
              {phase.settings.placement_type === 'standalone' && (
                <Text m="0px" fontSize="xs" color="textSecondary">
                  {formatMessage(messages.standalone)}
                </Text>
              )}
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
              {pending && <ProposedChangeBadge kind={pending.kind} />}
              <TimelineBar
                scale={scale}
                span={phaseSpan(phase.startAt, phase.endAt)}
                tone={removed ? 'removed' : change ? 'pending' : 'saved'}
              />
            </Box>
          </Box>

          <CollapsibleContainer
            // Opens again when a new proposed change arrives, so the admin sees it.
            key={pending?.toolCall.id ?? 'saved'}
            title={formatMessage(messages.details)}
            titleVariant="h6"
            titleAs="h4"
            titleFontWeight="normal"
            isOpenByDefault={!!pending && !removed}
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
            <DetailSection title={formatMessage(messages.participation)}>
              <PhaseSettings phase={phase} />
            </DetailSection>
            <DetailSection title={formatMessage(messages.accessRights)}>
              <PhaseAccessRights phase={phase} />
            </DetailSection>
            <OtherSettings
              values={phase.values}
              shownKeys={[...ROW_KEYS, ...settingKeys]}
            />
          </CollapsibleContainer>

          <ItemActions
            change={pending}
            conversationId={conversationId}
            status={status}
            toMessage={(request) =>
              formatMessage(messages.refinePhaseRequest, { title, request })
            }
          />
        </Box>
      </Box>
    </DraftItem>
  );
};

export default PhaseRow;
