import React from 'react';

import { IconNames } from '@citizenlab/cl2-component-library';

import { InputTerm } from 'api/phases/types';

import projectMessages from 'containers/Admin/projects/project/messages';
import { getInputTermOptions } from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/shared/CustomFieldPicker';

import OptionPicker from 'components/UI/OptionPicker';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import PanelField from './PanelField';

const TERM_ICONS: Record<InputTerm, IconNames> = {
  idea: 'idea',
  option: 'list',
  project: 'folder-outline',
  question: 'question-circle',
  issue: 'alert-circle',
  contribution: 'plus-circle',
  proposal: 'proposals',
  initiative: 'flag',
  petition: 'pen',
  comment: 'comment',
  response: 'chat-bubble',
  suggestion: 'stars',
  topic: 'label',
  post: 'text',
  story: 'book',
  observation: 'eye',
};

interface Props {
  value: InputTerm | undefined;
  onChange: (input_term: InputTerm) => void;
}

const InputTermCard = ({ value, onChange }: Props) => {
  const { formatMessage } = useIntl();
  const title = formatMessage(projectMessages.inputTermSelectLabel);

  return (
    <PanelField
      label={title}
      action={
        <OptionPicker<InputTerm>
          title={title}
          description={formatMessage(messages.inputTermDescription)}
          options={getInputTermOptions(formatMessage).map((option) => ({
            value: option.value,
            label: option.label,
            icon: TERM_ICONS[option.value],
          }))}
          value={value}
          onChange={onChange}
          size="small"
        />
      }
    />
  );
};

export default InputTermCard;
