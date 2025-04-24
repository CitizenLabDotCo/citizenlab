import React from 'react';

import {
  Box,
  Title,
  Text,
  colors,
  Icon,
  Label,
  Radio,
} from '@citizenlab/cl2-component-library';
import { isEmpty } from 'lodash-es';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';

import useAnalysis from 'api/analyses/useAnalysis';
import { AutoTaggingMethod } from 'api/analysis_background_tasks/types';
import { IInputsFilterParams } from 'api/analysis_inputs/types';
import useInfiniteAnalysisInputs from 'api/analysis_inputs/useInfiniteAnalysisInputs';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { useIntl } from 'utils/cl-intl';
import { getMethodConfig } from 'utils/configs/participationMethodConfig';

import messages from '../messages';

import AutoTagOption from './AutoTagOption';

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
  const analysisEnabled = useFeatureFlag({
    name: 'analysis',
    onlyCheckAllowed: true,
  });
  const advancedAutotaggingAllowed = useFeatureFlag({
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
  const method =
    analysis && getMethodConfig(analysis.data.attributes.participation_method);
  const allInputsCount = allInputs?.pages[0].meta.filtered_count;
  const filteredInputsCount = filteredInputs?.pages[0].meta.filtered_count;
  const { formatMessage } = useIntl();

  return (
    <>
      <Title mb="32px">
        <Icon name="stars" height="32px" width="32px" mr="4px" />
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
          isDisabled={!advancedAutotaggingAllowed}
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
          isDisabled={!analysisEnabled}
          isLoading={isLoading && loadingMethod === 'label_classification'}
          tooltip={formatMessage(messages.classificationByLabelTooltip)}
        >
          {formatMessage(messages.classificationByLabelDescription)}
        </AutoTagOption>
        <AutoTagOption
          tagType="custom"
          title={formatMessage(messages.classificationByExampleTitle)}
          onSelect={() => onSelectMethod('few_shot_classification')}
          isDisabled={!advancedAutotaggingAllowed}
          isLoading={isLoading && loadingMethod === 'few_shot_classification'}
          tooltip={formatMessage(messages.classificationByExampleTooltip)}
        >
          {formatMessage(messages.classificationByExampleDescription)}
        </AutoTagOption>
        {method?.supportsTopicsCustomField && (
          <AutoTagOption
            tagType="platform_topic"
            title={formatMessage(messages.platformTagsTitle)}
            onSelect={() => onSelectMethod('platform_topic')}
            isDisabled={!advancedAutotaggingAllowed}
            isLoading={isLoading && loadingMethod === 'platform_topic'}
          >
            {formatMessage(messages.platformTagsDescription)}
          </AutoTagOption>
        )}
        <AutoTagOption
          tagType="sentiment"
          title={formatMessage(messages.sentimentTagTitle)}
          onSelect={() => onSelectMethod('sentiment')}
          isDisabled={!advancedAutotaggingAllowed}
          isLoading={isLoading && loadingMethod === 'sentiment'}
        >
          {formatMessage(messages.sentimentTagDescription)}
        </AutoTagOption>
        {method?.supportsReactions && (
          <AutoTagOption
            tagType="controversial"
            title={formatMessage(messages.controversialTagTitle)}
            onSelect={() => onSelectMethod('controversial')}
            isDisabled={!advancedAutotaggingAllowed}
            isLoading={isLoading && loadingMethod === 'controversial'}
          >
            {formatMessage(messages.controversialTagDescription)}
          </AutoTagOption>
        )}
        <AutoTagOption
          tagType="language"
          title={formatMessage(messages.languageTagTitle)}
          onSelect={() => onSelectMethod('language')}
          isDisabled={!advancedAutotaggingAllowed}
          isLoading={isLoading && loadingMethod === 'language'}
        >
          {formatMessage(messages.languageTagDescription)}
        </AutoTagOption>
      </Box>
    </>
  );
};

export default Step1;
