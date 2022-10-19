import React from 'react';
import { xor } from 'lodash-es';
import { IPhaseData, canContainIdeas } from 'services/phases';
import { Label, Popup } from 'semantic-ui-react';
import T from 'components/T';

type Props = {
  selectedPhases: string[];
  phases: IPhaseData[];
  onUpdatePhases: (phasesIds: string[]) => void;
};

class PhasesSelector extends React.PureComponent<Props> {
  isActive = (phaseId) => {
    return this.props.selectedPhases.indexOf(phaseId) >= 0;
  };

  handlePhaseClick = (phase: IPhaseData) => (event) => {
    event.stopPropagation();
    if (this.isEnabled(phase)) {
      const newSelectedPhases = xor(this.props.selectedPhases, [phase.id]);
      this.props.onUpdatePhases(newSelectedPhases);
    }
  };

  isEnabled = (phase: IPhaseData) => {
    return canContainIdeas(phase);
  };

  render() {
    const { phases } = this.props;
    return (
      <div>
        {phases.map((phase, index) => (
          <Popup
            basic
            key={phase.id}
            trigger={
              <Label
                as={this.isEnabled(phase) ? 'a' : undefined}
                color={this.isActive(phase.id) ? 'teal' : undefined}
                active={this.isActive(phase.id)}
                onClick={this.handlePhaseClick(phase)}
                circular
                basic
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
