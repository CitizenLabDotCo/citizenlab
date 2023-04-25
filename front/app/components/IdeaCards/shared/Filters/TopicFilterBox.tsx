import React, { memo, useCallback } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import TopicsFilter from 'components/FilterBoxes/TopicsFilter';

// resources
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';

// styling
import styled from 'styled-components';

// typings

const Container = styled.div``;

interface InputProps {
  selectedTopicIds: string[] | null | undefined;
  onChange: (arg: string[] | null) => void;
  className?: string;
}

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps {}

const TopicFilterBox = memo<Props>(
  ({ selectedTopicIds, topics, onChange, className }) => {
    const handleOnChange = useCallback(
      (newsSelectedTopicIds: string[] | null) => {
        onChange(newsSelectedTopicIds);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      []
    );

    if (
      !isNilOrError(topics) &&
      topics.filter((topic) => !isNilOrError(topic)).length > 0
    ) {
      return (
        <Container className={className}>
          <TopicsFilter
            topics={topics.filter((topic) => !isNilOrError(topic))}
            selectedTopicIds={selectedTopicIds}
            onChange={handleOnChange}
          />
        </Container>
      );
    }

    return null;
  }
);

const Data = adopt<DataProps, InputProps>({
  // currently only used for the idea overview page,
  // so all possible topics can be displayed
  topics: <GetTopics />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <TopicFilterBox {...inputProps} {...dataProps} />}
  </Data>
);
