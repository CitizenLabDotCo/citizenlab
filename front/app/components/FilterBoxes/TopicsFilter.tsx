import React, { memo, useCallback, MouseEvent } from 'react';
import { isError, includes } from 'lodash-es';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// styling
import { ScreenReaderOnly } from 'utils/a11y';
import { fontSizes, colors, defaultCardStyle } from 'utils/styleUtils';

// components
import T from 'components/T';

// styling
import styled from 'styled-components';
import { darken } from 'polished';
import { Header, Title } from './styles';

// typings
import { ITopicData } from 'api/topics/types';

// intl
import injectLocalize, { InjectedLocalized } from 'utils/localize';

const Container = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 20px;
  padding-top: 25px;
  ${defaultCardStyle};
`;

const Topics = styled.div``;

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
        <Container className={className}>
          <Header>
            <Title>
              <FormattedMessage {...messages.topicsTitle} />
            </Title>
          </Header>

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
        </Container>
      );
    }

    return null;
  }
);

export default injectLocalize(TopicsFilter);
