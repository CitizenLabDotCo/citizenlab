import React from 'react';
import styled from 'styled-components';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import { colors, fontSizes } from 'utils/styleUtils';

// components
import Button from 'components/UI/Button';
import { Icon } from 'cl2-component-library';
import { ManagerType } from '../..';

export const NoPostPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  line-height: 25px;
  padding: 100px 0;
  width: 100%;

  border: 1px solid ${colors.separation};
  svg {
    margin-bottom: 20px;
    height: 50px;
    fill: ${colors.clIconAccent};
  }

  transition: all 200ms ease;
  overflow: hidden;

  &.fade-enter {
    opacity: 0;

    &.fade-enter-active {
      opacity: 1;
    }
  }

  &.fade-enter-done {
    opacity: 1;
  }

  &.fade-exit {
    opacity: 1;

    &.fade-exit-active {
      opacity: 0;
    }
  }

  &.fade-exit-done {
    display: none;
  }
`;

export const NoPostHeader = styled.h2`
  font-size: ${fontSizes.medium}px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 5px;
`;

export const NoPostDescription = styled.p`
  color: ${colors.adminSecondaryTextColor};
  font-weight: 400;
  font-size: ${fontSizes.small}px;
  margin-bottom: 30px;
  max-width: 450px;
`;

interface Props {
  type: ManagerType;
  handleSeeAll: () => void;
}

export default (props: Props) => (
  <NoPostPage>
    <Icon name="blankPage" />
    <NoPostHeader>
      {props.type === 'Initiatives' ? (
        <FormattedMessage {...messages.noInitiativesHere} />
      ) : (
        <FormattedMessage {...messages.noFilteredResults} />
      )}
    </NoPostHeader>
    <NoPostDescription>
      <FormattedMessage {...messages.resetInputFiltersDescription} />
    </NoPostDescription>
    <Button buttonStyle="cl-blue" onClick={props.handleSeeAll}>
      <FormattedMessage {...messages.resetFiltersButton} />
    </Button>
  </NoPostPage>
);
