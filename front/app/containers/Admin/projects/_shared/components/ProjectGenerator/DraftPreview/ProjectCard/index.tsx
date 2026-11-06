import React from 'react';

import {
  Box,
  CollapsibleContainer,
  Divider,
  Icon,
  Image,
  Text,
  Title,
  colors,
} from '@citizenlab/cl2-component-library';

import { AiAssistantConversationStatus } from 'api/ai_assistant_conversations/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import { DraftProject, changeElementId } from '../../draft';
import messages from '../../messages';
import ChangedText from '../Item/ChangedText';
import ChangedValue from '../Item/ChangedValue';
import DraftItem from '../Item/DraftItem';
import ItemActions from '../Item/ItemActions';
import ProposedChangeBadge from '../Item/ProposedChangeBadge';
import SettingRow from '../Item/SettingRow';

import ChangedChips from './ChangedChips';
import useProjectLabels from './useProjectLabels';

type Props = {
  projectId: string;
  draft: DraftProject;
  conversationId?: string;
  status?: AiAssistantConversationStatus;
};

const ProjectCard = ({ projectId, draft, conversationId, status }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { areaLabelsOf, topicLabelsOf, visibilityOf, listingOf } =
    useProjectLabels(projectId);

  const { change, changed, previous } = draft;
  const isChanged = (key: string) => changed.includes(key);

  const areasChanged = isChanged('area_ids') || isChanged('include_all_areas');

  return (
    <DraftItem
      id={change && changeElementId(change.toolCall.id)}
      pending={!!change}
      display="flex"
      overflow="hidden"
    >
      <Box
        width="200px"
        flexShrink={0}
        bgColor={colors.teal50}
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        gap="8px"
      >
        {draft.headerImageUrl ? (
          <Image
            src={draft.headerImageUrl}
            alt=""
            width="100%"
            height="100%"
            objectFit="cover"
          />
        ) : (
          <>
            <Icon name="image" fill={colors.teal400} />
            <Text
              m="0px"
              px="16px"
              fontSize="xs"
              color="teal700"
              textAlign="center"
            >
              {formatMessage(messages.addImageLater)}
            </Text>
          </>
        )}
      </Box>

      <Box
        flex="1"
        minWidth="0"
        p="20px"
        display="flex"
        flexDirection="column"
        gap="12px"
      >
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap="8px"
        >
          <Text m="0px" fontSize="s" color="textSecondary">
            {formatMessage(messages.cardLabel)}
          </Text>
          {change && <ProposedChangeBadge kind={change.kind} />}
        </Box>
        <Title variant="h3" as="h3" m="0px">
          <ChangedValue
            changed={isChanged('title_multiloc')}
            previous={previous && localize(previous.title)}
          >
            {localize(draft.title)}
          </ChangedValue>
        </Title>
        <ChangedText
          changed={isChanged('description_preview_multiloc')}
          previous={previous && localize(previous.descriptionPreview)}
          fontSize="base"
          color="textSecondary"
        >
          {localize(draft.descriptionPreview)}
        </ChangedText>

        <Divider m="0px" />

        <SettingRow label={formatMessage(messages.areas)}>
          <ChangedChips
            icon="position"
            changed={areasChanged}
            labels={areaLabelsOf(draft)}
            previousLabels={previous && areaLabelsOf(previous)}
          />
        </SettingRow>
        <SettingRow label={formatMessage(messages.topics)}>
          <ChangedChips
            icon="label"
            changed={isChanged('global_topic_ids')}
            labels={topicLabelsOf(draft)}
            previousLabels={previous && topicLabelsOf(previous)}
          />
        </SettingRow>

        <CollapsibleContainer
          title={formatMessage(messages.moreSettings)}
          titleVariant="h6"
          titleAs="h4"
          titleFontWeight="normal"
          isOpenByDefault={isChanged('visible_to') || isChanged('listed')}
        >
          <Box pt="8px">
            <SettingRow label={formatMessage(messages.visibility)}>
              <Text m="0px" fontSize="s">
                <ChangedValue
                  changed={isChanged('visible_to') || isChanged('group_ids')}
                  previous={previous && visibilityOf(previous)}
                >
                  {visibilityOf(draft)}
                </ChangedValue>
              </Text>
            </SettingRow>
            <SettingRow label={formatMessage(messages.listing)}>
              <Text m="0px" fontSize="s">
                <ChangedValue
                  changed={isChanged('listed')}
                  previous={previous && listingOf(previous)}
                >
                  {listingOf(draft)}
                </ChangedValue>
              </Text>
            </SettingRow>
          </Box>
        </CollapsibleContainer>

        <ItemActions
          change={change}
          conversationId={conversationId}
          status={status}
          toMessage={(request) =>
            formatMessage(messages.refineProjectRequest, { request })
          }
        />
      </Box>
    </DraftItem>
  );
};

export default ProjectCard;
