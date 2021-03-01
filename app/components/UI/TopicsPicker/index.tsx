import React, { memo, useCallback, MouseEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
// styles
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { darken, lighten } from 'polished';

// types
import { ITopicData } from 'services/topics';

// intl
import T from 'components/T';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// hooks
import useTopics from 'hooks/useTopics';

const TopicsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;

  ${isRtl`
    justify-content: flex-end;
  `}
`;

const TopicSwitch = styled.button`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
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
  border: solid 1px ${colors.separationDark};
  border-radius: 5px;
  transition: all 80ms ease-out;

  &:not(.selected):not(:disabled) {
    &:hover {
      color: ${({ theme }) => theme.colorSecondary};
      border-color: ${({ theme }) => theme.colorSecondary};
    }
  }

  &.selected {
    color: #fff;
    background: ${({ theme }) => theme.colorSecondary};
    border-color: ${({ theme }) => theme.colorSecondary};

    &:hover {
      background: ${({ theme }) => darken(0.15, theme.colorSecondary)};
      border-color: ${({ theme }) => darken(0.15, theme.colorSecondary)};
    }
  }

  &:disabled {
    color: ${({ theme }) => lighten(0.4, theme.colors.label)};
    border-color: ${({ theme }) => lighten(0.45, theme.colors.label)};
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
  availableTopics: ITopicData[];
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
    const selectedTopics = useTopics({ topicIds: selectedTopicIds });

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

    const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
      event.preventDefault();
    }, []);

    if (!isNilOrError(availableTopics)) {
      const numberOfSelectedTopics = selectedTopicIds.length;
      const selectedTopicNames = !isNilOrError(selectedTopics)
        ? selectedTopics
            .filter((topic) => !isNilOrError(topic))
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
              const isSelected = selectedTopicIds.includes(topic.id);

              return (
                <TopicSwitch
                  key={topic.id}
                  onClick={handleOnChange(topic.id)}
                  className={[
                    'e2e-topics-picker-item',
                    isSelected ? 'selected' : null,
                  ]
                    .filter((item) => item)
                    .join(' ')}
                  onMouseDown={removeFocus}
                  ref={index === 0 ? setRef : undefined}
                  disabled={false}
                >
                  <T value={topic.attributes.title_multiloc} />
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
