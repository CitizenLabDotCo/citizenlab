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
import { columnsGapDesktop, rightColumnWidthDesktop, columnsGapTablet, rightColumnWidthTablet } from './styleConstants';

// typings
import { ITopicData } from 'services/topics';

const Container = styled.div`
  display: flex;
  flex-wrap: wrap;
  padding-right: ${rightColumnWidthDesktop + columnsGapDesktop}px;
  margin-bottom: 10px;

  ${media.tablet`
    padding-right: ${rightColumnWidthTablet + columnsGapTablet}px;
  `}

  ${media.smallerThanMaxTablet`
    padding-right: 0px;
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
}

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps {}

const Topics = memo<Props & InjectedLocalized>(({ topics, localize, className }) => {
  if (!isNilOrError(topics) && topics.length > 0) {
    return (
      <Container id="e2e-post-topics" className={className}>
        {topics.map((topic: ITopicData) => {
          return <Topic key={topic.id} className="e2e-post-topic">{localize(topic.attributes.title_multiloc)}</Topic>;
        })}
      </Container>
    );
  }

  return null;
});

const TopicsWithHOCs = injectLocalize<Props>(Topics);

const Data = adopt<DataProps, InputProps>({
  topics: ({ topicIds, render }) => <GetTopics ids={topicIds}>{render}</GetTopics>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <TopicsWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
