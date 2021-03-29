import React, { memo } from 'react';
import styled from 'styled-components';

import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { Icon } from 'cl2-component-library';
import { colors, fontSizes } from 'utils/styleUtils';

const NoUsersPage = styled.div`
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  font-size: ${fontSizes.xl}px;
  font-weight: bold;
  line-height: 25px;
  padding-top: 80px;
  svg {
    margin-bottom: 20px;
    height: 70px;
    fill: ${colors.clIconAccent};
  }
`;

interface Props {
  reason: 'noIdeas' | 'projectSelection';
}

const NoUsers = memo(({ reason }: Props) => {
  if (reason === 'noIdeas') {
    return (
      <NoUsersPage>
        <Icon name="search" />
        <FormattedMessage {...messages.noInputInThisProject} />
      </NoUsersPage>
    );
  }

  return (
    <NoUsersPage>
      <Icon name="blankPage" />
      <FormattedMessage {...messages.pickInputCollection} />
    </NoUsersPage>
  );
});

export default NoUsers;
