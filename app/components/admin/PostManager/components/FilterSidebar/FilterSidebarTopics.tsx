import React from 'react';
import { xor } from 'lodash-es';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarTopicsItem from './FilterSidebarTopicsItem';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';
import { adopt } from 'react-adopt';
import GetTopics from 'resources/GetTopics';
import GetProjectTopics, { GetProjectTopicsChildProps } from 'resources/GetProjectTopics';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';

interface InputProps {
  selectedTopics?: string[] | null;
  onChangeTopicsFilter?: (topics: string[]) => void;
}

interface DataProps {
  topics: GetProjectTopicsChildProps;
}

interface Props extends InputProps, DataProps {}

class FilterSidebarTopics extends React.PureComponent<Props & WithRouterProps> {

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
      <Menu id="e2e-idea-manager-topic-filters" secondary={true} vertical={true} fluid={true}>
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

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  // todo always use gettopics here? use case for getprojecttopics?
  topics: ({ params: { projectId }, render }) => {
    return projectId ?
      <GetProjectTopics projectId={projectId}>{render}</GetProjectTopics>
      :
      <GetTopics>{render}</GetTopics>;
  }
});

export default withRouter((inputProps: InputProps & WithRouterProps) => (
  <Data {...inputProps}>
    {dataProps => <FilterSidebarTopics {...inputProps} {...dataProps} />}
  </Data>
));
