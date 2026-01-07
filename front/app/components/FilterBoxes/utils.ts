import { get } from 'lodash-es';

import { IGlobalTopicData } from 'api/global_topics/types';

import { Localize } from 'hooks/useLocalize';

import { isNilOrError } from 'utils/helperUtils';

import { FilterCounts } from './types';

export const scrollToTopIdeasList = () => {
  const ideasListPanel = document.getElementById('ideas-list-scroll-anchor');
  ideasListPanel?.scrollIntoView({
    behavior: 'smooth',
  });
};

export const getTopicsWithIdeas = (
  topics: IGlobalTopicData[],
  filterCounts: FilterCounts
) => {
  return topics.filter((topic) => {
    const filterPostCount = get(filterCounts, `topic_id.${topic.id}`, 0);
    return filterPostCount > 0;
  });
};

export const getSelectedTopicNames = (
  selectedTopics: IGlobalTopicData[],
  localize: Localize
) => {
  return selectedTopics
    .map((topic) => {
      return !isNilOrError(topic) && localize(topic.attributes.title_multiloc);
    })
    .join(', ');
};
