import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// hooks
import useTopics from 'hooks/useTopics';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// styling
import styled from 'styled-components';
import { fontSizes, isRtl } from 'utils/styleUtils';
import { transparentize } from 'polished';

// typings
import { ITopicData } from 'services/topics';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;

  ${isRtl`
    flex-direction: row-reverse;
  `}
`;

const Topic = styled.div`
  color: ${({ theme }) => theme.colorSecondary};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  padding: 6px 12px;
  margin-right: 5px;
  margin-bottom: 5px;
  background: ${({ theme }) => transparentize(0.91, theme.colorSecondary)};
  border-radius: ${(props: any) => props.theme.borderRadius};

  ${isRtl`
    margin-right: 0;
    margin-left: 5px;
  `}
`;

interface Props {
  topicIds: string[];
  className?: string;
  postType: 'idea' | 'initiative';
}

const Topics = memo<Props & InjectedLocalized>(
  ({ topicIds, className, postType, localize }) => {
    const topics = useTopics({ topicIds });

    if (!isNilOrError(topics) && topics.length > 0) {
      return (
        <Container id={`e2e-${postType}-topics`} className={className}>
          {topics
            .filter((topic) => !isNilOrError(topic))
            .map((topic: ITopicData) => {
              return (
                <Topic key={topic.id} className={`e2e-${postType}-topic`}>
                  {localize(topic.attributes.title_multiloc)}
                </Topic>
              );
            })}
        </Container>
      );
    }

    return null;
  }
);

const TopicsWithHoCs = injectLocalize<Props>(Topics);

export default TopicsWithHoCs;
