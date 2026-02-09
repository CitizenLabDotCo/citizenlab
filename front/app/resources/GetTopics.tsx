import {
  IGlobalTopicData,
  IGlobalTopicsQueryParams,
} from 'api/global_topics/types';
import useGlobalTopics from 'api/global_topics/useGlobalTopics';

import { NilOrError } from 'utils/helperUtils';

type children = (renderProps: GetTopicsChildProps) => JSX.Element | null;

type Props = IGlobalTopicsQueryParams & {
  topicIds?: string[];
  children?: children;
};

export type GetTopicsChildProps = IGlobalTopicData[] | NilOrError;

const GetTopics = ({ topicIds, children, ...queryParameters }: Props) => {
  const { data: topicsData } = useGlobalTopics(queryParameters);

  const topics = topicIds
    ? topicsData?.data.filter((topic) => topicIds.includes(topic.id))
    : topicsData?.data;
  return (children as children)(topics);
};

export default GetTopics;
