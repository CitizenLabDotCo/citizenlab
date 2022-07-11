import React from 'react';

// components
import { Box, Text, Input } from '@citizenlab/cl2-component-library';
import BinInputsHeader from './BinInputsHeader';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

interface Props {
  bins: [number, number][];
}

const BinInputs = ({ bins }: Props) => (
  <Box mt="32px">
    <BinInputsHeader />
    {bins.map((bin, i) => (
      <BinInputRow groupNumber={i + 1} bin={bin} key={i} />
    ))}
  </Box>
);

interface RowProps {
  bin: [number, number];
  groupNumber: number;
}

const BinInputRow = injectIntl(
  ({
    bin,
    groupNumber,
    intl: { formatMessage },
  }: RowProps & InjectedIntlProps) => (
    <Box display="flex" flexDirection="row" mt="10px" mb="10px">
      <Box width="25%">
        <Text color="adminTextColor">Age group {groupNumber}</Text>
      </Box>
      <Box width="25%" pr="24px" display="flex" alignItems="center">
        <Input type="number" value={bin[0].toString()} />
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
);

export default BinInputs;
