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
}

const BinInputs = ({ bins, onUpdateLowerBound }: Props) => (
  <Box mt="32px">
    <BinInputsHeader />
    {bins.map((_, i) => (
      <BinInputRow
        groupIndex={i}
        bins={bins}
        onUpdateLowerBound={onUpdateLowerBound}
        key={i}
      />
    ))}
  </Box>
);

interface RowProps {
  bins: Bins;
  groupIndex: number;
  onUpdateLowerBound: (groupIndex: number, newValue: number) => void;
}

const BinInputRow = injectIntl(
  ({
    bins,
    groupIndex,
    onUpdateLowerBound,
    intl: { formatMessage },
  }: RowProps & InjectedIntlProps) => {
    const [lowerBound, setLowerBound] = useState<number | undefined>();

    const bin = bins[groupIndex];
    const isLastBin = groupIndex === bins.length - 1;
    const lowerBoundMin = groupIndex === 0 ? 0 : bins[groupIndex - 1][0] + 2;
    const lowerBoundMax = isLastBin ? 129 : bin[1] - 1;

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

      if (newLowerBound >= lowerBoundMin && newLowerBound <= lowerBoundMax) {
        onUpdateLowerBound(groupIndex, newLowerBound);
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
            onChange={handleChangeLowerBound}
            min={lowerBoundMin.toString()}
            max={lowerBoundMax.toString()}
            onBlur={handleBlurLowerBound}
          />
        </Box>
        <Box width="25%" pr="24px" display="flex" alignItems="center">
          <Input
            type="number"
            value={bin[1].toString()}
            disabled={!isLastBin}
            placeholder={
              isLastBin ? formatMessage(messages.andOver) : undefined
            }
            min={(bin[0] + 1).toString()}
            max="130"
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
