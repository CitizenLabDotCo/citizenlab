import React, { useState } from 'react';

// hooks
import useUserCustomField from 'hooks/useUserCustomField';
import useUserCustomFieldOptions from 'hooks/useUserCustomFieldOptions';
import useLocalize from 'hooks/useLocalize';

// components
import { Box, Text, Toggle } from '@citizenlab/cl2-component-library';
import OptionInput from './OptionInput';
import Button from 'components/UI/Button';

// i18n
import messages from './messages';
import binMessages from '../BinModal/messages';
import { injectIntl } from 'utils/cl-intl';
import { WrappedComponentProps } from 'react-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';
import {
  getPercentages,
  formatUserCustomFieldOptions,
  formatBinOptions,
} from '../../../utils/options';

// typings
import { FormValues } from '../../../utils/form';
import { Bins } from '../../../services/referenceDistribution';

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
    const userCustomField = useUserCustomField(userCustomFieldId);
    const userCustomFieldOptions = useUserCustomFieldOptions(userCustomFieldId);
    const localize = useLocalize();

    if (isNilOrError(userCustomFieldOptions) || isNilOrError(userCustomField)) {
      return null;
    }

    const options =
      userCustomField.attributes.key === 'birthyear' && bins
        ? formatBinOptions(bins, formatMessage(binMessages.andOver))
        : formatUserCustomFieldOptions(userCustomFieldOptions, localize);

    const visibleOptions = options.slice(
      0,
      seeMore ? userCustomFieldOptions.length : 12
    );

    const showSeeMoreButton = userCustomFieldOptions.length > 12;
    const showEditAgeGroupsButton =
      userCustomField.attributes.key === 'birthyear' && bins;

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
              buttonStyle="secondary"
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
