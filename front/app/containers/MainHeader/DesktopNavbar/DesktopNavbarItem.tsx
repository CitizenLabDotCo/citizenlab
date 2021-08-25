import React from 'react';
import { NavigationItem, NavigationItemBorder, NavigationItemText } from './';
import { FormattedMessage } from 'utils/cl-intl';

interface Props {
  className?: string;
  linkTo: string;
  navigationItemText: ReactIntl.FormattedMessage.MessageDescriptor;
  onlyActiveOnIndex?: boolean;
}

const DesktopNavbarItem = ({
  className,
  linkTo,
  navigationItemText,
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
        <FormattedMessage {...navigationItemText} />
      </NavigationItemText>
    </NavigationItem>
  );
};

export default DesktopNavbarItem;
