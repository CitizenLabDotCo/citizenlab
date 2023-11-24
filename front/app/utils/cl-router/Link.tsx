import React from 'react';
import {
  // eslint-disable-next-line no-restricted-imports
  NavLink as RouterLink,
  NavLinkProps,
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
