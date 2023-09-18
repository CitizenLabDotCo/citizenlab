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
import translations from '../translations';
import { useIntl } from 'utils/cl-intl';

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
      <Text mt="12px" mb="0px">
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
  const { formatMessage } = useIntl();
  return (
    <>
      <Title mb="32px">
        <Icon name="flash" height="32px" width="32px" />{' '}
        {formatMessage(translations.autoTagTitle)}
      </Title>
      <Text mb="32px">{formatMessage(translations.autoTagDescription)}</Text>

      <Title variant="h4">{formatMessage(translations.autoTagSubtitle)}</Title>

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
            <Label>{formatMessage(translations.allInput)}</Label>
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
              <Label>{formatMessage(translations.useCurrentFilters)}</Label>
              {isEmpty(filters) && (
                <Text fontSize="s" m="0">
                  {formatMessage(translations.noActiveFilters)}
                </Text>
              )}
            </Box>
          </Box>
          <FilterItems filters={filters} isEditable={false} />
        </AutoTagTargetContainer>
      </Box>

      <Title variant="h4">{formatMessage(translations.howToTag)}</Title>

      <Box
        display="flex"
        flexDirection="column"
        gap="16px"
        opacity={isLoading ? 0.5 : undefined}
      >
        <Title variant="h6" m="0">
          {formatMessage(translations.topicDetection)}
        </Title>

        <AutoTagOption
          tagType="nlp_topic"
          title={formatMessage(translations.fullyAutomatedTitle)}
          onSelect={() => onSelectMethod('nlp_topic')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'nlp_topic'}
          tooltip={formatMessage(translations.fullyAutomatedTooltip)}
        >
          {formatMessage(translations.fullyAutomatedDescription)}
        </AutoTagOption>

        <AutoTagOption
          tagType="custom"
          title={formatMessage(translations.classificationByLabelTitle)}
          onSelect={() => onSelectMethod('label_classification')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'label_classification'}
          tooltip={formatMessage(translations.classificationByLabelTooltip)}
        >
          {formatMessage(translations.classificationByLabelDescription)}
        </AutoTagOption>

        <AutoTagOption
          tagType="custom"
          title={formatMessage(translations.classificationByExampleTitle)}
          onSelect={() => onSelectMethod('few_shot_classification')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'few_shot_classification'}
          tooltip={formatMessage(translations.classificationByExampleTooltip)}
        >
          {formatMessage(translations.classificationByExampleDescription)}
        </AutoTagOption>

        <AutoTagOption
          tagType="platform_topic"
          title={formatMessage(translations.platformTagsTitle)}
          onSelect={() => onSelectMethod('platform_topic')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'platform_topic'}
        >
          {formatMessage(translations.platformTagsDescription)}
        </AutoTagOption>

        <Title variant="h6" m="0">
          {formatMessage(translations.other)}
        </Title>

        <AutoTagOption
          tagType="sentiment"
          title={formatMessage(translations.sentimentTagTitle)}
          onSelect={() => onSelectMethod('sentiment')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'sentiment'}
        >
          {formatMessage(translations.sentimentTagDescription)}
        </AutoTagOption>

        <AutoTagOption
          tagType="controversial"
          title={formatMessage(translations.controversialTagTitle)}
          onSelect={() => onSelectMethod('controversial')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'controversial'}
        >
          {formatMessage(translations.controversialTagDescription)}
        </AutoTagOption>

        <AutoTagOption
          tagType="language"
          title={formatMessage(translations.languageTagTitle)}
          onSelect={() => onSelectMethod('language')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'language'}
        >
          {formatMessage(translations.languageTagDescription)}
        </AutoTagOption>
      </Box>
    </>
  );
};

export default Step1;
