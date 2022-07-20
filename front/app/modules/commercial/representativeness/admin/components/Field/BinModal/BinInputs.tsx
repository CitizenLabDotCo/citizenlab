import React, { useState } from 'react';

// components
import { Box, Text, Input, Icon } from '@citizenlab/cl2-component-library';
import BinInputsHeader from './BinInputsHeader';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// styling
import styled from 'styled-components';

// utils
import { getLowerBoundLimits, getUpperBoundLimits, parseLabel } from './utils';
import { clamp } from 'lodash-es';

// typings
import { Bins } from '../../../services/referenceDistribution';

const RemoveBinButton = styled.button`
  cursor: pointer;
`;

interface Props {
  bins: Bins;
  onUpdateLowerBound: (binIndex: number, newValue: number | null) => void;
  onUpdateUpperBound: (newValue: number | null) => void;
  onRemoveBin: () => void;
}

const BinInputs = ({ bins, ...otherProps }: Props) => (
  <Box mt="32px">
    <BinInputsHeader />
    {[...Array(bins.length - 1)].map((_, i) => (
      <BinInputRow binIndex={i} bins={bins} key={i} {...otherProps} />
    ))}
  </Box>
);

interface RowProps extends Props {
  binIndex: number;
}

const BinInputRow = injectIntl(
  ({
    bins,
    binIndex,
    onUpdateLowerBound,
    onUpdateUpperBound,
    onRemoveBin,
    intl: { formatMessage },
  }: RowProps & InjectedIntlProps) => {
    const lowerBound = bins[binIndex];
    const nextBound = bins[binIndex + 1];

    const isLastBin = binIndex === bins.length - 2;
    const [lowerBoundMin, lowerBoundMax] = getLowerBoundLimits(bins, binIndex);
    const [upperBoundMin, upperBoundMax] = getUpperBoundLimits(bins);

    const [currentLowerBound, setCurrentLowerBound] = useState<
      string | undefined
    >();
    const [currentUpperBound, setCurrentUpperBound] = useState<
      string | undefined
    >();

    const lowerBoundDisplayValue = currentLowerBound ?? lowerBound?.toString();
    const upperBoundDisplayValue = isLastBin
      ? currentUpperBound ?? nextBound?.toString()
      : nextBound === null
      ? undefined
      : (nextBound - 1).toString();

    const handleBlurLowerBound = () => {
      if (currentLowerBound === undefined) return;

      const newValue =
        currentLowerBound === ''
          ? null
          : clamp(+currentLowerBound, lowerBoundMin, lowerBoundMax);

      if (newValue !== lowerBound) {
        onUpdateLowerBound(binIndex, newValue);
      }

      setCurrentLowerBound(undefined);
    };

    const handleBlurUpperBound = () => {
      if (currentUpperBound === undefined) return;

      const newValue =
        currentUpperBound === ''
          ? null
          : clamp(+currentUpperBound, upperBoundMin, upperBoundMax);

      if (newValue !== nextBound) {
        onUpdateUpperBound(newValue);
      }

      setCurrentUpperBound(undefined);
    };

    return (
      <Box display="flex" flexDirection="row" mt="10px" mb="10px">
        <Box width="25%">
          <Text color="adminTextColor">Age group {binIndex + 1}</Text>
        </Box>
        <Box width="25%" pr="24px" display="flex" alignItems="center">
          <Input
            type="number"
            className="bin-input"
            value={lowerBoundDisplayValue}
            min={lowerBoundMin.toString()}
            max={lowerBoundMax.toString()}
            onChange={setCurrentLowerBound}
            onBlur={handleBlurLowerBound}
          />
        </Box>
        <Box width="25%" pr="24px" display="flex" alignItems="center">
          <Input
            type="number"
            className="bin-input"
            value={upperBoundDisplayValue}
            disabled={!isLastBin}
            placeholder={
              isLastBin ? formatMessage(messages.andOver) : undefined
            }
            min={upperBoundMin.toString()}
            max={upperBoundMax.toString()}
            onChange={setCurrentUpperBound}
            onBlur={handleBlurUpperBound}
          />
        </Box>
        <Box width="25%" display="flex" alignItems="center">
          <Text variant="bodyS" fontWeight="bold" color="adminTextColor">
            {parseLabel(
              lowerBoundDisplayValue,
              upperBoundDisplayValue,
              isLastBin,
              formatMessage(messages.ageAndOver, { age: lowerBound })
            )}
            {isLastBin && (
              <RemoveBinButton onClick={onRemoveBin}>
                <Icon
                  name="minus-circle"
                  width="13px"
                  height="13px"
                  ml="12px"
                />
              </RemoveBinButton>
            )}
          </Text>
        </Box>
      </Box>
    );
  }
);

export default BinInputs;
