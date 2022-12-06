import React, { memo, useCallback, FormEvent } from 'react';
import { Label, Icon } from 'semantic-ui-react';
import styled from 'styled-components';
import { pull } from 'lodash-es';
import useTopics from 'hooks/useTopics';
import { isNilOrError } from 'utils/helperUtils';
import T from 'components/T';

const StyledLabel = styled(Label)`
  white-space: nowrap;
`;

interface Props {
  selectedTopics: string[];
  onUpdateTopics: (topicIds: string[]) => void;
}

const TopicsSelector = memo<Props>(({ selectedTopics, onUpdateTopics }) => {
  const topics = useTopics({ topicIds: selectedTopics });

  const handleTopicDelete = useCallback(
    (topicId: string) => (event: FormEvent) => {
      event.stopPropagation();
      const newSelectedTopics = pull(selectedTopics, topicId);
      onUpdateTopics(newSelectedTopics);
    },
    [selectedTopics, onUpdateTopics]
  );

  if (!isNilOrError(topics)) {
    return (
      <>
        {topics.map((topic) => {
          return (
            <StyledLabel key={topic.id} color="teal" basic={true}>
              <T value={topic.attributes.title_multiloc} />
              <Icon name="delete" onClick={handleTopicDelete(topic.id)} />
            </StyledLabel>
          );
        })}
      </>
    );
  }

  return null;
});

export default TopicsSelector;
