import React, { KeyboardEvent, useRef, useState } from 'react';

import { Box, ClickOutside } from '@citizenlab/cl2-component-library';

import useGlobalTopics from 'api/global_topics/useGlobalTopics';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import PillPickerPopover from 'components/UI/PillPicker/PillPickerPopover';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';
import SetupCard from '../SetupCard';
import { getDraftValues, useSetupDraft } from '../SetupDraftContext';

interface Props {
  project: IProjectData;
  ready?: boolean;
}

const TopicTagsCard = ({ project, ready }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: topics } = useGlobalTopics({});
  const { changes, changeProject } = useSetupDraft();
  const cardRef = useRef<HTMLDivElement>(null);
  const [opened, setOpened] = useState(false);

  const { topicIds } = getDraftValues(project, changes);

  const toggleTopic = (topicId: string) => {
    changeProject({
      global_topic_ids: topicIds.includes(topicId)
        ? topicIds.filter((id) => id !== topicId)
        : [...topicIds, topicId],
    });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Escape' || !opened) return;
    event.stopPropagation();
    setOpened(false);
  };

  return (
    <ClickOutside
      onClickOutside={() => setOpened(false)}
      closeOnClickOutsideEnabled={opened}
    >
      <Box ref={cardRef} position="relative" onKeyDown={handleKeyDown}>
        <SetupCard
          id="e2e-setup-card-topics"
          title={formatMessage(messages.topicTags)}
          ready={ready}
          summary={
            topicIds.length > 0
              ? formatMessage(messages.topicTagsCount, {
                  count: topicIds.length,
                })
              : undefined
          }
          behaviour={{
            kind: 'action',
            icon: opened ? 'chevron-up' : 'chevron-down',
            expanded: opened,
            onClick: () => setOpened((opened) => !opened),
          }}
        />
        {opened && (
          <PillPickerPopover
            triggerRef={cardRef}
            width="100%"
            options={(topics?.data ?? []).map((topic) => ({
              value: topic.id,
              label: localize(topic.attributes.title_multiloc),
            }))}
            selected={topicIds}
            searchPlaceholder={formatMessage(messages.topicTagsSearch)}
            noMatchLabel={formatMessage(messages.topicTagsNoMatch)}
            onToggle={toggleTopic}
            onClose={() => setOpened(false)}
          />
        )}
      </Box>
    </ClickOutside>
  );
};

export default TopicTagsCard;
