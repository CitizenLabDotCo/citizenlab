import React, { memo, useCallback, MouseEvent } from 'react';

import { fontSizes, colors, Box } from '@citizenlab/cl2-component-library';
import { isError, includes } from 'lodash-es';
import { darken } from 'polished';
import styled from 'styled-components';

import { ITopicData } from 'api/topics/types';

import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';
import injectLocalize, { InjectedLocalized } from 'utils/localize';

import InputFilterCollapsible from './InputFilterCollapsible';
import messages from './messages';

const Topics = styled.div`
  margin-top: 16px;
`;

const Topic = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
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
  border: solid 1px ${colors.divider};
  border-radius: ${(props) => props.theme.borderRadius};
  transition: all 80ms ease-out;

  &:not(.selected) {
    &:hover {
      color: ${({ theme }) => theme.colors.tenantSecondary};
      border-color: ${({ theme }) => theme.colors.tenantSecondary};
    }
  }

  &.selected {
    color: #fff;
    background: ${({ theme }) => theme.colors.tenantSecondary};
    border-color: ${({ theme }) => theme.colors.tenantSecondary};

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
}

const TopicsFilter = memo<Props & InjectedLocalized>(
  ({ topics, selectedTopicIds, onChange, className, localize }) => {
    const { formatMessage } = useIntl();

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
          title={formatMessage(messages.topicsTitle)}
          className={className}
        >
          <Box>
            <Topics className="e2e-topics-filters">
              {topics
                .filter((topic) => !isError(topic))
                .map((topic: ITopicData) => (
                  <Topic
                    key={topic.id}
                    data-id={topic.id}
                    onMouseDown={removeFocusAfterMouseClick}
                    onClick={handleOnClick}
                    className={`e2e-topic ${
                      includes(selectedTopicIds, topic.id) ? 'selected' : ''
                    }`}
                  >
                    <T value={topic.attributes.title_multiloc} />
                  </Topic>
                ))}
            </Topics>

            <ScreenReaderOnly aria-live="polite">
              {/* Pronounces numbers of selected topics + selected topic names */}
              <FormattedMessage
                {...messages.a11y_selectedTopicFilters}
                values={{ numberOfSelectedTopics, selectedTopicNames }}
              />
            </ScreenReaderOnly>
          </Box>
        </InputFilterCollapsible>
      );
    }

    return null;
  }
);

export default injectLocalize(TopicsFilter);
