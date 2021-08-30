import React from 'react';
import { NavigationItem, NavigationLabel } from './';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import { colors } from 'utils/styleUtils';
import { useTheme } from 'styled-components';

interface Props {
  onClick: () => void;
  isFullMenuOpened: boolean;
}

const ShowFullMenuButton = ({ onClick, isFullMenuOpened }: Props) => {
  const theme: any = useTheme();
  return (
    <NavigationItem>
      <Button
        height="100%"
        padding="0"
        icon="more-options"
        buttonStyle="text"
        onClick={onClick}
        textColor={isFullMenuOpened ? theme.colorMain : colors.label}
        iconColor={isFullMenuOpened ? theme.colorMain : colors.label}
      >
        <NavigationLabel>
          <FormattedMessage {...messages.showMore} />
        </NavigationLabel>
      </Button>
    </NavigationItem>
  );
};

export default ShowFullMenuButton;
