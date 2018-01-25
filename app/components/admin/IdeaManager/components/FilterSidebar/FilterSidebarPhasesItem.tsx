import * as React from 'react';
import { IPhaseData } from 'services/phases';
import { flow } from 'lodash';

import { Menu, Label } from 'semantic-ui-react';
import { DropTarget } from 'react-dnd';
import T from 'components/T';


interface Props {
  phase: IPhaseData;
  active: boolean;
  onClick: any;
  isOver: boolean;
  canDrop: boolean;
  phaseNumber: number;
  connectDropTarget: any;
}


class FilterSidebarPhasesItem extends React.Component<Props> {
  render() {
    const { phase, active, onClick, connectDropTarget, isOver, canDrop, phaseNumber } = this.props;
    const disabled = phase.attributes.participation_method !== 'ideation';
    return connectDropTarget(
      <div>
        <Menu.Item
          active={active || (isOver && canDrop)}
          onClick={onClick}
          disabled={disabled}
        >
          <Label
            circular={true}
            basic={true}
            color={disabled ? 'grey' : 'teal'}
          >
            {phaseNumber}
          </Label>
          <T value={phase.attributes.title_multiloc} />
        </Menu.Item>
      </div>
    );
  }
}


const phaseTarget = {
  drop(props) {
    return {
      type: 'phase',
      id: props.phase.id
    };
  },
  canDrop(props) {
    return props.phase.attributes.participation_method === 'ideation';
  },
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export default flow([
  DropTarget('IDEA', phaseTarget, collect),
])(FilterSidebarPhasesItem);
