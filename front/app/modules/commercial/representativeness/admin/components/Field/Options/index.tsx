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
import { UpdateOption } from '..';

interface Props {
  userCustomFieldId: string;
  formValues: FormValues;
  updateOption: UpdateOption;
}

const Options = ({ userCustomFieldId, formValues, updateOption }: Props) => {
  const userCustomFieldOptions = useUserCustomFieldOptions(userCustomFieldId);
  const localize = useLocalize();

  if (isNilOrError(userCustomFieldOptions)) {
    return null;
  }

  const onToggle = (optionId: string) => () => {
    const currentlyEnabled = formValues[optionId].enabled;
    updateOption(optionId, { enabled: !currentlyEnabled });
  };

  const onInput = (optionId: string) => (newPopulation: number) => {
    updateOption(optionId, { population: newPopulation });
  };

  return (
    <>
      {userCustomFieldOptions.map(({ id, attributes }) => {
        const { enabled, population } = formValues[id];

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
                percentage={parsePercentage(population, formValues)}
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
