import React from 'react';
import { xor } from 'lodash-es';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarTopicsItem from './FilterSidebarTopicsItem';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { ITopicData } from 'services/topics';

interface Props {
  selectableTopics: ITopicData[];
  selectedTopics?: string[] | null;
  onChangeTopicsFilter?: (topics: string[]) => void;
}

export default class FilterSidebarTopics extends React.PureComponent<Props> {
  handleItemClick = (id) => (event) => {
    if (event.ctrlKey) {
      const selectedTopics = xor(this.props.selectedTopics || [], [id]);
      this.props.onChangeTopicsFilter &&
        this.props.onChangeTopicsFilter(selectedTopics);
    } else {
      this.props.onChangeTopicsFilter && this.props.onChangeTopicsFilter([id]);
    }
  };

  clearFilter = () => {
    this.props.onChangeTopicsFilter && this.props.onChangeTopicsFilter([]);
  };

  isActive = (id) => {
    return (
      this.props.selectedTopics && this.props.selectedTopics.indexOf(id) >= 0
    );
  };

  render() {
    const { selectableTopics, selectedTopics } = this.props;
    return (
      <Menu
        id="e2e-idea-manager-topic-filters"
        secondary={true}
        vertical={true}
        fluid={true}
      >
        <Menu.Item
          onClick={this.clearFilter}
          active={!selectedTopics || selectedTopics.length === 0}
        >
          <FormattedMessage {...messages.allTopics} />
        </Menu.Item>
        <Divider />
        {selectableTopics.map((topic) => (
          <FilterSidebarTopicsItem
            key={topic.id}
            topic={topic}
            active={!!this.isActive(topic.id)}
            onClick={this.handleItemClick(topic.id)}
          />
        ))}
      </Menu>
    );
  }
}
