import React, { memo, MouseEvent } from 'react';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';
// styles
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { darken, lighten } from 'polished';

// types
import { ITopicData } from 'api/topics/types';

// intl
import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// hooks
import useTopics from 'api/topics/useTopics';
import useLocalize from 'hooks/useLocalize';

const TopicsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;

  ${isRtl`
    justify-content: flex-end;
  `}
`;

const TopicSwitch = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  line-height: normal;
  text-align: left;
  display: inline-block;
  padding-left: 18px;
  padding-right: 18px;
  padding-top: 11px;
  padding-bottom: 11px;
  margin: 0px;
  margin-right: 6px;
  margin-bottom: 8px;
  cursor: pointer;
  user-select: none;
  border: solid 1px ${colors.divider};
  border-radius: 5px;
  transition: all 80ms ease-out;

  &:not(.selected):not(:disabled) {
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

  &:disabled {
    color: ${({ theme }) => lighten(0.4, theme.colors.textSecondary)};
    border-color: ${({ theme }) => lighten(0.45, theme.colors.textSecondary)};
    cursor: not-allowed;
  }
`;

export interface Props {
  onClick: (tocisIds: string[]) => void;
  selectedTopicIds: string[];
  id?: string;
  className?: string;
  availableTopics: ITopicData[] | { const: string; title: string }[];
}

const TopicsPicker = memo(
  ({ onClick, selectedTopicIds, availableTopics, className }: Props) => {
    const { data: topics } = useTopics();
    const localize = useLocalize();

    const filteredTopics = topics?.data.filter((topic) =>
      selectedTopicIds.includes(topic.id)
    );

    const handleOnChange = (topicId: string) => (event: MouseEvent) => {
      event.stopPropagation();
      event.preventDefault();
      const newTopics = [...selectedTopicIds];

      if (!selectedTopicIds) {
        onClick([topicId]);
      } else {
        const i = newTopics.lastIndexOf(topicId);
        const topicNotSelectedYet = i === -1;

        if (topicNotSelectedYet) {
          newTopics.push(topicId);
        } else {
          newTopics.splice(i, 1);
        }

        onClick(newTopics);
      }
    };

    if (!isNilOrError(availableTopics)) {
      const numberOfSelectedTopics = selectedTopicIds.length;
      const selectedTopicNames = filteredTopics
        ? filteredTopics
            .map((topic: ITopicData) =>
              localize(topic.attributes.title_multiloc)
            )
            .join(', ')
        : '';
      return (
        <>
          <TopicsContainer className={`${className} e2e-topics-picker`}>
            {availableTopics.map((topic) => {
              const topicId = topic.id || topic.const;
              const topicTitle = topic?.attributes?.title_multiloc ? (
                <T value={topic.attributes.title_multiloc} />
              ) : (
                topic.title
              );
              const isSelected = selectedTopicIds.includes(topicId);

              return (
                <TopicSwitch
                  key={topicId}
                  onClick={handleOnChange(topicId)}
                  className={[
                    'e2e-topics-picker-item',
                    isSelected ? 'selected' : null,
                  ]
                    .filter((item) => item)
                    .join(' ')}
                  onMouseDown={removeFocusAfterMouseClick}
                  disabled={false}
                >
                  {topicTitle}
                </TopicSwitch>
              );
            })}
          </TopicsContainer>
          <ScreenReaderOnly aria-live="polite">
            <FormattedMessage
              {...messages.selectedTopics}
              values={{ numberOfSelectedTopics, selectedTopicNames }}
            />
          </ScreenReaderOnly>
        </>
      );
    }

    return null;
  }
);

export default TopicsPicker;
