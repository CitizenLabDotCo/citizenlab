import React, { useEffect, useRef } from 'react';
import {
  // eslint-disable-next-line no-restricted-imports
  NavLink as RouterLink,
  NavLinkProps,
  useLocation,
} from 'react-router-dom';
// eslint-disable-next-line no-restricted-imports
import { Path } from 'history';
import updateLocationDescriptor from './updateLocationDescriptor';
import { isNilOrError } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';
import { scrollToTop as scrollTop } from 'utils/scroll';

export type Props = {
  to: Path | string | { pathname: string };
  onlyActiveOnIndex?: boolean;
  scrollToTop?: boolean;
} & NavLinkProps;

/*
 * This link override doesn't support url parameters, because updateLocationDescriptor doesn't parse them
 */
const Link = ({ to, onlyActiveOnIndex, scrollToTop, ...otherProps }: Props) => {
  const locale = useLocale();
  const { pathname } = useLocation();
  const hasPageBeenRendered = useRef(false); // Used to prevent scrolling to top on first render

  // Scroll to top of page when pathname changes if scrollToTop is true
  useEffect(() => {
    if (scrollToTop && hasPageBeenRendered.current === true) {
      scrollTop();
      hasPageBeenRendered.current = false;
    }
    hasPageBeenRendered.current = true;
  }, [pathname, scrollToTop]);

  return (
    <RouterLink
      end={onlyActiveOnIndex}
      to={!isNilOrError(locale) ? updateLocationDescriptor(to, locale) : '#'}
      {...otherProps}
    />
  );
};

export default Link;
