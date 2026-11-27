import React from 'react';

import { ListBoxOption } from 'design-system/ListBox';
import { DialogTrigger } from 'design-system/Popover';
import TagPicker from 'design-system/TagPicker';
import { Key } from 'design-system/types';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import SetupCard from '../SetupCard';
import { useSetupDraft } from '../SetupDraftContext';

import messages from './messages';

interface Props {
  ready?: boolean;
}

const TopicTagsCard = ({ ready }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: topics } = useGlobalTopics({});
  const { data: appConfiguration } = useAppConfiguration();
  const { values, changeProject } = useSetupDraft();

  const topicIds = values.global_topic_ids;

  const topicsTerm =
    appConfiguration &&
    localize(coreSettings(appConfiguration.data).topics_term);
  const title = formatMessage(messages.topicTagsTitle);

  const options = (topics?.data ?? []).map((topic) => ({
    id: topic.id,
    label: localize(topic.attributes.title_multiloc),
  }));

  const changeTopics = (keys: Set<Key>) => {
    changeProject('global_topic_ids', Array.from(keys, String));
  };

  return (
    <DialogTrigger>
      <SetupCard
        id="e2e-setup-card-topics"
        tooltip={formatMessage(messages.topicTagsDescription2)}
        title={topicsTerm ? `${title} (${topicsTerm})` : title}
        ready={ready}
        summary={
          topicIds.length > 0
            ? formatMessage(messages.topicTagsCount, {
                count: topicIds.length,
              })
            : undefined
        }
        behaviour={{ kind: 'trigger' }}
      />
      <TagPicker
        aria-label={title}
        items={options}
        selectedKeys={new Set(topicIds)}
        onSelectionChange={changeTopics}
      >
        {(option) => (
          <ListBoxOption id={option.id}>{option.label}</ListBoxOption>
        )}
      </TagPicker>
    </DialogTrigger>
  );
};

export default TopicTagsCard;
