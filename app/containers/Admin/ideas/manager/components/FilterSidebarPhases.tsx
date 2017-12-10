import * as React from 'react';
import { IPhaseData } from 'services/phases';
import styled from 'styled-components';
import { Menu, Divider } from 'semantic-ui-react';
import { injectTFunc } from 'components/T/utils';

interface Props {
  phases: IPhaseData[];
  tFunc: ({}) => string;
  selectedPhase?: string;
  onChangePhaseFilter?: (string) => void;
}

class FilterSidebarPhases extends React.Component<Props> {

  handleItemClick = (id) => (event) => {
    this.props.onChangePhaseFilter && this.props.onChangePhaseFilter(id);
  }

  clearFilter = () => {
    this.props.onChangePhaseFilter && this.props.onChangePhaseFilter(null);
  }

  isActive = (id) => {
    return this.props.selectedPhase === id;
  }

  render() {
    return (
      <Menu secondary={true} vertical={true}>
        <Menu.Item onClick={this.clearFilter} active={!this.props.selectedPhase}>
          All ideas
        </Menu.Item>
        <Divider />
        {this.props.phases.map((phase) => (
          <Menu.Item
            key={phase.id}
            name={this.props.tFunc(phase.attributes.title_multiloc)}
            active={this.isActive(phase.id)}
            onClick={this.handleItemClick(phase.id)}
          />
        ))}
      </Menu>
    );
  }
}

export default injectTFunc(FilterSidebarPhases);
