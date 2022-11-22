import React from 'react';
import { Divider, Menu } from 'semantic-ui-react';
import { IPhaseData } from 'services/phases';
import { FormattedMessage } from 'utils/cl-intl';
import FilterSidebarPhasesItem from './FilterSidebarPhasesItem';

import messages from '../../messages';

type Props = {
  phases?: IPhaseData[];
  selectedPhase?: string | null;
  onChangePhaseFilter?: (string) => void;
};

export default class FilterSidebarPhases extends React.PureComponent<Props> {
  handleItemClick = (id) => () => {
    this.props.onChangePhaseFilter && this.props.onChangePhaseFilter(id);
  };

  clearFilter = () => {
    this.props.onChangePhaseFilter && this.props.onChangePhaseFilter(null);
  };

  isActive = (id) => {
    return this.props.selectedPhase === id;
  };

  render() {
    const { phases, selectedPhase } = this.props;
    return (
      <Menu
        secondary={true}
        vertical={true}
        fluid={true}
        className="intercom-admin-input-manager-phases"
      >
        <Menu.Item onClick={this.clearFilter} active={!selectedPhase}>
          <FormattedMessage {...messages.allPhases} />
        </Menu.Item>
        <Divider />
        {phases &&
          phases.map((phase, index) => (
            <FilterSidebarPhasesItem
              key={phase.id}
              phase={phase}
              phaseNumber={index + 1}
              active={!!this.isActive(phase.id)}
              onClick={this.handleItemClick(phase.id)}
            />
          ))}
      </Menu>
    );
  }
}
