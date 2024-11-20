import React, { useCallback, MouseEvent, memo, useState } from 'react';

import {
  fontSizes,
  colors,
  Box,
  isRtl,
  Button,
} from '@citizenlab/cl2-component-library';
import { includes, get } from 'lodash-es';
import { darken } from 'polished';
import styled from 'styled-components';

import useAppConfiguration from 'api/app_configuration/useAppConfiguration';
import { ITopicData } from 'api/topics/types';

import useLocalize from 'hooks/useLocalize';

import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

import InputFilterCollapsible from './InputFilterCollapsible';
import messages from './messages';
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
        scrollToTopIdeasList();
      },
      // eslint-disable-next-line react-hooks/exhaustive-deps
      [selectedTopicIds]
    );

    if (!isNilOrError(topics) && topics.length > 0) {
      const selectedTopics = topics.filter((topic) =>
        includes(selectedTopicIds, topic.id)
      );
      const numberOfSelectedTopics = selectedTopics.length;
      const selectedTopicNames = getSelectedTopicNames(
        selectedTopics,
        localize
      );

      const topicsWithIdeas = getTopicsWithIdeas(topics, filterCounts);

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
            <Box className="e2e-topics-filters" aria-live="polite">
              {topicsWithIdeas
                .slice(0, showFullList ? undefined : 5) // We show only 5 topics by default with a "Show all" button.
                .map((topic: ITopicData) => {
                  const postCount = get(
                    filterCounts,
                    `topic_id.${topic.id}`,
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
                      <T value={topic.attributes.title_multiloc} />
                      <Box aria-hidden>{postCount}</Box>
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
