import useSomeFeatureFlags from 'hooks/useSomeFeatureFlags';
import React from 'react';
import { NavItem } from '.';
import MenuItem from './MenuItem';

type Props = {
  navItem: NavItem;
};

const FeaturedMenuItem = ({ navItem }: Props) => {
  return useSomeFeatureFlags({
    names: navItem.featureNames ?? [],
    onlyCheckAllowed: navItem.onlyCheckAllowed,
  }) ? (
    <MenuItem route={navItem} key={navItem.name} />
  ) : null;
};

export default FeaturedMenuItem;
