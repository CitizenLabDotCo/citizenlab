import React, { memo } from 'react';

// styling
import styled from 'styled-components';
import { fontSizes, isRtl } from 'utils/styleUtils';
import { transparentize } from 'polished';

// typings
import useLocalize from 'hooks/useLocalize';
import useTopic from 'api/topics/useTopic';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Topic = styled.div`
  color: ${({ theme }) => theme.colors.tenantSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  padding: 6px 12px;
  margin-right: 5px;
  margin-bottom: 5px;
  border: 1px solid
    ${({ theme }) => transparentize(0.7, theme.colors.tenantSecondary)};
  border-radius: ${(props) => props.theme.borderRadius};

  ${isRtl`
    margin-right: 0;
    margin-left: 5px;
  `}
`;

interface Props {
  postTopicIds: string[];
  className?: string;
  postType: 'idea' | 'initiative';
}

const Topics = memo(({ postTopicIds, className, postType }: Props) => {
  return (
    <Container id={`e2e-${postType}-topics`} className={className}>
      {postTopicIds.map((topicId: string) => {
        return (
          <TopicComponent key={topicId} topicId={topicId} postType={postType} />
        );
      })}
    </Container>
  );
});

const TopicComponent = ({
  topicId,
  postType,
}: {
  topicId: string;
  postType: 'idea' | 'initiative';
}) => {
  const { data: topic } = useTopic(topicId);
  const localize = useLocalize();

  if (!topic) return null;

  return (
    <Topic className={`e2e-${postType}-topic`}>
      {localize(topic.data.attributes.title_multiloc)}
    </Topic>
  );
};

export default Topics;
