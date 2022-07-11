import React, { useState } from 'react';

// components
import { Box, Text, Input } from '@citizenlab/cl2-component-library';
import BinInputsHeader from './BinInputsHeader';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

// typings
import { Bins } from '.'

interface Props {
  bins: Bins;
  onUpdateLowerBound: (groupIndex: number, newValue: number) => void;
}

const BinInputs = ({ bins, onUpdateLowerBound }: Props) => (
  <Box mt="32px">
    <BinInputsHeader />
    {bins.map((bin, i) => (
      <BinInputRow 
        groupIndex={i}
        bin={bin}
        onUpdateLowerBound={onUpdateLowerBound}
        key={i}
      />
    ))}
  </Box>
);

interface RowProps {
  bin: [number, number];
  groupIndex: number;
  onUpdateLowerBound: (groupIndex: number, newValue: number) => void;
}

const BinInputRow = injectIntl(
  ({
    bin,
    groupIndex,
    onUpdateLowerBound,
    intl: { formatMessage },
  }: RowProps & InjectedIntlProps) => {
    const [lowerBound, setLowerBound] = useState<number | undefined>();

    const handleChangeLowerBound = (newValueStr: string) => {
      const newValue = +newValueStr;
      setLowerBound(newValue);
    }

    const handleBlurLowerBound = () => {
      if (lowerBound === undefined || lowerBound === bin[0]) {
        return;
      }

      const newLowerBound = lowerBound;
      setLowerBound(undefined);
      onUpdateLowerBound(groupIndex, newLowerBound);
    }

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
            min="0"
            onBlur={handleBlurLowerBound}
          />
        </Box>
        <Box width="25%" pr="24px" display="flex" alignItems="center">
          <Input
            type="number"
            value={bin[1].toString()}
            disabled={isFinite(bin[1])}
            placeholder={
              !isFinite(bin[1]) ? formatMessage(messages.andOver) : undefined
            }
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
    )
  }
);

export default BinInputs;
