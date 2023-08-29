import React, { ReactNode } from 'react';
import styled from 'styled-components';

import { TagType } from 'api/analysis_tags/types';

import {
  Box,
  Title,
  Text,
  colors,
  Spinner,
  IconTooltip,
  Icon,
  Label,
  Radio,
} from '@citizenlab/cl2-component-library';
import Tag from '../Tag';
import { AutoTaggingMethod } from 'api/analysis_background_tasks/types';
import FilterItems from '../../FilterItems';
import { IInputsFilterParams } from 'api/analysis_inputs/types';
import { isEmpty } from 'lodash-es';

const AutoTagMethodContainer = styled.div<{ disabled: boolean }>`
  background-color: ${colors.grey100};
  border-radius: 3px;
  padding: 16px;
  ${({ disabled }) =>
    disabled
      ? ''
      : `
      cursor: pointer;
      &:hover {
        border: 1px black;
        box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
          rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
      }`}
`;

const AutoTagTargetContainer = styled.div`
  flex: 1;
  background-color: ${colors.grey100};
  border-radius: 3px;
  padding: 16px;
  cursor: pointer;
  &:hover {
    box-shadow: rgba(0, 0, 0, 0.02) 0px 1px 3px 0px,
      rgba(27, 31, 35, 0.15) 0px 0px 0px 1px;
  }
  &.selected {
    outline: 1px solid ${colors.grey400};
  }
  &.disabled {
    cursor: not-allowed;
    opacity: 0.5;
    box-shadow: none;
  }
`;
const AutoTagOption = ({
  children,
  tagType,
  title,
  onSelect,
  disabled,
  isLoading,
  tooltip,
}: {
  children: ReactNode;
  tagType: TagType;
  title: string;
  onSelect: () => void;
  disabled: boolean;
  isLoading: boolean;
  tooltip?: string;
}) => {
  return (
    <AutoTagMethodContainer onClick={() => onSelect()} disabled={disabled}>
      <Box
        display="flex"
        justifyContent="flex-start"
        alignItems="center"
        gap="6px"
      >
        <Tag tagType={tagType} name={title} />
        {isLoading && (
          <Box mx="16px">
            <Spinner size="24px" />
          </Box>
        )}
        {tooltip && <IconTooltip content={tooltip} icon="info-outline" />}
      </Box>
      <Text mt="12px" mb="0     ">
        {children}
      </Text>
    </AutoTagMethodContainer>
  );
};

type Props = {
  onSelectMethod: (tagType: AutoTaggingMethod) => void;
  isLoading: boolean;
  loadingMethod?: AutoTaggingMethod;
  autoTaggingTarget: 'all' | 'filters';
  filters: IInputsFilterParams;
  onChangeAutoTaggingTarget: (target: 'all' | 'filters') => void;
};

const Step1 = ({
  onSelectMethod,
  isLoading,
  loadingMethod,
  autoTaggingTarget,
  onChangeAutoTaggingTarget,
  filters,
}: Props) => {
  return (
    <>
      <Title mb="32px">
        <Icon name="flash" height="32px" width="32px" /> Auto-tag
      </Title>
      <Text mb="32px">
        Auto-tags are automatically derived by the computer. You can change or
        remove them at all times.
      </Text>

      <Title variant="h4">What inputs do you want to tag?</Title>

      <Box display="flex" gap="16px">
        <AutoTagTargetContainer
          className={autoTaggingTarget === 'all' ? 'selected' : ''}
          onClick={() => onChangeAutoTaggingTarget('all')}
        >
          <Box display="flex">
            <Radio
              currentValue={autoTaggingTarget}
              name="auto_tagging_target"
              value="all"
            />
            <Label>All inputs</Label>
          </Box>
        </AutoTagTargetContainer>
        <AutoTagTargetContainer
          className={`${autoTaggingTarget === 'filters' ? 'selected' : ''} ${
            isEmpty(filters) ? 'disabled' : ''
          }`}
          onClick={() =>
            !isEmpty(filters) && onChangeAutoTaggingTarget('filters')
          }
        >
          <Box display="flex">
            <Radio
              currentValue={autoTaggingTarget}
              name="auto_tagging_target"
              value="filters"
              disabled={isEmpty(filters)}
            />
            <Box>
              <Label>Use current filters</Label>
              {isEmpty(filters) && (
                <Text fontSize="s" m="0">
                  No active filters
                </Text>
              )}
            </Box>
          </Box>
          <FilterItems filters={filters} isEditable={false} />
        </AutoTagTargetContainer>
      </Box>

      <Title variant="h4">How do you want to tag?</Title>

      <Box
        display="flex"
        flexDirection="column"
        gap="16px"
        opacity={isLoading ? 0.5 : undefined}
      >
        <Title variant="h6" m="0">
          Topic detection
        </Title>

        <AutoTagOption
          tagType="nlp_topic"
          title="Fully automated"
          onSelect={() => onSelectMethod('nlp_topic')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'nlp_topic'}
          tooltip="Works well when your projects covers a broad range of topics. Good place to start."
        >
          <>The computer detects the topics and assigns the inputs</>
        </AutoTagOption>

        <AutoTagOption
          tagType="custom"
          title="Classification by label"
          onSelect={() => onSelectMethod('label_classification')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'label_classification'}
          tooltip="Works well when you know what tags you are looking for, or when your project has a narrow scope in terms of topics."
        >
          <>You create the topics, the inputs are assigned by the computer</>
        </AutoTagOption>

        <AutoTagOption
          tagType="custom"
          title="Classification by example"
          onSelect={() => onSelectMethod('few_shot_classification')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'few_shot_classification'}
          tooltip='Works well when you need to tag some really specific things. Use this in case "Classification by label" does not give you good results'
        >
          <>
            You create the topics and manually assign a few inputs as an
            example, the computer assigns the rest
          </>
        </AutoTagOption>

        <AutoTagOption
          tagType="platform_topic"
          title="Platform tags"
          onSelect={() => onSelectMethod('platform_topic')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'platform_topic'}
        >
          <>
            Assign the existing platform tags that the author picked when
            posting
          </>
        </AutoTagOption>

        <Title variant="h6" m="0">
          Other
        </Title>

        <AutoTagOption
          tagType="sentiment"
          title="Sentiment"
          onSelect={() => onSelectMethod('sentiment')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'sentiment'}
        >
          <>
            Assign a positive or negative sentiment to each input, derived from
            the text
          </>
        </AutoTagOption>

        <AutoTagOption
          tagType="controversial"
          title="Controversial"
          onSelect={() => onSelectMethod('controversial')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'controversial'}
        >
          <>Detect inputs with a significant dislikes/likes ratio</>
        </AutoTagOption>

        <AutoTagOption
          tagType="language"
          title="Language"
          onSelect={() => onSelectMethod('language')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'language'}
        >
          <>Detect the language of each input</>
        </AutoTagOption>
      </Box>
    </>
  );
};

export default Step1;
