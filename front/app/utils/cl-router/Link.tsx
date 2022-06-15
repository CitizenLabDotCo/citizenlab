import React from 'react';
// eslint-disable-next-line no-restricted-imports
import { NavLink as RouterLink, NavLinkProps } from 'react-router-dom';
// eslint-disable-next-line no-restricted-imports
import { Path } from 'history';
import updateLocationDescriptor from './updateLocationDescriptor';
import { isNilOrError } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';

export type Props = {
  to: Path | string | { pathname: string };
  onlyActiveOnIndex?: boolean;
} & NavLinkProps;

/*
 * This link override doesn't support url parameters, because updateLocationDescriptor doesn't parse them
 */
const Link = ({ to, onlyActiveOnIndex, ...otherProps }: Props) => {
  const locale = useLocale();

  return (
    <RouterLink
      end={onlyActiveOnIndex}
      to={!isNilOrError(locale) ? updateLocationDescriptor(to, locale) : '#'}
      {...otherProps}
    />
  );
};

export default Link;
