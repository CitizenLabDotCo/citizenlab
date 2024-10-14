import React, { useState } from 'react';

import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import { WrappedComponentProps } from 'react-intl';

import useUserCustomField from 'api/user_custom_fields/useUserCustomField';
import useUserCustomFieldOptions from 'api/user_custom_fields_options/useUserCustomFieldsOptions';

import useLocalize from 'hooks/useLocalize';

import Button from 'components/UI/Button';

import { injectIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import { Bins } from '../../../api/reference_distribution/types';
import { FormValues } from '../../../utils/form';
import {
  getPercentages,
  formatUserCustomFieldOptions,
  formatBinOptions,
} from '../../../utils/options';
import binMessages from '../BinModal/messages';

import messages from './messages';
import OptionInput from './OptionInput';

interface Props {
  userCustomFieldId: string;
  formValues: FormValues;
  bins?: Bins;
  onUpdateEnabled: (optionId: string, enabled: boolean) => void;
  onUpdatePopulation: (optionId: string, population: number | null) => void;
  onEditBins: () => void;
}

const Options = injectIntl(
  ({
    userCustomFieldId,
    formValues,
    bins,
    onUpdateEnabled,
    onUpdatePopulation,
    onEditBins,
    intl: { formatMessage },
  }: Props & WrappedComponentProps) => {
    const [seeMore, setSeeMore] = useState(false);
    const { data: userCustomField } = useUserCustomField(userCustomFieldId);
    const { data: userCustomFieldOptions } =
      useUserCustomFieldOptions(userCustomFieldId);
    const localize = useLocalize();

    if (isNilOrError(userCustomFieldOptions) || isNilOrError(userCustomField)) {
      return null;
    }

    const options =
      userCustomField.data.attributes.key === 'birthyear' && bins
        ? formatBinOptions(bins, formatMessage(binMessages.andOver))
        : formatUserCustomFieldOptions(userCustomFieldOptions.data, localize);

    const visibleOptions = options.slice(
      0,
      seeMore ? userCustomFieldOptions.data.length : 12
    );

    const showSeeMoreButton = userCustomFieldOptions.data.length > 12;
    const showEditAgeGroupsButton =
      userCustomField.data.attributes.key === 'birthyear' && bins;

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
                {!bins && (
                  <Toggle
                    checked={enabled}
                    onChange={onToggle(id)}
                    className="representativeness-toggle"
                  />
                )}

                <Text ml={bins ? '' : '12px'} variant="bodyM" color="primary">
                  {label}
                </Text>
              </Box>

              <Box display="flex" alignItems="center" width="40%">
                <OptionInput
                  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
              buttonStyle="secondary-outlined"
              text={
                seeMore
                  ? formatMessage(messages.seeLess)
                  : formatMessage(messages.seeMore, {
                      numberOfHiddenItems: options.length - 12,
                    })
              }
              width="auto"
              data-testid="representativeness-see-more-button"
              onClick={toggleSeeMore}
            />
          </Box>
        )}

        {showEditAgeGroupsButton && (
          <Box width="100%" display="flex" mt="16px" mb="12px">
            <Button
              buttonStyle="secondary-outlined"
              text={formatMessage(messages.editAgeGroups)}
              width="auto"
              icon="edit"
              data-testid="edit-age-groups-button"
              onClick={onEditBins}
            />
          </Box>
        )}
      </>
    );
  }
);

export default Options;
