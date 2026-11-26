import React from 'react';

import Menu, { MenuItem } from 'design-system/Menu';
import { Key } from 'design-system/types';

import { InputTerm } from 'api/phases/types';
import { INPUT_TERMS } from 'api/phases/utils';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';
import projectMessages from 'containers/Admin/projects/project/messages';
import { getInputTermOptions } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/shared/CustomFieldPicker';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import PanelField from '../PanelField';

import messages from './messages';

const isInputTerm = (key: Key | null): key is InputTerm =>
  typeof key === 'string' && INPUT_TERMS.includes(key);

interface Props {
  value: InputTerm | undefined;
  onChange: (input_term: InputTerm) => void;
}

const InputTermCard = ({ value, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const title = formatMessage(projectMessages.inputTermSelectLabel);
  const options = getInputTermOptions(formatMessage);
  const selected = options.find((option) => option.value === value);

  return (
    <PanelField
      reviewKey="input_term"
      label={title}
      labelTooltip={<FormattedMessage {...messages.inputTermDescription} />}
      action={
        selected && <SummaryPill label={selected.label} icon="lightbulb-16" />
      }
      menu={
        <Menu
          aria-label={title}
          selectionMode="single"
          selectedKeys={new Set(value ? [value] : [])}
          onAction={(key) => {
            if (isInputTerm(key)) onChange(key);
          }}
        >
          {options.map((option) => (
            <MenuItem key={option.value} id={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </Menu>
      }
    />
  );
};

export default InputTermCard;
