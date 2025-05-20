import React from 'react';

import { Box, Button, IOption, Text } from '@citizenlab/cl2-component-library';

import {
  DragAndDrop,
  Drop,
} from 'components/FormBuilder/components/DragAndDrop';

import { IFlatCustomField } from 'api/custom_fields/types';
import { useIntl } from 'utils/cl-intl';
import styled, { useTheme } from 'styled-components';

import messages from 'components/Form/Components/Controls/messages';
import RankingOption from './RankingOption';
import useLocalize from 'hooks/useLocalize';

const Ul = styled.ul`
  padding: 0;
  margin-top: 4px;
  list-style-type: none;
`;

interface Props {
  value?: string[];
  question: IFlatCustomField;
  onChange: (value: string[]) => void;
}

const getOptionsFromData = (
  data: string[],
  optionsFromSchema: IOption[]
): IOption[] => {
  return data
    .map((optionKey: string) => {
      return optionsFromSchema.find((option) => option.value === optionKey);
    })
    .filter((value): value is IOption => !!value);
};

const Ranking = ({ value: data, question }: Props) => {
  const { formatMessage } = useIntl();
  const localize = useLocalize();
  const theme = useTheme();

  if (!question.options) return null;

  // If form data present, get options in that ranking order.
  // Otherwise, get option order from the question.
  const questionOptions: IOption[] = question.options.map((option) => ({
    value: option.key,
    label: localize(option.title_multiloc),
  }));

  const options = data
    ? getOptionsFromData(data, questionOptions)
    : questionOptions;

  return (
    <Box
      display="flex"
      flexDirection="row"
      flexGrow={1}
      id="e2e-ranking-control"
    >
      <Box flexGrow={1}>
        <DragAndDrop
          onDragEnd={(result: DragAndDropResult) => {
            reorderFieldsAfterDrag(result);
          }}
        >
          <Drop id="droppable" type="rankOptions">
            <Text m="0px" aria-hidden color="tenantPrimary">
              {formatMessage(messages.rankingInstructions)}
            </Text>
            <Ul aria-labelledby={`ranking-question-label-${id}`}>
              {options?.map((option: IOption, index: number) => (
                <RankingOption option={option} index={index} />
              ))}
            </Ul>
          </Drop>
        </DragAndDrop>
        {data !== undefined && (
          <Box display="flex">
            <Button
              p="0px"
              buttonStyle="text"
              textColor={theme.colors.tenantPrimary}
              textDecoration="underline"
              text={formatMessage(messages.clearAll)}
              onClick={() => {
                updateData(undefined);
                setDidBlur(true);
              }}
            />
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default Ranking;
