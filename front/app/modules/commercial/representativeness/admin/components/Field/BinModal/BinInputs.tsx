import React, { useState } from 'react';

// components
import { Box, Text, Input } from '@citizenlab/cl2-component-library';
import BinInputsHeader from './BinInputsHeader';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// utils
import { getLowerBoundLimits, getUpperBoundLimits } from './utils';
import { clamp } from 'lodash-es';

// typings
import { Bins } from '.';

interface Props {
  bins: Bins;
  onUpdateLowerBound: (binIndex: number, newValue: number | null) => void;
  onUpdateUpperBound: (newValue: number | null) => void;
}

const BinInputs = ({ bins, ...otherProps }: Props) => (
  <Box mt="32px">
    <BinInputsHeader />
    {[...Array(bins.length - 1)].map((_, i) => (
      <BinInputRow binIndex={i} bins={bins} key={i} {...otherProps} />
    ))}
  </Box>
);

interface RowProps {
  bins: Bins;
  binIndex: number;
  onUpdateLowerBound: (binIndex: number, newValue: number | null) => void;
  onUpdateUpperBound: (newValue: number | null) => void;
}

const withinRange = (value: number, lower: number, upper: number) =>
  value >= lower && value <= upper;

const BinInputRow = injectIntl(
  ({
    bins,
    binIndex,
    onUpdateLowerBound,
    onUpdateUpperBound,
    intl: { formatMessage },
  }: RowProps & InjectedIntlProps) => {
    const lowerBound = bins[binIndex];
    const nextLowerBound = bins[binIndex + 1];
    const upperBound = nextLowerBound === null ? null : nextLowerBound - 1;
    
    const isLastBin = binIndex === bins.length - 2;
    const [lowerBoundMin, lowerBoundMax] = getLowerBoundLimits(bins, binIndex);
    const [upperBoundMin, upperBoundMax] = getUpperBoundLimits(bins);

    const [tempLowerBound, setTempLowerBound] = useState<number | null>(lowerBound);
    const [tempUpperBound, setTempUpperBound] = useState<number | null>(upperBound);

    const displayLowerBound // TODO

    const handleChangeLowerBound = (newValueStr: string) => {
      setTempLowerBound(newValueStr === '' ? null : +newValueStr)
    };

    const handleBlurLowerBound = () => {
      if (tempLowerBound === lowerBound) {
        return;
      }

      onUpdateLowerBound(
        binIndex, 
        tempLowerBound === null
          ? tempLowerBound
          : clamp(tempLowerBound, lowerBoundMin, lowerBoundMax)
      )
    };

    const handleChangeUpperBound = (newValueStr: string) => {
      setTempUpperBound(newValueStr === '' ? null : +newValueStr);
    };

    const handleBlurUpperBound = () => {
      if (tempUpperBound === upperBound) {
        return;
      }

      onUpdateLowerBound(
        binIndex, 
        tempLowerBound === null
          ? tempLowerBound
          : clamp(tempLowerBound, lowerBoundMin, lowerBoundMax)
      )
    };

    return (
      <Box display="flex" flexDirection="row" mt="10px" mb="10px">
        <Box width="25%">
          <Text color="adminTextColor">Age group {binIndex + 1}</Text>
        </Box>
        <Box width="25%" pr="24px" display="flex" alignItems="center">
          <Input
            type="number"
            value={}
            min={lowerBoundMin.toString()}
            max={lowerBoundMax.toString()}
            onChange={handleChangeLowerBound}
            onBlur={handleBlurLowerBound}
          />
        </Box>
        <Box width="25%" pr="24px" display="flex" alignItems="center">
          <Input
            type="number"
            value={}
            disabled={!isLastBin}
            placeholder={
              isLastBin ? formatMessage(messages.andOver) : undefined
            }
            min={upperBoundMin.toString()}
            max={upperBoundMax.toString()}
            onChange={handleChangeUpperBound}
            onBlur={handleBlurUpperBound}
          />
        </Box>
        <Box width="25%">
          <Text variant="bodyS" fontWeight="bold" color="adminTextColor">
            {upperBound !== null
              ? `${lowerBound}-${upperBound}`
              : formatMessage(messages.ageAndOver, { age: lowerBound })}
          </Text>
        </Box>
      </Box>
    );
  }
);

export default BinInputs;
