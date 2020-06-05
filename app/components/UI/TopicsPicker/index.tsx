import React, { memo, useCallback, MouseEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
// styles
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { ScreenReaderOnly } from 'utils/a11y';
import { darken, lighten } from 'polished';

// types
import { ITopicData } from 'services/topics';

// intl
import T from 'components/T';
import injectLocalize, { InjectedLocalized } from 'utils/localize';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const TopicsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 10px;
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
  value: string[];
  max: number;
  id?: string;
  className?: string;
  setRef?: (element: HTMLButtonElement) => void;
  availableTopics: ITopicData[];
}

interface Props extends InputProps {}

const TopicsPicker = memo(({ onChange, onBlur, value, localize, availableTopics, max, className, setRef }: Props & InjectedLocalized) => {
  const handleOnChange = (topicId: string) => (event) => {
    event.stopPropagation();
    event.preventDefault();
    const newTopics = [...value];
    if (!value) {
      onChange([topicId]);
    } else {
      const i = newTopics.lastIndexOf(topicId);
      if (i === -1) {
        if (value.length <= max) {
          newTopics.push(topicId);
          onChange(newTopics);
        }
      } else {
        newTopics.splice(i, 1);
        onChange(newTopics);
      }
    }
  };

  if (isNilOrError(availableTopics)) return null;

  const removeFocus = useCallback((event: MouseEvent<HTMLElement>) => {
    event.preventDefault();
  }, []);
  const numberOfSelectedTopics = value.length;
  const selectedTopics = value.map(topicId => availableTopics.find(topic => !isNilOrError(topic) && topic.id === topicId));
  const selectedTopicNames = selectedTopics && selectedTopics.map(topic => !isNilOrError(topic) && localize(topic.attributes.title_multiloc)).join(', ');

  return (
    <>
      <TopicsContainer onBlur={onBlur} className={`${className} e2e-topics-picker`}>
        {availableTopics.map((topic, index) => {
          const isActive = value && !!value.find(id => id === topic.id);
          const isDisabled = !isActive && value.length >= max;
          return (
            <TopicSwitch
              key={topic.id}
              onClick={handleOnChange(topic.id)}
              className={isActive ? 'selected' : ''}
              disabled={isDisabled}
              onMouseDown={removeFocus}
              ref={index === 0 ? setRef : undefined}
            >
              <T value={topic.attributes.title_multiloc} />
            </TopicSwitch>
          );
        })}
      </TopicsContainer>
      <ScreenReaderOnly aria-live="polite">
        <FormattedMessage {...messages.selectedTopics} values={{ numberOfSelectedTopics, selectedTopicNames }} />
      </ScreenReaderOnly>
    </>
  );
});

export default injectLocalize(TopicsPicker);
