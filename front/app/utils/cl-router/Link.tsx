import React from 'react';
// tslint:disable-next-line:no-vanilla-routing
import { NavLink as RouterLink, NavLinkProps } from 'react-router-dom';
import { LocationDescriptor } from 'history';
import updateLocationDescriptor from './updateLocationDescriptor';
import { isNilOrError } from 'utils/helperUtils';
import useLocale from 'hooks/useLocale';

export type Props = {
  to: LocationDescriptor;
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
