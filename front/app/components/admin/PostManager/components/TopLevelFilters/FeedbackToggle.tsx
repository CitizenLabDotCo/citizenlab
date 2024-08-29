import React from 'react';

import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled, { css } from 'styled-components';

import CountBadge from 'components/UI/CountBadge';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

const size = 21;
const padding = 4;

const Container = styled.div`
  display: inline-block;
  display: flex;
  align-items: center;
`;

const ToggleContainer = styled.div<{ checked: boolean }>`
  height: 100%;
  display: flex;
  align-items: center;

  ${(props) =>
    props.checked &&
    css`
      i {
        padding-right: ${padding}px !important;
        padding-left: ${size}px !important;
        background: ${colors.success} !important;
      }
    `};

  input {
    display: none;
  }

  i {
    display: inline-block;
    cursor: pointer;
    padding: ${padding}px;
    padding-right: ${size}px;
    transition: all ease 0.15s;
    border-radius: ${size + padding}px;
    background: #ccc;
    transform: translate3d(0, 0, 0);

    &:before {
      display: block;
      content: '';
      width: ${size}px;
      height: ${size}px;
      border-radius: ${size}px;
      background: #fff;
    }
  }
`;

const StyledLabel = styled.label`
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  line-height: 20px;
  padding-left: 10px;
  padding-right: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
`;

interface Props {
  value: boolean;
  count: number | undefined;
  onChange: (feedbackNeeded: boolean | undefined) => void;
}

const FeedbackToggle = ({ onChange, value, count }: Props) => {
  const handleOnClick = () => {
    // If the value is true, we want to set it to undefined, so that the filter is removed
    // If it's undefined, we want to set it to true, so that the filter is added
    onChange(!value || undefined);
  };

  return (
    <Container
      id="e2e-feedback_needed_filter_toggle"
      className="feedback_needed_filter_toggle"
    >
      <ToggleContainer onClick={handleOnClick} checked={value}>
        <input type="checkbox" role="checkbox" aria-checked={value} />
        <i />
      </ToggleContainer>
      <StyledLabel onClick={handleOnClick}>
        <FormattedMessage {...messages.inputsNeedFeedbackToggle} />
        {typeof count === 'number' && <CountBadge count={count} />}
      </StyledLabel>
    </Container>
  );
};

export default FeedbackToggle;
