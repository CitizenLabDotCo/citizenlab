import React, { memo } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// resources
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// i18n
import injectLocalize, { InjectedLocalized } from 'utils/localize';

// styling
import styled from 'styled-components';
import { fontSizes, media } from 'utils/styleUtils';
import { transparentize } from 'polished';

// typings
import { ITopicData } from 'services/topics';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;

  ${media.smallerThanMaxTablet`
    margin-bottom: 5px;
  `}
`;

const Topic = styled.div`
  color: ${({ theme }) => theme.colorSecondary};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  padding: 6px 14px;
  margin-right: 5px;
  margin-bottom: 5px;
  background: ${({ theme }) => transparentize(0.92, theme.colorSecondary)};
  border-radius: ${(props: any) => props.theme.borderRadius};
`;

interface InputProps {
  topicIds: string[];
  className?: string;
  postType: 'idea' | 'initiative';
}

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps {}

const TopicSelector = memo<Props & InjectedLocalized>(({ topics, localize, className, postType }) => {
  if (!isNilOrError(topics) && topics.length > 0) {
    return (
      <Container id={`e2e-${postType}-topics`} className={className}>
        {topics.map((topic: ITopicData) => {
          return <Topic key={topic.id} className={`e2e-${postType}-topic`}>{localize(topic.attributes.title_multiloc)}</Topic>;
        })}
      </Container>
    );
  }

  return null;
});

const TopicSelectorWithHOCs = injectLocalize<Props>(TopicSelector);

const Data = adopt<DataProps, InputProps>({
  topics: ({ topicIds, render }) => <GetTopics ids={topicIds}>{render}</GetTopics>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <TopicSelectorWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
