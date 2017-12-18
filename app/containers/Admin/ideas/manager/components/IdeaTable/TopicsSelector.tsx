import * as React from 'react';
import { flow, find, pull } from 'lodash';

import { InjectedResourcesByIdsProps, injectResourcesByIds } from '../../idsResourcesLoader';
import { updateIdea } from 'services/ideas';
import { topicByIdStream, ITopicData } from 'services/topics';

import { Label, Icon } from 'semantic-ui-react';
import T from 'components/T';

type Props = {
  selectedTopics: string[],
  onUpdateIdeaTopics: (topicIds: string[]) => void;
};

class TopicsSelector extends React.PureComponent<Props & InjectedResourcesByIdsProps<ITopicData>> {

  handleTopicDelete = (topicId) => (event) => {
    event.stopPropagation();
    const newSelectedTopics = pull(this.props.selectedTopics, topicId);
    this.props.onUpdateIdeaTopics(newSelectedTopics);
  }

  render() {
    const { selectedTopics } = this.props;
    const topics = this.props.topics;

    return (
      <div>
        {topics.map((topic, index) => (
          <Label
            key={topic.id}
          >
            <T value={topic.attributes.title_multiloc} />
            <Icon
              name="delete"
              onClick={this.handleTopicDelete(topic.id)}
            />
          </Label>
        ))}
      </div>
    );
  }
}

export default injectResourcesByIds('topics', topicByIdStream, (props) => props.selectedTopics)(TopicsSelector);
