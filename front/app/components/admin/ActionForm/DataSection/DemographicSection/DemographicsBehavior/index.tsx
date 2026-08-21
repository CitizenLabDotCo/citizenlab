import React from 'react';

import { Box, Text, Radio } from '@citizenlab/cl2-component-library';

import { CustomFieldsBehavior } from 'api/permissions/types';

import UpsellTooltip from 'components/UpsellTooltip';

import { useIntl, MessageDescriptor } from 'utils/cl-intl';

import { Changes } from '../../../types';

import messages from './messages';

const BEHAVIOR_OPTIONS: {
  value: CustomFieldsBehavior;
  label: MessageDescriptor;
}[] = [
  { value: 'global', label: messages.global },
  { value: 'disabled', label: messages.disabled },
  { value: 'custom', label: messages.custom },
];

interface Props {
  customFieldsBehavior: CustomFieldsBehavior;
  // Curating a list of questions is the paid part; the other two options are not.
  customAllowed: boolean;
  onChange: (changes: Changes) => void;
}

const DemographicsBehavior = ({
  customFieldsBehavior,
  customAllowed,
  onChange,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <Text
        as="p"
        mt="0"
        mb="6px"
        fontSize="xs"
        fontWeight="bold"
        color="coolGrey600"
      >
        {formatMessage(messages.whichQuestions)}
      </Text>

      {BEHAVIOR_OPTIONS.map((option) => {
        const locked = option.value === 'custom' && !customAllowed;

        return (
          <Box key={option.value} mb="2px">
            <Box width="fit-content">
              <UpsellTooltip disabled={!locked} placement="right">
                <Radio
                  name="demographics-behavior"
                  value={option.value}
                  currentValue={customFieldsBehavior}
                  disabled={locked}
                  onChange={(value: CustomFieldsBehavior) =>
                    onChange({ custom_fields_behavior: value })
                  }
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
              </UpsellTooltip>
            </Box>
          </Box>
        );
      })}
    </Box>
  );
};

export default DemographicsBehavior;
