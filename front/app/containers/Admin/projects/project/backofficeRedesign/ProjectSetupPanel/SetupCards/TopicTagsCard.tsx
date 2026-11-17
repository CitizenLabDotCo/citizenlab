import React from 'react';

import { DialogTrigger, Key } from 'react-aria-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { coreSettings } from 'api/app_configuration/utils';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';
import { IProjectData } from 'api/projects/types';

import useLocalize from 'hooks/useLocalize';

import { ListBoxOption } from 'design-system/ListBox';
import TagPicker from 'design-system/TagPicker';

import { useIntl } from 'utils/cl-intl';

import projectSetupPanelMessages from '../messages';
import SetupCard from '../SetupCard';
import { getDraftValues, useSetupDraft } from '../SetupDraftContext';

import messages from './messages';

interface Props {
  project: IProjectData;
  ready?: boolean;
}

const TopicTagsCard = ({ project, ready }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const { data: topics } = useGlobalTopics({});
  const { data: appConfiguration } = useAppConfiguration();
  const { changes, changeProject } = useSetupDraft();

  const { topicIds } = getDraftValues(project, changes);

  const topicsTerm =
    appConfiguration &&
    localize(coreSettings(appConfiguration.data).topics_term);
  const title = formatMessage(projectSetupPanelMessages.topicTags);

  const options = (topics?.data ?? []).map((topic) => ({
    id: topic.id,
    label: localize(topic.attributes.title_multiloc),
  }));

  const changeTopics = (keys: Set<Key>) => {
    changeProject({ global_topic_ids: Array.from(keys, String) });
  };

  return (
    <DialogTrigger>
      <SetupCard
        id="e2e-setup-card-topics"
        tooltip={formatMessage(messages.topicTagsDescription)}
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
