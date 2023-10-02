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
import messages from '../messages';
import { useIntl } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';
import useAnalysis from 'api/analyses/useAnalysis';

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
        <Tag tagType={tagType} name="&nbsp;" />
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
  const { analysisId } = useParams() as { analysisId: string };
  const { data: analysis } = useAnalysis(analysisId);

  const { formatMessage } = useIntl();
  return (
    <>
      <Title mb="32px">
        <Icon name="flash" height="32px" width="32px" />{' '}
        {formatMessage(messages.autoTagTitle)}
      </Title>
      <Text mb="32px">{formatMessage(messages.autoTagDescription)}</Text>

      <Title variant="h4">{formatMessage(messages.whatToTag)}</Title>

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
            <Label>{formatMessage(messages.allInput)}</Label>
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
              <Label>{formatMessage(messages.useCurrentFilters)}</Label>
              {isEmpty(filters) && (
                <Text fontSize="s" m="0">
                  {formatMessage(messages.noActiveFilters)}
                </Text>
              )}
            </Box>
          </Box>
          <FilterItems filters={filters} isEditable={false} />
        </AutoTagTargetContainer>
      </Box>

      <Title variant="h4">{formatMessage(messages.howToTag)}</Title>

      <Box
        display="flex"
        flexDirection="column"
        gap="16px"
        opacity={isLoading ? 0.5 : undefined}
      >
        <AutoTagOption
          tagType="nlp_topic"
          title={formatMessage(messages.fullyAutomatedTitle)}
          onSelect={() => onSelectMethod('nlp_topic')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'nlp_topic'}
          tooltip={formatMessage(messages.fullyAutomatedTooltip)}
        >
          {formatMessage(messages.fullyAutomatedDescription)}
        </AutoTagOption>

        <AutoTagOption
          tagType="custom"
          title={formatMessage(messages.classificationByLabelTitle)}
          onSelect={() => onSelectMethod('label_classification')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'label_classification'}
          tooltip={formatMessage(messages.classificationByLabelTooltip)}
        >
          {formatMessage(messages.classificationByLabelDescription)}
        </AutoTagOption>

        <AutoTagOption
          tagType="custom"
          title={formatMessage(messages.classificationByExampleTitle)}
          onSelect={() => onSelectMethod('few_shot_classification')}
          disabled={isLoading}
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
            disabled={isLoading}
            isLoading={isLoading && loadingMethod === 'platform_topic'}
          >
            {formatMessage(messages.platformTagsDescription)}
          </AutoTagOption>
        )}

        <AutoTagOption
          tagType="sentiment"
          title={formatMessage(messages.sentimentTagTitle)}
          onSelect={() => onSelectMethod('sentiment')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'sentiment'}
        >
          {formatMessage(messages.sentimentTagDescription)}
        </AutoTagOption>

        {analysis?.data.attributes.participation_method === 'ideation' && (
          <AutoTagOption
            tagType="controversial"
            title={formatMessage(messages.controversialTagTitle)}
            onSelect={() => onSelectMethod('controversial')}
            disabled={isLoading}
            isLoading={isLoading && loadingMethod === 'controversial'}
          >
            {formatMessage(messages.controversialTagDescription)}
          </AutoTagOption>
        )}

        <AutoTagOption
          tagType="language"
          title={formatMessage(messages.languageTagTitle)}
          onSelect={() => onSelectMethod('language')}
          disabled={isLoading}
          isLoading={isLoading && loadingMethod === 'language'}
        >
          {formatMessage(messages.languageTagDescription)}
        </AutoTagOption>
      </Box>
    </>
  );
};

export default Step1;
