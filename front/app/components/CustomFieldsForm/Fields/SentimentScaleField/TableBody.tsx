import React from 'react';

import { Tbody, Text, Th, Tr } from '@citizenlab/cl2-component-library';

import { IFlatCustomField } from 'api/custom_fields/types';

import useLocalize from 'hooks/useLocalize';

import { ScreenReaderOnly } from 'utils/a11y';

import { getLinearScaleLabel } from '../LinearScale/utils';

import { MAXIMUM } from './constants';

interface Props {
  question: IFlatCustomField;
  getAriaLabel: (value: number, total: number) => string;
}

const TableBody = ({ question, getAriaLabel }: Props) => {
  const localize = useLocalize();

  // Put all labels from the UI Schema in an array so we can easily access them
  const labelsFromSchema = Array.from({ length: MAXIMUM }, (_, index) => {
    const labelMultiloc = getLinearScaleLabel(question, index + 1);
    return labelMultiloc ? localize(labelMultiloc) : '';
  });

  return (
    <Tbody>
      <Tr>
        {[...Array(MAXIMUM).keys()].map((index) => {
          return (
            <Th
              p="0px"
              maxWidth="20%"
              key={`${question.key}-radio-${index}`}
              scope="col"
              tabIndex={-1}
              pb="8px"
            >
              <Text
                textAlign="center"
                m="0px"
                px="4px"
                color="grey700"
                wordBreak="break-word"
                lineHeight="1.2"
              >
                {labelsFromSchema[index]}

                <ScreenReaderOnly>
                  {/* If there is not a label for this index, make sure that we still generate
                      a meaningful aria-label for screen readers.
                      */}
                  {!labelsFromSchema[index] && getAriaLabel(index + 1, MAXIMUM)}
                  {/* We use index + 1 because the index is 0-indexed, but the values are 1-indexed. */}
                </ScreenReaderOnly>
              </Text>
            </Th>
          );
        })}
      </Tr>
    </Tbody>
  );
};

export default TableBody;
