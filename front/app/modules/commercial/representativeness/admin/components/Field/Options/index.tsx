import React, { useState } from 'react';

// hooks
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import OptionInput from './OptionInput';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { getPercentages } from './utils';

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
  const [seeMore, setSeeMore] = useState(false);
  const userCustomFieldOptions = useUserCustomFieldOptions(userCustomFieldId);
  const localize = useLocalize();

  if (isNilOrError(userCustomFieldOptions)) {
    return null;
  }

  const visibleUserCustomFieldOptions = userCustomFieldOptions.slice(
    0,
    seeMore ? userCustomFieldOptions.length : 12
  );

  const showSeeMoreButton = userCustomFieldOptions.length > 12;

  const onToggle = (optionId: string) => () => {
    const currentlyEnabled = optionId in formValues;
    onUpdateEnabled(optionId, !currentlyEnabled);
  };

  const onInput = (optionId: string) => (newPopulation: number | null) => {
    onUpdatePopulation(optionId, newPopulation);
  };

  const toggleSeeMore = () => setSeeMore(!seeMore);
  const percentages = getPercentages(formValues);

  return (
    <>
      {visibleUserCustomFieldOptions.map(({ id, attributes }) => {
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
                value={population === undefined ? null : population}
                percentage={percentages[id]}
                disabled={!enabled}
                onChange={onInput(id)}
              />
            </Box>
          </Box>
        );
      })}

      {showSeeMoreButton && (
        <Box width="100%" display="flex" mt="16px" mb="12px">
          <Button
            buttonStyle="secondary"
            onClick={toggleSeeMore}
            text={
              seeMore ? (
                <FormattedMessage {...messages.seeLess} />
              ) : (
                <FormattedMessage
                  {...messages.seeMore}
                  values={{
                    numberOfHiddenItems: userCustomFieldOptions.length - 12,
                  }}
                />
              )
            }
            width="auto"
          />
        </Box>
      )}
    </>
  );
};

export default Options;
