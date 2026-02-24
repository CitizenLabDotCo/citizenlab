import React from 'react';

import useLocale from 'hooks/useLocale';

import { Link as RouterLink, LinkProps as NavLinkProps } from 'utils/router';
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
} & Omit<NavLinkProps, 'onClick' | 'to'>;

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
      activeOptions={onlyActiveOnIndex ? { exact: true } : undefined}
      to={(updateLocationDescriptor(to, locale).pathname ?? '#') as any}
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
