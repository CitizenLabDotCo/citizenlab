import React from 'react';
import { xor } from 'lodash-es';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarTopicsItem from './FilterSidebarTopicsItem';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { adopt } from 'react-adopt';
import GetTopics, { GetTopicsChildProps } from 'resources/GetTopics';
import { isNilOrError } from 'utils/helperUtils';

interface InputProps {
  selectedTopics?: string[] | null;
  onChangeTopicsFilter?: (topics: string[]) => void;
}

interface DataProps {
  topics: GetTopicsChildProps;
}

interface Props extends InputProps, DataProps {}

class FilterSidebarTopics extends React.PureComponent<Props> {

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
    const { topics, selectedTopics } = this.props;
    return (
      <Menu secondary={true} vertical={true} fluid={true}>
        <Menu.Item onClick={this.clearFilter} active={!selectedTopics || selectedTopics.length === 0}>
          <FormattedMessage {...messages.allTopics} />
        </Menu.Item>
        <Divider />
        {!isNilOrError(topics) && topics.map((topic) => !isNilOrError(topic) ? (
          <FilterSidebarTopicsItem
            key={topic.id}
            topic={topic}
            active={!!this.isActive(topic.id)}
            onClick={this.handleItemClick(topic.id)}
          />
        ) : null)}
      </Menu>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  topics: <GetTopics />,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <FilterSidebarTopics {...inputProps} {...dataProps} />}
  </Data>
);
