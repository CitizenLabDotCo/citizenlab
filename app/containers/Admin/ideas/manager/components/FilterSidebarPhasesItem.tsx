import * as React from 'react';
import { injectTFunc } from 'components/T/utils';
import { IPhaseData } from 'services/phases';
import { flow } from 'lodash';

import { Menu } from 'semantic-ui-react';
import { DropTarget } from 'react-dnd';


interface Props {
  phase: IPhaseData;
  active: boolean;
  onClick: any;
  isOver: boolean;
  canDrop: boolean;
  connectDropTarget: any;
  tFunc: ({ }) => string;
}

class FilterSidebarPhasesItem extends React.Component<Props> {
  render() {
    const { phase, active, onClick, connectDropTarget, isOver, canDrop } = this.props;
    return connectDropTarget(
      <div>
        <Menu.Item
          name={this.props.tFunc(phase.attributes.title_multiloc)}
          active={active || (isOver && canDrop)}
          onClick={onClick}
        />
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
};

const collect = (connect, monitor) => ({
  connectDropTarget: connect.dropTarget(),
  isOver: monitor.isOver(),
  canDrop: monitor.canDrop(),
});

export default flow([
  DropTarget('IDEA', phaseTarget, collect),
  injectTFunc,
])(FilterSidebarPhasesItem);
