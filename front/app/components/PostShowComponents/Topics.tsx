import React, { memo } from 'react';
import { transparentize } from 'polished';
// hooks
import useTopics from 'hooks/useTopics';
// typings
import { ITopicData } from 'services/topics';
import { isNilOrError } from 'utils/helperUtils';
// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import { fontSizes, isRtl } from 'utils/styleUtils';
// styling
import styled from 'styled-components';

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
          {topics.map((topic: ITopicData) => {
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
