import * as React from 'react';
import { flow, find, xor } from 'lodash';

import { updateIdea } from 'services/ideas';
import { IPhaseData, phasesStream } from 'services/phases';
import { Label } from 'semantic-ui-react';

type Props = {
  selectedPhases: string[],
  phases: IPhaseData[],
  onUpdateIdeaPhases: (phasesIds: string[]) => void;
};

class PhasesSelector extends React.PureComponent<Props> {

  isActive = (phaseId) => {
    return this.props.selectedPhases.indexOf(phaseId) >= 0;
  }

  handlePhaseClick = (phaseId) => (event) => {
    event.stopPropagation();
    const newSelectedPhases = xor(this.props.selectedPhases, [phaseId]);
    this.props.onUpdateIdeaPhases(newSelectedPhases);
  }

  render() {
    const { phases, selectedPhases } = this.props;
    return(
      <div>
        {phases.map((phase, index) => (
          <Label
            key={phase.id}
            circular={true}
            active={this.isActive(phase.id)}
            onClick={this.handlePhaseClick(phase.id)}
          >
            {index + 1}
          </Label>
        ))}
      </div>
    );
  }
}

export default PhasesSelector;

