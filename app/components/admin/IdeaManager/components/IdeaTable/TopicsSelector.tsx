import React from 'react';
import { pull } from 'lodash-es';
import { Label, Icon } from 'semantic-ui-react';
import T from 'components/T';
import GetTopics from 'resources/GetTopics';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';

const StyledLabel = styled(Label)`
  white-space: nowrap;
`;

interface Props {
  selectedTopics: string[];
  onUpdateTopics: (topicIds: string[]) => void;
}

export default class TopicsSelector extends React.PureComponent<Props> {

  handleTopicDelete = (topicId) => (event) => {
    event.stopPropagation();
    const newSelectedTopics = pull(this.props.selectedTopics, topicId);
    this.props.onUpdateTopics(newSelectedTopics);
  }

  render() {
    return (
      <GetTopics ids={this.props.selectedTopics}>
        {topics => {
          if (isNilOrError(topics)) return null;

          return (
            <>
              {topics.map(topic => {
                if (isNilOrError(topic)) return null;

                return (
                  <StyledLabel
                    key={topic.id}
                    color="teal"
                    basic={true}
                  >
                    <T value={topic.attributes.title_multiloc} />
                    <Icon
                      name="delete"
                      onClick={this.handleTopicDelete(topic.id)}
                    />
                  </StyledLabel>
                );
              })}
            </>
          );
        }}
      </GetTopics>
    );
  }
}
