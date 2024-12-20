import React, { MouseEvent } from 'react';

import { Box, Button, Tooltip } from '@citizenlab/cl2-component-library';
import { xor } from 'lodash-es';

import { IPhaseData } from 'api/phases/types';
import { canContainIdeas } from 'api/phases/utils';

import CircledPhaseNumber from 'components/admin/PostManager/components/FilterSidebar/phases/CircledPhaseNumber';
import T from 'components/T';

type Props = {
  selectedPhases: string[];
  phases: IPhaseData[];
  onUpdatePhases: (phasesIds: string[]) => void;
};

class PhasesSelector extends React.PureComponent<Props> {
  isActive = (phaseId: string) => {
    return this.props.selectedPhases.indexOf(phaseId) >= 0;
  };

  handlePhaseClick = (phase: IPhaseData) => (event: MouseEvent) => {
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
      <Box display="flex">
        {phases.map((phase, index) => (
          <Box key={phase.id}>
            <Tooltip content={<T value={phase.attributes.title_multiloc} />}>
              <Button
                buttonStyle="text"
                type="button"
                p="0"
                onClick={this.handlePhaseClick(phase)}
                disabled={!this.isEnabled(phase)}
              >
                <CircledPhaseNumber
                  phaseNumber={index + 1}
                  borderColor={this.isActive(phase.id) ? 'teal' : 'grey400'}
                />
              </Button>
            </Tooltip>
          </Box>
        ))}
      </Box>
    );
  }
}

export default PhasesSelector;
