import React from 'react';

// eslint-disable-next-line no-restricted-imports
import { Path } from 'history';
import {
  // eslint-disable-next-line no-restricted-imports
  NavLink as RouterLink,
  NavLinkProps,
} from 'react-router-dom';
import { RouteType } from 'routes';

import useLocale from 'hooks/useLocale';

import { isNilOrError } from 'utils/helperUtils';
import { scrollToTop as scrollTop } from 'utils/scroll';

import updateLocationDescriptor from './updateLocationDescriptor';

export type Props = {
  to: Path | RouteType | { pathname: string };
  onlyActiveOnIndex?: boolean;
  scrollToTop?: boolean;
  active?: boolean;
  onClick?: (event: React.MouseEvent) => void;
} & Omit<NavLinkProps, 'onClick'>;

/*
 * This link override doesn't support url parameters, because updateLocationDescriptor doesn't parse them
 */
const Link = ({
  to,
  onlyActiveOnIndex,
  scrollToTop,
  onClick,
  active: _active,
  ...otherProps
}: Props) => {
  const locale = useLocale();
  return (
    <RouterLink
      end={onlyActiveOnIndex}
      to={!isNilOrError(locale) ? updateLocationDescriptor(to, locale) : '#'}
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
