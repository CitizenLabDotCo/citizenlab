import React, { ReactNode } from 'react';

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
  stylingConsts,
  Tooltip,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAnalysis from 'api/analyses/useAnalysis';
import { AutoTaggingMethod } from 'api/analysis_background_tasks/types';
import { IInputsFilterParams } from 'api/analysis_inputs/types';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';
import { TagType } from 'api/analysis_tags/types';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';
import Tag from '../Tag';

const AutoTagMethodContainer = styled.div<{ isDisabled: boolean }>`
  background-color: ${colors.grey100};
  width: 30%;
  border-radius: 3px;
  padding: 16px;
  ${({ isDisabled }) =>
    isDisabled
      ? `opacity: 0.5;
         cursor: not-allowed;`
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
  padding: 20px 16px 0px 16px;
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
    pointer-events: none;
  }
`;

const AutoTagOption = ({
  children,
  tagType,
  title,
  onSelect,
  isDisabled,
  isLoading,
  tooltip,
  isRecommended,
}: {
  children: ReactNode;
  tagType: TagType;
  title: string;
  onSelect: () => void;
  isDisabled: boolean;
  isLoading: boolean;
  tooltip?: string;
  isRecommended?: boolean;
}) => {
  const { formatMessage } = useIntl();
  return (
    <AutoTagMethodContainer
      onClick={isDisabled || isLoading ? undefined : () => onSelect()}
      isDisabled={isDisabled || isLoading}
    >
      {' '}
      <Tooltip
        content={
          <p>{formatMessage(messages.advancedAutotaggingUpsellMessage)}</p>
        }
        zIndex={9999999}
        disabled={!isDisabled}
      >
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb="8px"
        >
          <Box w="32px">
            <Tag tagType={tagType} name="&nbsp;" />
          </Box>
          {isRecommended && (
            <Box
              bgColor={colors.success}
              py="4px"
              px="8px"
              borderRadius={stylingConsts.borderRadius}
              display="flex"
              gap="4px"
              alignItems="center"
            >
              <Icon
                name="stars"
                fill={colors.white}
                width="16px"
                height="16px"
              />
              <Text color="white" m="0px" fontSize="s">
                {formatMessage(messages.recommended)}
              </Text>
            </Box>
          )}
          {isDisabled && <Icon name="lock" />}
        </Box>
        <Box
          display="flex"
          justifyContent="flex-start"
          alignItems="center"
          gap="6px"
        >
          <Title variant="h6" m="0px">
            {title}
          </Title>
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
      </Tooltip>
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
  const advancedAutotaggingEnabled = useFeatureFlag({
    name: 'advanced_autotagging',
    onlyCheckAllowed: true,
  });
  const { analysisId } = useParams() as { analysisId: string };
  const { data: analysis } = useAnalysis(analysisId);
  const { data: allInputs } = useInfiniteAnalysisInputs({
    analysisId,
  });
  const { data: filteredInputs } = useInfiniteAnalysisInputs({
    analysisId,
    queryParams: filters,
  });

  const allInputsCount = allInputs?.pages[0].meta.filtered_count;
  const filteredInputsCount = filteredInputs?.pages[0].meta.filtered_count;

  const { formatMessage } = useIntl();
  const advancedAutotaggingOptionDisabled = !advancedAutotaggingEnabled;

  return (
    <>
      <Title mb="32px">
        <Icon name="stars" height="32px" width="32px" />{' '}
        {formatMessage(messages.autoTagTitle)}
      </Title>
      <Text mb="32px">{formatMessage(messages.autoTagDescription)}</Text>

      <Title variant="h4">{formatMessage(messages.whatToTag)}</Title>

      <Box display="flex" gap="16px">
        <AutoTagTargetContainer
          className={autoTaggingTarget === 'all' ? 'selected' : ''}
          onClick={() => onChangeAutoTaggingTarget('all')}
        >
          <Radio
            currentValue={autoTaggingTarget}
            name="auto_tagging_target"
            value="all"
            id="auto_tagging_target_all"
            label={
              <>
                {formatMessage(messages.allInput)}
                {` (${allInputsCount})`}
              </>
            }
          />
          <Label />
        </AutoTagTargetContainer>
        <AutoTagTargetContainer
          className={`${autoTaggingTarget === 'filters' ? 'selected' : ''} ${
            isEmpty(filters) ? 'disabled' : ''
          }`}
          onClick={() =>
            !isEmpty(filters) && onChangeAutoTaggingTarget('filters')
          }
        >
          <Box>
            <Radio
              currentValue={autoTaggingTarget}
              name="auto_tagging_target"
              id="auto_tagging_target_filtered"
              value="filters"
              disabled={isEmpty(filters)}
              label={
                <>
                  {formatMessage(messages.useCurrentFilters)}
                  {` (${filteredInputsCount})`}
                </>
              }
            />

            {isEmpty(filters) && (
              <Text fontSize="s">
                {formatMessage(messages.noActiveFilters)}
              </Text>
            )}
          </Box>
        </AutoTagTargetContainer>
      </Box>

      <Title variant="h4">{formatMessage(messages.howToTag)}</Title>

      <Box display="flex" gap="16px" flexWrap="wrap">
        <AutoTagOption
          tagType="nlp_topic"
          title={formatMessage(messages.fullyAutomatedTitle)}
          onSelect={() => onSelectMethod('nlp_topic')}
          isDisabled={advancedAutotaggingOptionDisabled}
          isLoading={isLoading && loadingMethod === 'nlp_topic'}
          tooltip={formatMessage(messages.fullyAutomatedTooltip)}
          isRecommended
        >
          {formatMessage(messages.fullyAutomatedDescription)}
        </AutoTagOption>

        <AutoTagOption
          tagType="custom"
          title={formatMessage(messages.classificationByLabelTitle)}
          onSelect={() => onSelectMethod('label_classification')}
          isDisabled={isLoading}
          isLoading={isLoading && loadingMethod === 'label_classification'}
          tooltip={formatMessage(messages.classificationByLabelTooltip)}
        >
          {formatMessage(messages.classificationByLabelDescription)}
        </AutoTagOption>

        <AutoTagOption
          tagType="custom"
          title={formatMessage(messages.classificationByExampleTitle)}
          onSelect={() => onSelectMethod('few_shot_classification')}
          isDisabled={advancedAutotaggingOptionDisabled}
          isLoading={isLoading && loadingMethod === 'few_shot_classification'}
          tooltip={formatMessage(messages.classificationByExampleTooltip)}
        >
          {formatMessage(messages.classificationByExampleDescription)}
        </AutoTagOption>

        {analysis?.data.attributes.participation_method === 'ideation' && (
          <AutoTagOption
            tagType="platform_topic"
            title={formatMessage(messages.platformTagsTitle)}
            onSelect={() => onSelectMethod('platform_topic')}
            isDisabled={advancedAutotaggingOptionDisabled}
            isLoading={isLoading && loadingMethod === 'platform_topic'}
          >
            {formatMessage(messages.platformTagsDescription)}
          </AutoTagOption>
        )}

        <AutoTagOption
          tagType="sentiment"
          title={formatMessage(messages.sentimentTagTitle)}
          onSelect={() => onSelectMethod('sentiment')}
          isDisabled={advancedAutotaggingOptionDisabled}
          isLoading={isLoading && loadingMethod === 'sentiment'}
        >
          {formatMessage(messages.sentimentTagDescription)}
        </AutoTagOption>

        {analysis?.data.attributes.participation_method === 'ideation' && (
          <AutoTagOption
            tagType="controversial"
            title={formatMessage(messages.controversialTagTitle)}
            onSelect={() => onSelectMethod('controversial')}
            isDisabled={advancedAutotaggingOptionDisabled}
            isLoading={isLoading && loadingMethod === 'controversial'}
          >
            {formatMessage(messages.controversialTagDescription)}
          </AutoTagOption>
        )}

        <AutoTagOption
          tagType="language"
          title={formatMessage(messages.languageTagTitle)}
          onSelect={() => onSelectMethod('language')}
          isDisabled={advancedAutotaggingOptionDisabled}
          isLoading={isLoading && loadingMethod === 'language'}
        >
          {formatMessage(messages.languageTagDescription)}
        </AutoTagOption>
      </Box>
    </>
  );
};

export default Step1;
