import React from 'react';
import styled from 'styled-components';
import {
  NavigationItem,
  NavigationLabel,
  NavigationItemContentStyles,
} from './';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  onClick: () => void;
}

const StyledButton = styled(Button)`
  ${NavigationItemContentStyles}
`;

const ShowFullMenuButton = ({ onClick }: Props) => {
  return (
    <NavigationItem>
      <StyledButton icon="more-options" buttonStyle="text" onClick={onClick}>
        <NavigationLabel>
          <FormattedMessage {...messages.showMore} />
        </NavigationLabel>
      </StyledButton>
    </NavigationItem>
  );
};

export default ShowFullMenuButton;
