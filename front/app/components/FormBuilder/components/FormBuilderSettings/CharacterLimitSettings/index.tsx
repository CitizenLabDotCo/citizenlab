import React from 'react';

import { Box, Label } from '@citizenlab/cl2-component-library';
import { useFormContext } from 'react-hook-form';

import Input from 'components/HookForm/Input';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  minCharactersName: string;
  maxCharactersName: string;
};

const CharacterLimitSettings = ({
  minCharactersName,
  maxCharactersName,
}: Props) => {
  const { formatMessage } = useIntl();
  const { watch } = useFormContext();

  const handleKeyDown = (event: React.KeyboardEvent<Element>) => {
    // We want to prevent the form builder from being closed when enter is pressed
    if (event.key === 'Enter') {
      event.preventDefault();
    }
  };

  return (
    <Box mb="24px">
      <Box mb="16px">
        <Label>{formatMessage(messages.characterLimits)}</Label>
      </Box>

      <Box ml="16px">
        <Box mb="8px" display="flex">
          <Box minWidth="120px" my="auto">
            <Label
              htmlFor="minCharactersInput"
              value={formatMessage(messages.minCharacters)}
            />
          </Box>
          <Input
            id="minCharactersInput"
            name={minCharactersName}
            type="number"
            min="0"
            size="small"
            onKeyDown={handleKeyDown}
          />
        </Box>
        <Box display="flex">
          <Box minWidth="120px" my="auto">
            <Label
              htmlFor="maxCharactersInput"
              value={formatMessage(messages.maxCharacters)}
            />
          </Box>
          <Input
            name={maxCharactersName}
            id="maxCharactersInput"
            type="number"
            size="small"
            min={watch(minCharactersName) ? watch(minCharactersName) + 1 : 1}
            onKeyDown={handleKeyDown}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default CharacterLimitSettings;
