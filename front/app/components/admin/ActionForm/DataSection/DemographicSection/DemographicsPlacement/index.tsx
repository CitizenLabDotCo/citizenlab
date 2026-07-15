import React from 'react';

import { Box, Text, Radio, colors } from '@citizenlab/cl2-component-library';

import { UserFieldsInFormFrontendDescriptor } from 'api/phase_permissions/types';

import Warning from 'components/UI/Warning';

import { useIntl, MessageDescriptor } from 'utils/cl-intl';

import { Changes } from '../../../types';
import { EXPLANATION_MESSAGES } from '../constants';

import messages from './messages';

// Demographics placement is stored as a boolean on the permission:
//  - false => ask in the registration flow, before the user participates;
//  - true  => add a new page to the end of the form itself.
const PLACEMENT_OPTIONS: { value: boolean; label: MessageDescriptor }[] = [
  {
    value: false,
    label: messages.askDemographicQuestionsBefore,
  },
  {
    value: true,
    label: messages.collectDemographicsAfter,
  },
];

interface Props {
  user_fields_in_form_descriptor: UserFieldsInFormFrontendDescriptor;
  onChange: (changes: Changes) => void;
}

const DemographicsPlacement = ({
  user_fields_in_form_descriptor,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();

  const { value, locked, explanation } = user_fields_in_form_descriptor;

  const setPlacement = (userFieldsInForm: boolean) =>
    onChange({ user_fields_in_form: userFieldsInForm });

  return (
    <Box>
      {/* Where the questions are asked. */}
      <Text as="p" mt="0" mb="6px" fontSize="xs" fontWeight="bold" color="coolGrey600">
        {formatMessage(messages.whenToAsk)}
      </Text>
      {PLACEMENT_OPTIONS.map((option) => (
        <Box key={String(option.value)} mb="2px">
          <Radio
            name="demographics-placement"
            value={option.value}
            currentValue={value}
            disabled={locked}
            onChange={setPlacement}
            label={
              <Text
                as="span"
                m="0"
                fontSize="s"
                color={locked ? 'coolGrey500' : 'primary'}
              >
                {formatMessage(option.label)}
              </Text>
            }
          />
        </Box>
      ))}
      {explanation && (
        <Box mb="10px">
          <Warning>{formatMessage(EXPLANATION_MESSAGES[explanation])}</Warning>
        </Box>
      )}

      <Box mt="12px" mb="8px" borderTop={`1px solid ${colors.divider}`} />
    </Box>
  );
};

export default DemographicsPlacement;
