import React from 'react';

import { map, orderBy } from 'lodash-es';
import { IOption } from 'typings';

import { ICommentsByTopic } from 'api/comments_by_topic/types';
import useCommentsByTopic from 'api/comments_by_topic/useCommentsByTopic';
import { IIdeasByTopic } from 'api/ideas_by_topic/types';
import useIdeasByTopic from 'api/ideas_by_topic/useIdeasByTopic';
import { IReactionsByTopic } from 'api/reactions_by_topic/types';
import useReactionsByTopic from 'api/reactions_by_topic/useReactionsByTopic';

import useLocalize from 'hooks/useLocalize';

import { IResolution } from 'components/admin/ResolutionControl';

import { IResource } from '..';

import SelectableResourceChart from './SelectableResourceChart';

interface QueryProps {
  startAt: string | null | undefined;
  endAt: string | null;
}

interface InputProps {
  className: string;
  onResourceByTopicChange: (option: IOption) => void;
  currentResourceByTopic: IResource;
  resourceOptions: IOption[];
  startAt: string | null | undefined;
  endAt: string | null;
  resolution: IResolution;
  currentProjectFilter: string | undefined;
  currentProjectFilterLabel: string | undefined;
}

interface Props extends InputProps, QueryProps {}

const SelectableResourceByTopicChart = ({
  currentResourceByTopic,
  onResourceByTopicChange,
  ...otherProps
}: Props) => {
  const { data: ideasByTopic } = useIdeasByTopic({
    start_at: otherProps.startAt,
    end_at: otherProps.endAt,
    project: otherProps.currentProjectFilter,
    enabled: currentResourceByTopic === 'ideas',
  });

  const { data: commentsByTopic } = useCommentsByTopic({
    start_at: otherProps.startAt,
    end_at: otherProps.endAt,
    project: otherProps.currentProjectFilter,
    enabled: currentResourceByTopic === 'comments',
  });

  const { data: reactionsByTopic } = useReactionsByTopic({
    start_at: otherProps.startAt,
    end_at: otherProps.endAt,
    project: otherProps.currentProjectFilter,
    enabled: currentResourceByTopic === 'reactions',
  });

  const localize = useLocalize();

  const convertToGraphFormat = (
    data: IIdeasByTopic | IReactionsByTopic | ICommentsByTopic
  ) => {
    const { series, topics } = data.data.attributes;

    const dataKey =
      currentResourceByTopic === 'reactions' ? 'total' : currentResourceByTopic;

    const mapped = map(series[dataKey], (count: number, topicId: string) => ({
      name: localize(topics[topicId].title_multiloc),
      value: count,
      code: topicId,
    }));

    const sortedByValue = orderBy(mapped, 'value', 'desc');

    return sortedByValue.length > 0 ? sortedByValue : null;
  };

  const data: Record<IResource, any> = {
    ideas: ideasByTopic,
    comments: commentsByTopic,
    reactions: reactionsByTopic,
  };

  const serie =
    data[currentResourceByTopic] &&
    convertToGraphFormat(data[currentResourceByTopic]);

  return (
    <SelectableResourceChart
      onResourceByXChange={onResourceByTopicChange}
      currentSelectedResource={currentResourceByTopic}
      serie={serie}
      currentFilter={undefined}
      byWhat="Topic"
      {...otherProps}
    />
  );
};

export default SelectableResourceByTopicChart;
