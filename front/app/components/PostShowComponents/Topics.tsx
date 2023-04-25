import React, { memo } from 'react';

// hooks
import useTopics from 'api/topics/useTopics';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// styling
import styled from 'styled-components';
import { fontSizes, isRtl } from 'utils/styleUtils';
import { transparentize } from 'polished';

// typings
import { ITopicData } from 'api/topics/types';

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
  topicIds: string[];
  className?: string;
  postType: 'idea' | 'initiative';
}

const Topics = memo<Props & InjectedLocalized>(
  ({ topicIds, className, postType, localize }) => {
    const { data: topics } = useTopics({});
    const filteredTopics =
      topics?.data.filter((topic) => topicIds.includes(topic.id)) || [];

    if (topics && filteredTopics.length > 0) {
      return (
        <Container id={`e2e-${postType}-topics`} className={className}>
          {filteredTopics.map((topic: ITopicData) => {
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
