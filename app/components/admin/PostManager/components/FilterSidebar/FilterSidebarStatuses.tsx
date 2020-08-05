import React from 'react';
import { IIdeaStatusData } from 'services/ideaStatuses';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarStatusesItem from './FilterSidebarStatusesItem';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  statuses?: IIdeaStatusData[] | null;
  selectedStatus?: string | null;
  onChangeStatusFilter?: (status: string | null) => void;
}

class FilterSidebarStatuses extends React.PureComponent<Props> {
  handleItemClick = (id) => () => {
    this.props.onChangeStatusFilter && this.props.onChangeStatusFilter(id);
  };

  clearFilter = () => {
    this.props.onChangeStatusFilter && this.props.onChangeStatusFilter(null);
  };

  isActive = (id) => {
    return this.props.selectedStatus === id;
  };

  render() {
    return (
      <Menu secondary={true} vertical={true} fluid={true}>
        <Menu.Item
          onClick={this.clearFilter}
          active={!this.props.selectedStatus}
        >
          <FormattedMessage {...messages.allStatuses} />
        </Menu.Item>
        <Divider />
        {this.props.statuses &&
          this.props.statuses.map((status) => (
            <FilterSidebarStatusesItem
              key={status.id}
              status={status}
              active={!!this.isActive(status.id)}
              onClick={this.handleItemClick(status.id)}
            />
          ))}
      </Menu>
    );
  }
}

export default FilterSidebarStatuses;
