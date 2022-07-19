import React, { useState } from 'react';

// hooks
import useUserCustomField from 'modules/commercial/user_custom_fields/hooks/useUserCustomField';
import useUserCustomFieldOptions from 'modules/commercial/user_custom_fields/hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import OptionInput from './OptionInput';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import binMessages from '../BinModal/messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import {
  getPercentages,
  parseUserCustomFieldOptions,
  parseBins,
} from './utils';

// typings
import { FormValues } from '../utils';
import { Bins } from '../BinModal';

interface Props {
  userCustomFieldId: string;
  formValues: FormValues;
  bins?: Bins;
  onUpdateEnabled: (optionId: string, enabled: boolean) => void;
  onUpdatePopulation: (optionId: string, population: number | null) => void;
}

const Options = injectIntl(
  ({
    userCustomFieldId,
    formValues,
    bins,
    onUpdateEnabled,
    onUpdatePopulation,
    intl: { formatMessage },
  }: Props & InjectedIntlProps) => {
    const [seeMore, setSeeMore] = useState(false);
    const userCustomField = useUserCustomField(userCustomFieldId);
    const userCustomFieldOptions = useUserCustomFieldOptions(userCustomFieldId);
    const localize = useLocalize();

    if (isNilOrError(userCustomFieldOptions) || isNilOrError(userCustomField)) {
      return null;
    }

    const options =
      userCustomField.attributes.key === 'birthyear' && bins
        ? parseBins(bins, formatMessage(binMessages.andOver))
        : parseUserCustomFieldOptions(userCustomFieldOptions, localize);

    const visibleOptions = options.slice(
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
        {visibleOptions.map(({ id, label }) => {
          const enabled = id in formValues;
          const population = formValues[id];

          return (
            <Box key={id} display="flex" width="100%">
              <Box display="flex" alignItems="center" width="60%">
                <Toggle checked={enabled} onChange={onToggle(id)} />

                <Text ml="12px" variant="bodyM" color="adminTextColor">
                  {label}
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
                seeMore
                  ? formatMessage(messages.seeLess)
                  : formatMessage(messages.seeMore, {
                      numberOfHiddenItems: options.length - 12,
                    })
              }
              width="auto"
            />
          </Box>
        )}
      </>
    );
  }
);

export default Options;
