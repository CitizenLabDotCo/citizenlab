import * as React from 'react';
import { xor } from 'lodash';
import { ITopicData } from 'services/topics';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarTopicsItem from './FilterSidebarTopicsItem';

interface Props {
  topics: ITopicData[];
  selectedTopics?: string[];
  onChangeTopicsFilter?: (topics: string[]) => void;
}

class FilterSidebarTopics extends React.Component<Props> {

  handleItemClick = (id) => (event) => {
    if (event.ctrlKey) {
      const selectedTopics = xor(this.props.selectedTopics || [], [id]);
      this.props.onChangeTopicsFilter && this.props.onChangeTopicsFilter(selectedTopics);
    } else {
      this.props.onChangeTopicsFilter && this.props.onChangeTopicsFilter([id]);
    }
  }

  clearFilter = () => {
    this.props.onChangeTopicsFilter && this.props.onChangeTopicsFilter([]);
  }

  isActive = (id) => {
    return this.props.selectedTopics && this.props.selectedTopics.indexOf(id) >= 0;
  }

  render() {
    return (
      <Menu secondary={true} vertical={true}>
        <Menu.Item onClick={this.clearFilter} active={!this.props.selectedTopics || this.props.selectedTopics.length === 0}>
          All ideas
        </Menu.Item>
        <Divider />
        {this.props.topics.map((topic) => (
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

export default FilterSidebarTopics;
