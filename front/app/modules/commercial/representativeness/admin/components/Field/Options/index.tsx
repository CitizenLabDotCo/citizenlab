import React from 'react';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import OptionInput from './OptionInput';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { parsePercentage } from './utils';

// typings
import { FormValues } from '../utils';

interface Props {
  userCustomFieldId: string;
  formValues: FormValues;
  onUpdateEnabled: (optionId: string, enabled: boolean) => void;
  onUpdatePopulation: (optionId: string, population: number | null) => void;
}

const Options = ({
  userCustomFieldId,
  formValues,
  onUpdateEnabled,
  onUpdatePopulation,
}: Props) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(userCustomFieldId);
  const localize = useLocalize();

  if (isNilOrError(userCustomFieldOptions)) {
    return null;
  }

  const onToggle = (optionId: string) => () => {
    const currentlyEnabled = optionId in formValues;
    onUpdateEnabled(optionId, !currentlyEnabled);
  };

  const onInput = (optionId: string) => (newPopulation: number | null) => {
    onUpdatePopulation(optionId, newPopulation);
  };

  return (
    <>
      {userCustomFieldOptions.map(({ id, attributes }) => {
        const enabled = id in formValues;
        const population = formValues[id];

        return (
          <Box key={id} display="flex" width="100%">
            <Box display="flex" alignItems="center" width="60%">
              <Toggle checked={enabled} onChange={onToggle(id)} />

              <Text ml="12px" variant="bodyM" color="adminTextColor">
                {localize(attributes.title_multiloc)}
              </Text>
            </Box>

            <Box display="flex" alignItems="center" width="40%">
              <OptionInput
                value={population}
                percentage={
                  enabled ? parsePercentage(population, formValues) : undefined
                }
                disabled={!enabled}
                onChange={onInput(id)}
              />
            </Box>
          </Box>
        );
      })}
    </>
  );
};

export default Options;
