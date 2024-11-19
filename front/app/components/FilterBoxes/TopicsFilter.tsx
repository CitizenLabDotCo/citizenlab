import React, { useCallback, MouseEvent, memo, useState } from 'react';

import {
  fontSizes,
  colors,
  Box,
  Text,
  isRtl,
  Button,
} from '@citizenlab/cl2-component-library';
import { isError, includes, get } from 'lodash-es';
import { darken } from 'polished';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { ITopicData } from 'api/topics/types';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import {
  isNil,
  isNilOrError,
  removeFocusAfterMouseClick,
} from 'utils/helperUtils';

import InputFilterCollapsible from './InputFilterCollapsible';
import messages from './messages';
import { FilterCounts } from './types';

const Topic = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  display: flex;
  width: 100%;
  justify-content: space-between;
  line-height: normal;
  display: inline-block;
  padding-left: 14px;
  padding-right: 14px;
  padding-top: 8px;
  padding-bottom: 8px;
  margin: 0px;
  margin-right: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  user-select: none;
  border: solid 1px transparent;
  border-radius: ${(props) => props.theme.borderRadius};
  transition: all 80ms ease-out;

  ${isRtl`
        text-align: right;
        direction: rtl;
    `}

  &:not(.selected) {
    &:hover {
      color: ${({ theme }) => theme.colors.tenantPrimary};
      border-color: ${({ theme }) => theme.colors.tenantPrimary};
    }
  }

  &.selected {
    color: #fff;
    background: ${({ theme }) => theme.colors.tenantPrimary};
    border-color: ${({ theme }) => theme.colors.tenantPrimary};

    &:hover {
      background: ${({ theme }) => darken(0.15, theme.colors.tenantSecondary)};
      border-color: ${({ theme }) =>
        darken(0.15, theme.colors.tenantSecondary)};
    }
  }
`;

interface Props {
  topics: ITopicData[];
  selectedTopicIds: string[] | null | undefined;
  onChange: (arg: string[] | null) => void;
  className?: string;
  filterCounts?: FilterCounts;
}

const TopicsFilter = memo<Props>(
  ({ topics, selectedTopicIds, filterCounts, onChange, className }) => {
    const localize = useLocalize();
    const { formatMessage } = useIntl();
    const { data: appConfig } = useAppConfiguration();

    const [showFullList, setShowFullList] = useState(false);

    const customTopicsTerm =
      appConfig?.data.attributes.settings.core.topics_term;

    const handleOnClick = useCallback(
      (event: MouseEvent<HTMLElement>) => {
        const topicId = event.currentTarget.dataset.id as string;
        let output: string[] = [];

        if (selectedTopicIds && includes(selectedTopicIds, topicId)) {
          output = selectedTopicIds.filter(
            (selectedTopicId) => selectedTopicId !== topicId
          );
        } else {
          output = [...(selectedTopicIds || []), topicId];
        }

        onChange(output.length > 0 ? output : null);
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [selectedTopicIds]
    );

    if (!isNilOrError(topics) && topics.length > 0) {
      const selectedTopics = topics.filter((topic) =>
        includes(selectedTopicIds, topic.id)
      );
      const numberOfSelectedTopics = selectedTopics.length;
      const selectedTopicNames = selectedTopics
        .map((topic) => {
          return (
            !isNilOrError(topic) && localize(topic.attributes.title_multiloc)
          );
        })
        .join(', ');

      return (
        <InputFilterCollapsible
          title={
            customTopicsTerm
              ? localize(customTopicsTerm)
              : formatMessage(messages.topicsTitle)
          }
          className={className}
        >
          <Box>
            <Box className="e2e-topics-filters">
              {topics
                .filter((topic) => !isError(topic))
                .map((topic: ITopicData, index) => {
                  const filterPostCount = get(
                    filterCounts,
                    `topic_id.${topic.id}`,
                    0
                  );

                  const topicSelected = selectedTopicIds?.includes(topic.id);

                  if (
                    (filterPostCount === 0 &&
                      (isNil(selectedTopicIds) ||
                        selectedTopicIds.length === 0)) ||
                    (!showFullList && index > 5)
                  ) {
                    return null;
                  }

                  return (
                    <Topic
                      key={topic.id}
                      data-id={topic.id}
                      onMouseDown={removeFocusAfterMouseClick}
                      onClick={handleOnClick}
                      className={`e2e-topic ${topicSelected ? 'selected' : ''}`}
                      style={{ display: 'flex' }}
                    >
                      <Box maxWidth="90%">
                        <Text
                          fontSize="s"
                          m="0px"
                          color={topicSelected ? 'white' : 'textPrimary'}
                          wordBreak="break-word"
                        >
                          <T value={topic.attributes.title_multiloc} />
                        </Text>
                      </Box>

                      <Box>{filterPostCount}</Box>
                    </Topic>
                  );
                })}
            </Box>
            <Button
              onClick={() => {
                setShowFullList((curentValue) => !curentValue);
              }}
              buttonStyle="text"
              p="0px"
              mt="12px"
              fontSize="s"
              style={{ alignContent: 'right' }}
              aria-label={
                showFullList
                  ? `${formatMessage(messages.showAllNumberTags, {
                      numberTags: topics.length,
                    })}`
                  : formatMessage(messages.showFewerTags)
              }
            >
              {showFullList
                ? formatMessage(messages.showLess)
                : `${formatMessage(messages.showAll)} (${topics.length})`}
            </Button>

            <ScreenReaderOnly aria-live="polite">
              {/* Pronounces numbers of selected topics + selected topic names */}
              <FormattedMessage
                {...messages.a11y_selectedTopicFilters}
                values={{ numberOfSelectedTopics, selectedTopicNames }}
              />
            </ScreenReaderOnly>
          </Box>
          <ScreenReaderOnly aria-live="polite">
            {/* Pronounces numbers of selected topics + selected topic names */}
            <FormattedMessage
              {...messages.a11y_selectedTopicFilters}
              values={{ numberOfSelectedTopics, selectedTopicNames }}
            />
          </ScreenReaderOnly>
        </InputFilterCollapsible>
      );
    }

    return null;
  }
);

export default TopicsFilter;
