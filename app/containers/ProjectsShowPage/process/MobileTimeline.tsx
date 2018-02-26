// Libraries
import * as React from 'react';

// Components
import { Dropdown } from 'semantic-ui-react';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// Styling
import styled from 'styled-components';
import { color } from 'utils/styleUtils';

// Typings
import { IPhaseData } from 'services/phases';
import T from 'components/T';

const Wrapper = styled.div`
  width: 100%;

  .ui.fluid.dropdown > .dropdown.icon {
    align-items: center;
    display: flex;
    height: 100%;
  }
`;

const PhaseWrapper = styled.p`
  margin: 0;

  &.current {
    color: ${color('success')};
  }
`;

const PhaseIndex = styled.span`
  display: block;
  font-weight: bold;
  margin: 0;
  padding: 0;
`;

interface Props {
  phases: IPhaseData[];
  currentPhase: IPhaseData['id'] | null;
  selectedPhase: IPhaseData['id'] | null;
  onPhaseSelection: {(phaseId: IPhaseData['id']): void};
  className?: string;
}

interface State {}

export default class MobileTimeline extends React.PureComponent<Props, State> {
  onChange = (_event, data) => {
    this.props.onPhaseSelection(data.value);
  }

  render () {
    const { phases, currentPhase, selectedPhase } = this.props;

    return (
      <Wrapper>
        <Dropdown
          fluid={true}
          selection={true}
          onChange={this.onChange}
          value={selectedPhase ? selectedPhase : undefined}
          options={phases.map((phase, index) => ({
            text: (
              <PhaseWrapper className={currentPhase === phase.id ? 'current' : ''}>
                <PhaseIndex><FormattedMessage {...messages.phaseNumber} values={{ phaseNumber: index + 1 }} /></PhaseIndex>
                <T value={phase.attributes.title_multiloc} />
              </PhaseWrapper>
            ),
            value: phase.id,
            active: selectedPhase === phase.id,
          }))}
        />
      </Wrapper>
    );
  }
}
