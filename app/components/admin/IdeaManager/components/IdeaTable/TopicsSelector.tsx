import React from 'react';
import { pull } from 'lodash';
import { Label, Icon } from 'semantic-ui-react';
import T from 'components/T';
import GetTopics from 'utils/resourceLoaders/components/GetTopics';

interface Props {
  selectedTopics: string[];
  onUpdateIdeaTopics: (topicIds: string[]) => void;
}

export default class TopicsSelector extends React.PureComponent<Props> {

  handleTopicDelete = (topicId) => (event) => {
    event.stopPropagation();
    const newSelectedTopics = pull(this.props.selectedTopics, topicId);
    this.props.onUpdateIdeaTopics(newSelectedTopics);
  }

  render() {
    return (
      <GetTopics ids={this.props.selectedTopics}>
        {topics => {
          if (!topics) return null;

          return (
            <>
              {topics.map(topic => (
                <Label
                  key={topic.id}
                  color="teal"
                  basic={true}
                >
                  <T value={topic.attributes.title_multiloc} />
                  <Icon
                    name="delete"
                    onClick={this.handleTopicDelete(topic.id)}
                  />
                </Label>
              ))}
            </>
          );
        }}
      </GetTopics>
    );
  }
}
