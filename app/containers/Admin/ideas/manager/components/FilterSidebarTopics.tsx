import * as React from 'react';
import { ITopicData } from 'services/topics';
import styled from 'styled-components';
import { Menu, Divider } from 'semantic-ui-react';
import { injectTFunc } from 'components/T/utils';

interface Props {
  topics: ITopicData[];
  selectedTopics?: string[];
  onChangeTopicsFilter?: (topics: string[]) => void;
  tFunc: ({ }) => string;
}

class FilterSidebarTopics extends React.Component<Props> {

  handleItemClick = (id) => (event) => {
    this.props.onChangeTopicsFilter && this.props.onChangeTopicsFilter([id]);
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
          <Menu.Item
            key={topic.id}
            name={this.props.tFunc(topic.attributes.title_multiloc)}
            active={this.isActive(topic.id)}
            onClick={this.handleItemClick(topic.id)}
          />
        ))}
      </Menu>
    );
  }
}

export default injectTFunc(FilterSidebarTopics);
