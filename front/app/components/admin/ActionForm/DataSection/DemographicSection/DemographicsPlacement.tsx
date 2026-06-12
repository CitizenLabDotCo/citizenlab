import React from 'react';

import { Box, Text, Radio, colors } from '@citizenlab/cl2-component-library';

import { Changes, IPhasePermissionData } from '../../types';
import { Hint } from '../../ui';

// Demographics placement is stored as a boolean on the permission:
//  - false => ask in the registration flow, before the user participates;
//  - true  => add a new page to the end of the form itself.
const PLACEMENT_OPTIONS: { value: boolean; label: string }[] = [
  {
    value: false,
    label: 'Ask demographic questions before the user participates',
  },
  {
    value: true,
    label: 'Collect demographics by adding a new page to the end of the form',
  },
];

interface Props {
  permission: IPhasePermissionData;
  onChange: (changes: Changes) => void;
}

const DemographicsPlacement = ({ onChange }: Props) => {
  const setPlacement = (value: boolean) =>
    onChange({ user_fields_in_form: value });

  return (
    <Box>
      {/* Where the questions are asked. */}
      <Text as="p" mt="0" mb="6px" fontSize="xs" fontWeight="bold" color="coolGrey600">
        When to ask
      </Text>
      {PLACEMENT_OPTIONS.map((option) => {
        const disabled = lockPlacement && option.value === false;
        return (
          <Box key={String(option.value)} mb="2px">
            <Radio
              name="demographics-placement"
              value={option.value}
              currentValue={placement}
              disabled={disabled}
              onChange={setPlacement}
              label={
                <Text
                  as="span"
                  m="0"
                  fontSize="s"
                  color={disabled ? 'coolGrey500' : 'primary'}
                >
                  {option.label}
                </Text>
              }
            />
          </Box>
        );
      })}
      {lockPlacement && (
        <Box mb="10px">
          <Hint>
            With “Anyone” there is no sign-in step, so demographics can only be
            asked on a form page.
          </Hint>
        </Box>
      )}

      <Box mt="12px" mb="8px" borderTop={`1px solid ${colors.divider}`} />
    </Box>
  )
};

export default DemographicsPlacement;
