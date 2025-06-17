import React from 'react';

import { Icon, colors, fontSizes } from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';

export const NoPostPage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  line-height: 25px;
  padding: 100px 0;
  width: 100%;

  border: 1px solid ${colors.divider};
  svg {
    margin-bottom: 20px;
    height: 50px;
    fill: ${colors.teal400};
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
  font-size: ${fontSizes.m}px;
  font-weight: 600;
  margin-top: 0;
  margin-bottom: 5px;
`;

export const NoPostDescription = styled.p`
  color: ${colors.textSecondary};
  font-weight: 400;
  font-size: ${fontSizes.s}px;
  margin-bottom: 30px;
  max-width: 450px;
`;

interface Props {
  handleSeeAll: () => void;
}

export default (props: Props) => (
  <NoPostPage>
    <Icon name="sidebar-pages-menu" />
    <NoPostHeader>
      <FormattedMessage {...messages.noFilteredResults} />
    </NoPostHeader>
    <NoPostDescription>
      <FormattedMessage {...messages.resetInputFiltersDescription} />
    </NoPostDescription>
    <ButtonWithLink buttonStyle="admin-dark" onClick={props.handleSeeAll}>
      <FormattedMessage {...messages.resetFiltersButton} />
    </ButtonWithLink>
  </NoPostPage>
);
