import React from 'react';

import {
  Box,
  Button,
  Icon,
  Text,
  bo,
  colors,
} from '@citizenlab/cl2-component-library';
import { buttonsFocusRingInset } from 'global-styles';
import styled from 'styled-components';

import { useIntl } from 'utils/cl-intl';
import { parseBackendDateString } from 'utils/dateUtils';

import { Level } from '../level';
import messages from '../messages';

import { getDateOperator, getListOperator } from './chipWording';
import { FACETS, FacetKey, isListFacet } from './facets';
import { pickedOptions } from './selection';
import useFacetOptions from './useFacetOptions';
import useFilters from './useFilters';

const SEGMENT_BORDER = `1px solid ${colors.grey200}`;

// It clips its overflow, to keep the remove button's hover inside its corners.
const Chip = styled(Box)`
  ${buttonsFocusRingInset}
`;

interface Props {
  facetKey: FacetKey;
  level: Level;
}

// One filter in words: "Status is any of Live, Draft", with a button to drop
// it.
const FilterChip = ({ facetKey, level }: Props) => {
  const { formatMessage, formatDate } = useIntl();
  const { valuesOf, minStartDate, maxStartDate, removeFacet } =
    useFilters(level);
  const { options } = useFacetOptions(
    isListFacet(facetKey) ? [facetKey] : [],
    level
  );
  const facetLabel = formatMessage(FACETS[facetKey].label);

  const date = (value: string) =>
    formatDate(parseBackendDateString(value), {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  const describe = () => {
    if (isListFacet(facetKey)) {
      const labels = pickedOptions(options[facetKey], valuesOf(facetKey)).map(
        (option) => option.label
      );
      return {
        operator: getListOperator(labels.length),
        value: labels.join(', '),
      };
    }
    const operator = getDateOperator(minStartDate, maxStartDate);
    if (minStartDate && maxStartDate) {
      return {
        operator,
        value: formatMessage(messages.datesBetween, {
          from: date(minStartDate),
          to: date(maxStartDate),
        }),
      };
    }
    const onlyDate = minStartDate ?? maxStartDate;
    return { operator, value: onlyDate ? date(onlyDate) : undefined };
  };

  const { operator, value } = describe();

  return (
    <Chip
      display="inline-flex"
      alignItems="stretch"
      height="28px"
      border={`1px solid ${colors.grey300}`}
      borderRadius={bo.borderRadius}
      bgColor={colors.white}
      overflow="hidden"
    >
      <Box display="flex" alignItems="center" gap="6px" px="8px">
        <Icon
          name={FACETS[facetKey].icon}
          width="13px"
          height="13px"
          fill={colors.coolGrey500}
        />
        <Text as="span" m="0" variant="boMicro" color="coolGrey700">
          {facetLabel}
        </Text>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        px="8px"
        borderLeft={SEGMENT_BORDER}
      >
        <Text as="span" m="0" variant="boMicro" color="coolGrey600">
          {formatMessage(operator)}
        </Text>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        px="8px"
        borderLeft={SEGMENT_BORDER}
      >
        <Text as="span" m="0" variant="boMicro" color="coolGrey700">
          {value}
        </Text>
      </Box>
      <Box display="flex" alignItems="center" borderLeft={SEGMENT_BORDER}>
        <Button
          type="button"
          buttonStyle="bo-text"
          icon="close"
          iconSize="12px"
          iconColor={colors.coolGrey500}
          padding="0 8px"
          height="100%"
          borderRadius="0"
          ariaLabel={formatMessage(messages.removeFilter, {
            filter: facetLabel,
          })}
          onClick={() => removeFacet(facetKey)}
        />
      </Box>
    </Chip>
  );
};

export default FilterChip;
