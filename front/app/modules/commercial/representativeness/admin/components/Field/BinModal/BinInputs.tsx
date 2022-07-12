import React, { useState } from 'react';

// components
import { Box, Text, Input } from '@citizenlab/cl2-component-library';
import BinInputsHeader from './BinInputsHeader';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// typings
import { Bins } from '.';

interface Props {
  bins: Bins;
  onUpdateLowerBound: (groupIndex: number, newValue: number) => void;
  onUpdateUpperBound: (newValue: number) => void;
}

const BinInputs = ({ bins, ...otherProps }: Props) => (
  <Box mt="32px">
    <BinInputsHeader />
    {bins.map((_, i) => (
      <BinInputRow groupIndex={i} bins={bins} key={i} {...otherProps} />
    ))}
  </Box>
);

interface RowProps {
  bins: Bins;
  groupIndex: number;
  onUpdateLowerBound: (groupIndex: number, newValue: number) => void;
  onUpdateUpperBound: (newValue: number) => void;
}

const withinRange = (value: number, lower: number, upper: number) =>
  value >= lower && value <= upper;

const BinInputRow = injectIntl(
  ({
    bins,
    groupIndex,
    onUpdateLowerBound,
    onUpdateUpperBound,
    intl: { formatMessage },
  }: RowProps & InjectedIntlProps) => {
    const [lowerBound, setLowerBound] = useState<number | undefined>();
    const [upperBound, setUpperBound] = useState<number | undefined>();

    const bin = bins[groupIndex];
    const isLastBin = groupIndex === bins.length - 1;

    const lowerBoundMin = groupIndex === 0 ? 0 : bins[groupIndex - 1][0] + 2;
    const lowerBoundMax = isLastBin ? 129 : bin[1] - 1;

    const upperBoundMin = bin[0] + 1;
    const upperBoundMax = 130;

    const handleChangeLowerBound = (newValueStr: string) => {
      const newValue = +newValueStr;
      setLowerBound(newValue);
    };

    const handleBlurLowerBound = () => {
      if (lowerBound === undefined || lowerBound === bin[0]) {
        return;
      }

      const newLowerBound = lowerBound;
      setLowerBound(undefined);

      if (withinRange(newLowerBound, lowerBoundMin, lowerBoundMax)) {
        onUpdateLowerBound(groupIndex, newLowerBound);
      }
    };

    const handleChangeUpperBound = (newValueStr: string) => {
      const newValue = +newValueStr;
      setUpperBound(newValue === 0 ? Infinity : newValue);
    };

    const handleBlurUpperBound = () => {
      if (upperBound === bin[1]) {
        return;
      }

      const newUpperBound = upperBound !== undefined ? upperBound : Infinity;

      setUpperBound(undefined);

      if (
        withinRange(newUpperBound, upperBoundMin, upperBoundMax) ||
        !isFinite(newUpperBound)
      ) {
        onUpdateUpperBound(newUpperBound);
      }
    };

    return (
      <Box display="flex" flexDirection="row" mt="10px" mb="10px">
        <Box width="25%">
          <Text color="adminTextColor">Age group {groupIndex + 1}</Text>
        </Box>
        <Box width="25%" pr="24px" display="flex" alignItems="center">
          <Input
            type="number"
            value={(lowerBound !== undefined ? lowerBound : bin[0]).toString()}
            min={lowerBoundMin.toString()}
            max={lowerBoundMax.toString()}
            onChange={handleChangeLowerBound}
            onBlur={handleBlurLowerBound}
          />
        </Box>
        <Box width="25%" pr="24px" display="flex" alignItems="center">
          <Input
            type="number"
            value={(upperBound !== undefined ? upperBound : bin[1]).toString()}
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
            {isFinite(bin[1])
              ? `${bin[0]}-${bin[1]}`
              : formatMessage(messages.ageAndOver, { age: bin[0] })}
          </Text>
        </Box>
      </Box>
    );
  }
);

export default BinInputs;
