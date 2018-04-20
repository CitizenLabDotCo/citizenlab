import React from 'react';
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

  handlePhaseClick = (phase: IPhaseData) => (event) => {
    event.stopPropagation();
    if (this.isEnabled(phase)) {
      const newSelectedPhases = xor(this.props.selectedPhases, [phase.id]);
      this.props.onUpdateIdeaPhases(newSelectedPhases);
    }
  }

  isEnabled = (phase: IPhaseData) => {
    return phase.attributes.participation_method === 'ideation';
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
                as={this.isEnabled(phase) ? 'a' : undefined}
                color={this.isActive(phase.id) ? 'teal' : undefined}
                circular={true}
                active={this.isActive(phase.id)}
                onClick={this.handlePhaseClick(phase)}
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

