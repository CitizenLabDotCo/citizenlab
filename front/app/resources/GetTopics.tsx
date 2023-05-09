import { ITopicData, ITopicsQueryParams } from 'api/topics/types';
import { NilOrError } from 'utils/helperUtils';
import useTopics from 'api/topics/useTopics';

type children = (renderProps: GetTopicsChildProps) => JSX.Element | null;

type Props = ITopicsQueryParams & {
  topicIds?: string[];
  children?: children;
};

export type GetTopicsChildProps = ITopicData[] | NilOrError;

const GetTopics = ({ topicIds, children, ...queryParameters }: Props) => {
  const { data: topicsData } = useTopics(queryParameters);

  const topics = topicIds
    ? topicsData?.data.filter((topic) => topicIds.includes(topic.id))
    : topicsData?.data;
  return (children as children)(topics);
};

export default GetTopics;
