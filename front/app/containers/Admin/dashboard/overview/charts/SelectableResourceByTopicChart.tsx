// libraries
import React from 'react';
import { map, orderBy } from 'lodash-es';

// components
import SelectableResourceChart from './SelectableResourceChart';

// hooks
import useLocalize from 'hooks/useLocalize';

// typings
import {
  IIdeasByTopic,
  ideasByTopicStream,
  ICommentsByTopic,
  commentsByTopicStream,
  IVotesByTopic,
  votesByTopicStream,
} from 'services/stats';
import { IResource } from '..';
import { IResolution } from 'components/admin/ResolutionControl';
import { IOption } from 'typings';

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
  currentProjectFilterLabel: string | undefined;
}

interface Props extends InputProps, QueryProps {}

const getCurrentStream = (currentResourceByTopic: IResource) => {
  if (currentResourceByTopic === 'ideas') {
    return ideasByTopicStream;
  } else if (currentResourceByTopic === 'comments') {
    return commentsByTopicStream;
  } else {
    return votesByTopicStream;
  }
};

const SelectableResourceByTopicChart = ({
  currentResourceByTopic,
  onResourceByTopicChange,
  ...otherProps
}: Props) => {
  const localize = useLocalize();

  const convertToGraphFormat = (
    data: IIdeasByTopic | IVotesByTopic | ICommentsByTopic
  ) => {
    const { series, topics } = data;
    const dataKey =
      currentResourceByTopic === 'votes' ? 'total' : currentResourceByTopic;

    const mapped = map(series[dataKey], (count: number, topicId: string) => ({
      name: localize(topics[topicId].title_multiloc),
      value: count,
      code: topicId,
    }));

    const sortedByValue = orderBy(mapped, 'value', 'desc');
    return sortedByValue.length > 0 ? sortedByValue : null;
  };

  return (
    <SelectableResourceChart
      onResourceByXChange={onResourceByTopicChange}
      currentSelectedResource={currentResourceByTopic}
      stream={getCurrentStream(currentResourceByTopic)}
      convertToGraphFormat={convertToGraphFormat}
      currentFilter={undefined}
      byWhat="Topic"
      {...otherProps}
    />
  );
};

export default SelectableResourceByTopicChart;
