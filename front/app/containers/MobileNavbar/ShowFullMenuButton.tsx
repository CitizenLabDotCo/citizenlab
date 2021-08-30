import React from 'react';
import { NavigationItem, NavigationLabel } from './';
import Button from 'components/UI/Button';
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  onClick: () => void;
}

const ShowFullMenuButton = ({ onClick }: Props) => {
  return (
    <NavigationItem>
      <Button
        height="100%"
        padding="0"
        icon="more-options"
        buttonStyle="text"
        onClick={onClick}
      >
        <NavigationLabel>
          <FormattedMessage {...messages.showMore} />
        </NavigationLabel>
      </Button>
    </NavigationItem>
  );
};

export default ShowFullMenuButton;
