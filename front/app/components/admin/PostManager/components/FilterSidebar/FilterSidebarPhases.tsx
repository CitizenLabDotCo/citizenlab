import React from 'react';
import { IPhaseData } from 'api/phases/types';
import { Menu, Divider } from 'semantic-ui-react';
import FilterSidebarPhasesItem from './FilterSidebarPhasesItem';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

type Props = {
  phases?: IPhaseData[];
  selectedPhase?: string | null;
  onChangePhaseFilter?: (phase: string | null) => void;
};

export default class FilterSidebarPhases extends React.PureComponent<Props> {
  handleItemClick = (phaseId: string) => () => {
    this.props.onChangePhaseFilter?.(phaseId);
  };

  clearFilter = () => {
    this.props.onChangePhaseFilter?.(null);
  };

  isActive = (id: string) => {
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
