import React, { memo } from 'react';
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
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// hooks
import useTopics from 'api/topics/useTopics';

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

export interface InputProps {
  onChange: (tocisIds: string[]) => void;
  onBlur?: () => void;
  selectedTopicIds: string[];
  id?: string;
  className?: string;
  setRef?: (element: HTMLButtonElement) => void;
  availableTopics: ITopicData[] | { const: string; title: string }[];
}

interface Props extends InputProps {}

const TopicsPicker = memo(
  ({
    onChange,
    onBlur,
    selectedTopicIds,
    localize,
    availableTopics,
    className,
    setRef,
  }: Props & InjectedLocalized) => {
    const { data: topics } = useTopics({});

    const filteredTopics = topics?.data.filter((topic) =>
      selectedTopicIds.includes(topic.id)
    );
    const handleOnChange = (topicId: string) => (event) => {
      event.stopPropagation();
      event.preventDefault();
      const newTopics = [...selectedTopicIds];

      if (!selectedTopicIds) {
        onChange([topicId]);
      } else {
        const i = newTopics.lastIndexOf(topicId);
        const topicNotSelectedYet = i === -1;

        if (topicNotSelectedYet) {
          newTopics.push(topicId);
        } else {
          newTopics.splice(i, 1);
        }

        onChange(newTopics);
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
          <TopicsContainer
            onBlur={onBlur}
            className={`${className} e2e-topics-picker`}
          >
            {availableTopics.map((topic, index) => {
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
                  ref={index === 0 ? setRef : undefined}
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

export default injectLocalize(TopicsPicker);
