import React, { useCallback, MouseEvent, memo, useState } from 'react';

import {
  fontSizes,
  colors,
  Box,
  isRtl,
  Button,
  Text,
} from '@citizenlab/cl2-component-library';
import { includes, get } from 'lodash-es';
import { darken } from 'polished';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { IInputTopicData } from 'api/input_topics/types';

import useLocalize from 'hooks/useLocalize';

import { ScreenReaderOnly } from 'utils/a11y';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { removeFocusAfterMouseClick } from 'utils/helperUtils';

import InputFilterCollapsible from './InputFilterCollapsible';
import messages from './messages';
import tracks from './tracks';
import { FilterCounts } from './types';
import {
  getSelectedTopicNames,
  getTopicsWithIdeas,
  scrollToTopIdeasList,
} from './utils';

const Topic = styled.button<{ selected: boolean | undefined }>`
  color: ${({ selected }) => (selected ? colors.white : colors.textPrimary)};
  font-size: ${fontSizes.base}px;
  display: flex;
  width: 100%;
  justify-content: space-between;
  line-height: normal;
  padding: 8px 14px;
  margin: 0px;
  margin-right: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  user-select: none;
  border: solid 1px transparent;
  border-radius: ${(props) => props.theme.borderRadius};
  transition: all 80ms ease-out;
  word-break: break-word;
  text-align: left;

  ${isRtl`
      text-align: right;
      direction: rtl;
  `}

  &:not(.selected):hover {
    background: ${({ theme }) => theme.colors.grey200};
  }

  &.selected {
    color: #fff;
    background: ${({ theme }) => theme.colors.tenantPrimary};

    &:hover {
      background: ${({ theme }) => darken(0.15, theme.colors.tenantPrimary)};
    }
  }
`;

const Count = styled.span`
  // Prevents the count from breaking into multiple lines
  // when the topic title is too long.
  // Given the filter boxes keep their width,
  // flex-shrink: 0 is not needed.
  white-space: nowrap;
`;

interface Props {
  topics?: IInputTopicData[];
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
        scrollToTopIdeasList();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [selectedTopicIds]
    );

    const selectedTopics = topics?.filter((topic) =>
      includes(selectedTopicIds, topic.id)
    );
    const numberOfSelectedTopics = selectedTopics?.length;
    const selectedTopicNames =
      selectedTopics && getSelectedTopicNames(selectedTopics, localize);

    const topicsWithIdeas = topics && getTopicsWithIdeas(topics, filterCounts);

    return (
      <InputFilterCollapsible
        title={
          localize(customTopicsTerm) || formatMessage(messages.topicsTitle)
        }
        className={className}
      >
        {!topicsWithIdeas || topicsWithIdeas.length < 1 ? (
          <Box display="flex" justifyContent="center">
            <Text color="textSecondary">
              {formatMessage(messages.noValuesFound)}
            </Text>
          </Box>
        ) : (
          <Box>
            <Box
              className="e2e-topics-filters"
              aria-live="polite"
              id="e2e-topics-filters"
            >
              {topicsWithIdeas
                .slice(0, showFullList ? undefined : 5) // We show only 5 topics by default with a "Show all" button.
                .map((topic: IInputTopicData) => {
                  const postCount = get(
                    filterCounts,
                    `input_topic_id.${topic.id}`,
                    0
                  );

                  const topicSelected = selectedTopicIds?.includes(topic.id);

                  return (
                    <Topic
                      key={topic.id}
                      data-id={topic.id}
                      onMouseDown={removeFocusAfterMouseClick}
                      onClick={handleOnClick}
                      className={`e2e-topic ${topicSelected ? 'selected' : ''}`}
                      selected={topicSelected}
                    >
                      <Box as="span" mr="8px">
                        {localize(topic.attributes.full_title_multiloc)}
                      </Box>
                      <Count aria-hidden>{postCount}</Count>
                      <ScreenReaderOnly>
                        {`${postCount} ${formatMessage(messages.inputs)}`}
                      </ScreenReaderOnly>
                    </Topic>
                  );
                })}
            </Box>
            {topicsWithIdeas.length > 5 && (
              <Button
                onClick={() => {
                  if (!showFullList) {
                    trackEventByName(tracks.seeAllTags);
                  }
                  setShowFullList((curentValue) => !curentValue);
                }}
                buttonStyle="text"
                p="0px"
                mt="12px"
                fontSize="s"
              >
                {formatMessage(
                  showFullList
                    ? messages.showLess
                    : messages.showTagsWithNumber,
                  {
                    numberTags: topicsWithIdeas.length,
                  }
                )}
              </Button>
            )}

            <ScreenReaderOnly aria-live="polite">
              {/* Pronounces numbers of selected topics + selected topic names */}
              <FormattedMessage
                {...messages.a11y_selectedTopicFilters}
                values={{ numberOfSelectedTopics, selectedTopicNames }}
              />
            </ScreenReaderOnly>
          </Box>
        )}

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
);

export default TopicsFilter;
