import React, { memo, useState, useCallback, useEffect, MouseEvent } from 'react';
import { adopt } from 'react-adopt';
import { isError, isEmpty, includes } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import { fontSizes, colors } from 'utils/styleUtils';

// components
import T from 'components/T';

// resources
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// styling
import styled from 'styled-components';

// typings
import { ITopicData } from 'services/topics';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px;
  padding-top: 25px;
  background: #fff;
  border: 1px solid #ececec;
  border-radius: ${(props: any) => props.theme.borderRadius};
  box-shadow: 0px 0px 15px rgba(0, 0, 0, 0.04);
`;

const Title = styled.div`
  color: ${({ theme }) => theme.colorText};
  font-size: ${fontSizes.small}px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 15px;
  margin-left: 18px;
`;

const Topics = styled.div``;

const Topic = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
  font-weight: 400;
  line-height: normal;
  display: inline-block;
  padding-left: 18px;
  padding-right: 18px;
  padding-top: 10px;
  padding-bottom: 10px;
  margin-right: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  border: solid 1px ${colors.separation};
  border-radius: ${(props: any) => props.theme.borderRadius};

  &:hover,
  &.selected {
    color: #fff;
    background: #448943;
    border-color: #448943;
  }
`;

interface InputProps {
  onChange: (arg: string[]) => void;
  className?: string;
}

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps {}

const TopicsFilter = memo<Props>(({ topics, onChange, className }) => {

  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);

  const handleOnClick = useCallback((event: MouseEvent<HTMLInputElement>) => {
    const topicId = event.currentTarget.dataset.id as string;

    if (includes(selectedTopics, topicId)) {
      setSelectedTopics(selectedTopics.filter(selectedTopicId => selectedTopicId !== topicId));
    } else {
      setSelectedTopics([...selectedTopics, topicId]);
    }
  }, [selectedTopics]);

  useEffect(() => {
    onChange(selectedTopics);
  }, [selectedTopics]);

  if (!isNilOrError(topics) && topics.length > 0) {
    return (
      <Container className={className}>
        <Title>
          <FormattedMessage {...messages.topicsTitle} />
        </Title>

        <Topics>
          {topics.filter(topic => !isError(topic)).map((topic: ITopicData) => (
            <Topic
              key={topic.id}
              data-id={topic.id}
              onClick={handleOnClick}
              className={includes(selectedTopics, topic.id) ? 'selected' : ''}
            >
              <T value={topic.attributes.title_multiloc} />
            </Topic>
          ))}
        </Topics>
      </Container>
    );
  }

  return null;
});

const Data = adopt<DataProps, InputProps>({
  topics: <GetTopics />
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <TopicsFilter {...inputProps} {...dataProps} />}
  </Data>
);
