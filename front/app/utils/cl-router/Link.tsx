import React from 'react';

import {
  // eslint-disable-next-line no-restricted-imports
  Link as RouterLink,
  LinkProps as NavLinkProps,
} from '@tanstack/react-router';
// eslint-disable-next-line no-restricted-imports

import useLocale from 'hooks/useLocale';

import { scrollToTop as scrollTop } from 'utils/scroll';

import updateLocationDescriptor from './updateLocationDescriptor';

export type Props = {
  to: any;
  onlyActiveOnIndex?: boolean;
  scrollToTop?: boolean;
  active?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  className?: string;
  id?: string;
  rel?: string;
} & Omit<NavLinkProps, 'onClick'>;

/*
 * This link override doesn't support url parameters, because updateLocationDescriptor doesn't parse them
 */
const Link = ({
  to,
  // onlyActiveOnIndex,
  scrollToTop,
  onClick,
  active: _active,
  ...otherProps
}: Props) => {
  const locale = useLocale();
  return (
    <RouterLink
      // end={onlyActiveOnIndex}
      to={updateLocationDescriptor(to, locale).pathname ?? '#'}
      onClick={(event) => {
        onClick && onClick(event);
        if (scrollToTop) {
          scrollTop('link');
        }
      }}
      {...otherProps}
    />
  );
};

export default Link;
