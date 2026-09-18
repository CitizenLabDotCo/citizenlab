import React from 'react';

import {
  Box,
  IconTooltip,
  Select,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import {
  DemographicField,
  OpinionGroupsParameters,
} from 'api/opinion_groups/types';

import useLocalize from 'hooks/useLocalize';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

export type ColorBy = { type: 'group' } | { type: 'field'; fieldKey: string };

interface Props {
  parameters: OpinionGroupsParameters;
  onChangeParameters: (parameters: OpinionGroupsParameters) => void;
  colorBy: ColorBy;
  onChangeColorBy: (colorBy: ColorBy) => void;
  demographicFields: DemographicField[];
}

const AUTOMATIC = 'auto';
const GROUP = 'group';

const Controls = ({
  parameters,
  onChangeParameters,
  colorBy,
  onChangeColorBy,
  demographicFields,
}: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();

  const kOptions: IOption[] = [
    { value: AUTOMATIC, label: formatMessage(messages.automatic) },
    ...[2, 3, 4, 5].map((k) => ({ value: k, label: `${k}` })),
  ];

  const minVotesOptions: IOption[] = [1, 2, 3, 5, 10].map((n) => ({
    value: n,
    label: `${n}`,
  }));

  const weightOptions: IOption[] = [
    { value: 0.25, label: formatMessage(messages.demographicWeightLow) },
    { value: 0.5, label: formatMessage(messages.demographicWeightMedium) },
    { value: 1, label: formatMessage(messages.demographicWeightHigh) },
  ];

  const colorByOptions: IOption[] = [
    { value: GROUP, label: formatMessage(messages.opinionGroup) },
    ...demographicFields.map((field) => ({
      value: field.key,
      label: localize(field.title_multiloc),
    })),
  ];

  return (
    <Box
      display="flex"
      flexWrap="wrap"
      gap="16px"
      alignItems="flex-end"
      p="16px"
      bgColor="white"
      border={`1px solid ${'#e0e0e0'}`}
      borderRadius="3px"
    >
      <Box minWidth="140px">
        <Select
          label={formatMessage(messages.numberOfGroups)}
          options={kOptions}
          value={parameters.k ?? AUTOMATIC}
          onChange={(option: IOption) =>
            onChangeParameters({
              ...parameters,
              k: option.value === AUTOMATIC ? undefined : Number(option.value),
            })
          }
        />
      </Box>

      <Box minWidth="200px">
        <Select
          label={formatMessage(messages.minVotesPerParticipant)}
          options={minVotesOptions}
          value={parameters.min_votes_per_participant ?? 3}
          onChange={(option: IOption) =>
            onChangeParameters({
              ...parameters,
              min_votes_per_participant: Number(option.value),
            })
          }
        />
      </Box>

      <Box minWidth="180px">
        <Select
          label={formatMessage(messages.colorBy)}
          options={colorByOptions}
          value={colorBy.type === 'group' ? GROUP : colorBy.fieldKey}
          onChange={(option: IOption) =>
            onChangeColorBy(
              option.value === GROUP
                ? { type: 'group' }
                : { type: 'field', fieldKey: String(option.value) }
            )
          }
        />
      </Box>

      {demographicFields.length > 0 && (
        <Box display="flex" alignItems="center" gap="8px" pb="10px">
          <Toggle
            checked={!!parameters.include_demographics}
            label={formatMessage(messages.useDemographics)}
            onChange={() =>
              onChangeParameters({
                ...parameters,
                include_demographics: !parameters.include_demographics,
              })
            }
          />
          <IconTooltip
            content={formatMessage(messages.useDemographicsTooltip)}
          />
        </Box>
      )}

      {parameters.include_demographics && (
        <Box minWidth="160px">
          <Select
            label={formatMessage(messages.demographicWeight)}
            options={weightOptions}
            value={parameters.demographic_weight ?? 0.5}
            onChange={(option: IOption) =>
              onChangeParameters({
                ...parameters,
                demographic_weight: Number(option.value),
              })
            }
          />
        </Box>
      )}
    </Box>
  );
};

export default Controls;
