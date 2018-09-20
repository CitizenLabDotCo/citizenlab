// Libraries
import React, { PureComponent } from 'react';

// Components
import Label from 'components/UI/Label';

// I18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import localize, { InjectedLocalized } from 'utils/localize';

// Styling
import styled from 'styled-components';

// Typings
import { IPhaseData } from 'services/phases';

const Container = styled.div``;

const SelectWrapper = styled.div`
  width: 100%;
  position: relative;
  display: block;
	border: 1px solid #bbb;
	border-radius: .3em;
  box-shadow: 0 1px 0 1px rgba(0,0,0,.04);

  &:hover {
    border-color: #888;
  }

  &::after {
    content: " ";
    position: absolute;
    top: 50%;
    right: 1em;
    z-index: 2;
    pointer-events: none;
    display: block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 7px solid #666;
    margin-top: -3px;
  }

  select {
    width: 100%;
    margin: 0;
    outline: none;
    padding: .6em .8em .5em .8em;
    box-sizing: border-box;
    font-size: 16px;
    overflow: hidden;
    padding-right: 2em;
    background: none;
    border: 1px solid transparent;
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;
    font-weight: 500;
    color: #444;
    line-height: 1.3;
    border-radius: .2em;

    option {
      font-weight: 400;
    }

    &:focus {
      border-color: #aaa;
      box-shadow: 0 0 1px 3px rgba(59, 153, 252, .7);
      box-shadow: 0 0 0 3px -moz-mac-focusring;
      color: #222;
      outline: none;
    }
  }
`;

interface Props {
  phases: IPhaseData[];
  currentPhase: string | null;
  selectedPhase: string | null;
  onPhaseSelection: (phaseId: string) => void;
  className?: string;
}

class MobileTimeline extends PureComponent<Props & InjectedLocalized> {
  handleOnChange = (event) => {
    event.preventDefault();
    this.props.onPhaseSelection(event.target.value);
  }

  render () {
    const { phases, selectedPhase } = this.props;

    return (
      <Container>
        <Label>
          <FormattedMessage {...messages.selectedPhase} />
        </Label>
        <SelectWrapper>
          <select value={selectedPhase || phases[0].id} onChange={this.handleOnChange}>
            {phases.map((phase) => (
              <option key={phase.id} value={phase.id} aria-selected={selectedPhase === phase.id ? true : false}>
                {this.props.localize(phase.attributes.title_multiloc)}
              </option>
            ))}
          </select>
        </SelectWrapper>
      </Container>
    );
  }
}

export default localize(MobileTimeline);
