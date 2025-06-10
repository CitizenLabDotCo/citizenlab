import React from 'react';

import { Box, Text, useBreakpoint } from '@citizenlab/cl2-component-library';
import { IFlatCustomField } from 'api/custom_fields/types';
import useLocalize from 'hooks/useLocalize';
import { getLinearScaleLabel } from './utils';

interface Props {
  question: IFlatCustomField;
  maximum: number;
}

interface Props {
  question: IFlatCustomField;
  maximum: number;
}

const Labels = ({ question, maximum }: Props) => {
  const isSmallerThanPhone = useBreakpoint('phone');
  const localize = useLocalize();

  // Put all labels in an array so we can easily access them
  const labelsFromSchema = Array.from({ length: maximum }, (_, index) => {
    const label = getLinearScaleLabel(question, index + 1);
    return label ? localize(label) : undefined;
  });

  // Get an array of the middle value labels so we can determine how to show them in the UI
  const middleValueLabels = labelsFromSchema.slice(1, -1); // Get only the middle values
  const hasOnlyMinOrMaxLabels = middleValueLabels.every((label) => !label); // There should be no middle value labels

  return (
    <Box
      width="100%"
      display={isSmallerThanPhone ? 'block' : 'flex'}
      justifyContent="space-between"
    >
      {hasOnlyMinOrMaxLabels && !isSmallerThanPhone ? ( // For desktop view when only min and/or max labels are present
        <>
          <Box maxWidth={'50%'}>
            <Text mt="8px" mb="0px" color="textSecondary">
              {labelsFromSchema[0]}
            </Text>
          </Box>
          <Box maxWidth={'50%'}>
            <Text mt={'8px'} m="0px" color="textSecondary">
              {labelsFromSchema[labelsFromSchema.length - 1]}
            </Text>
          </Box>
        </>
      ) : (
        // Show labels as list underneath the buttons when more than 3 labels OR on mobile devices
        <Box maxWidth={'100%'}>
          {labelsFromSchema.map((label, index) => (
            <Box display="flex" key={`${question.key}-${index}`}>
              {label && (
                <>
                  <Text
                    mt="8px"
                    mb="0px"
                    mr="8px"
                    color="textSecondary"
                    style={{ textAlign: 'center' }}
                  >
                    {`${index + 1}.`}
                  </Text>
                  <Text
                    mt="8px"
                    mb="0px"
                    color="textSecondary"
                    style={{ textAlign: 'center' }}
                  >
                    {label}
                  </Text>
                </>
              )}
            </Box>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Labels;
