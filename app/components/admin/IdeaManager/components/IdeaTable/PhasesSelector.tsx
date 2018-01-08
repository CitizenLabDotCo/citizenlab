import * as React from 'react';
import { xor } from 'lodash';

import { IPhaseData } from 'services/phases';
import { Label, Popup } from 'semantic-ui-react';
import T from 'components/T';

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
    const { phases } = this.props;
    return(
      <div>
        {phases.map((phase, index) => (
          <Popup
            key={phase.id}
            trigger={
              <Label
                as="a"
                color={this.isActive(phase.id) ? 'teal' : undefined}
                circular={true}
                active={this.isActive(phase.id)}
                onClick={this.handlePhaseClick(phase.id)}
                basic={true}
              >
                {index + 1}
              </Label>
            }
            content={<T value={phase.attributes.title_multiloc} />}
            position="top center"
          />
        ))}
      </div>
    );
  }
}

export default PhasesSelector;

