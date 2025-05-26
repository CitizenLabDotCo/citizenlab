import React from 'react';

import { IFlatCustomField } from 'api/custom_fields/types';

import {
  Box,
  Button,
  Icon,
  Table,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
} from '@citizenlab/cl2-component-library';
import TableHead from './TableHead';
import TableBody from './TableBody';

interface Props {
  value?: number;
  question: IFlatCustomField;
  onChange: (value: number) => void;
}

const SentimentScale = ({ value: data, question, onChange }: Props) => {
  console.log(data);

  return (
    <Box
      data-testid="sentimentLinearScaleControl"
      role="slider"
      ref={sliderRef}
      aria-valuemin={minimum}
      aria-valuemax={maximum}
      aria-labelledby={sanitizeForClassname(id)}
      onKeyDown={(event) => {
        if (event.key !== 'Tab' && !event.metaKey) {
          // Don't override the default tab behaviour or meta key (E.g. Mac command key)
          handleKeyDown(event);
        }
      }}
      tabIndex={0}
    >
      <Box>
        <Table style={{ tableLayout: 'fixed' }}>
          <TableHead />
          <TableBody />
        </Table>
      </Box>
    </Box>
  );
};

export default SentimentScale;
