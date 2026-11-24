import React from 'react';

import { ListBoxOption } from 'design-system/ListBox';
import Select from 'design-system/Select';
import { Key } from 'design-system/types';

import { InputTerm } from 'api/phases/types';
import { INPUT_TERMS } from 'api/phases/utils';

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

  return (
    <PanelField
      reviewKey="input_term"
      label={title}
      labelTooltip={<FormattedMessage {...messages.inputTermDescription} />}
    >
      <Select
        aria-label={title}
        size={32}
        value={value ?? null}
        onChange={(key) => {
          if (isInputTerm(key)) onChange(key);
        }}
      >
        {options.map((option) => (
          <ListBoxOption key={option.value} id={option.value}>
            {option.label}
          </ListBoxOption>
        ))}
      </Select>
    </PanelField>
  );
};

export default InputTermCard;
