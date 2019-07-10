import React from 'react';
import styled from 'styled-components';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// styling
import { colors, fontSizes } from 'utils/styleUtils';

// components
import Button from 'components/UI/Button';
import Icon from 'components/UI/Icon';

const NoIdeasPage = styled.div`
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
    fill: ${colors.clIconAccent}
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

const NoIdeasHeader = styled.h2`
  font-size: ${fontSizes.medium}px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 5px;
`;

const NoIdeasDescription = styled.p`
  color: ${colors.adminSecondaryTextColor};
  font-weight: 400;
  font-size: ${fontSizes.small}px;
  margin-bottom: 30px;
  max-width: 450px;
`;

interface Props {
  handleSeeAllIdeas: () => void;
}

export default (props: Props) => (
  <NoIdeasPage>
    <Icon name="blankPage" />
    <NoIdeasHeader>
      <FormattedMessage {...messages.noIdeasHere} />
    </NoIdeasHeader>
    <NoIdeasDescription>
      <FormattedMessage {...messages.resetFiltersDescription} />
    </NoIdeasDescription>
    <Button
      style="cl-blue"
      circularCorners={false}
      onClick={props.handleSeeAllIdeas}
    >
      <FormattedMessage {...messages.resetFiltersButton} />
    </Button>
  </NoIdeasPage>
);
