import React from 'react';
import { NavigationItem, NavigationItemBorder, NavigationItemText } from './';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  className?: string;
  linkTo: string;
  navigationItemMessage: ReactIntl.FormattedMessage.MessageDescriptor;
  onlyActiveOnIndex?: boolean;
}

const DesktopNavbarItem = ({
  className,
  linkTo,
  navigationItemMessage,
  onlyActiveOnIndex,
}: Props) => {
  return (
    <NavigationItem
      className={className}
      to={linkTo}
      activeClassName="active"
      onlyActiveOnIndex={onlyActiveOnIndex}
    >
      <NavigationItemBorder />
      <NavigationItemText>
        <FormattedMessage {...navigationItemMessage} />
      </NavigationItemText>
    </NavigationItem>
  );
};

export default DesktopNavbarItem;
