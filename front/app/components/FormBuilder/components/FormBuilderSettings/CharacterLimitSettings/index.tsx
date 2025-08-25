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
      <Box display="flex" alignItems="center" gap="12px" w="100%">
        <Box display="flex" w="100%">
          <Box w="100%" my="auto">
            <Label
              htmlFor="minCharactersInput"
              value={formatMessage(messages.minCharacters)}
            />
            <Input
              id="minCharactersInput"
              name={minCharactersName}
              type="number"
              min="0"
              size="small"
              onKeyDown={handleKeyDown}
              placeholder={formatMessage(messages.noLimit)}
            />
          </Box>
        </Box>
        <Box display="flex" w="100%">
          <Box w="100%" my="auto">
            <Label
              htmlFor="maxCharactersInput"
              value={formatMessage(messages.maxCharacters)}
            />
            <Input
              name={maxCharactersName}
              id="maxCharactersInput"
              type="number"
              size="small"
              min={watch(minCharactersName) ? watch(minCharactersName) + 1 : 1}
              onKeyDown={handleKeyDown}
              placeholder={formatMessage(messages.noLimit)}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default CharacterLimitSettings;
