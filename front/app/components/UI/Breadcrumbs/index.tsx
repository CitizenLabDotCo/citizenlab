import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  colors,
  isRtl,
} from '@citizenlab/cl2-component-library';
import styled from 'styled-components';

import Link, { typedStyled, type WrapperTo } from 'utils/cl-router/Link';

const StyledLink = typedStyled(Link)`
  color: ${colors.textSecondary};
  &:hover {
    border-bottom: 2px solid ${colors.textSecondary};
    color: inherit;
    margin-bottom: -2px;
  }
`;

type TBreadcrumbLink = {
  to: WrapperTo;
  params?: Record<string, string>;
  search?: Record<string, unknown>;
};

type TBreadcrumb = {
  label: string;
  link?: TBreadcrumbLink;
};

export type TBreadcrumbs = TBreadcrumb[];

// The current page heading keeps the type it has always had here.
const HeadingCrumb = styled.span`
  font-size: 14px;
  font-weight: 500;
  line-height: 1.4;
  color: #1e1e1e;
  margin: 0;
  ${isRtl`direction: rtl;`}
`;

interface Props {
  breadcrumbs: TBreadcrumbs;
  icon?: IconNames;
  separator?: 'slash' | 'chevron';
  fontSize?: 's' | 'm';
  highlightCurrentPage?: boolean;
}

const Breadcrumbs = ({
  breadcrumbs,
  icon,
  separator = 'slash',
  fontSize = 'm',
  highlightCurrentPage = false,
}: Props) => {
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Box display="flex" alignItems="center" minWidth="0">
      {icon && (
        <Icon
          name={icon}
          width="18px"
          height="18px"
          fill={colors.coolGrey500}
          mr="8px"
        />
      )}
      {breadcrumbs.map(({ label, link }, index) => {
        const isLastBreadcrumb = index === breadcrumbs.length - 1;
        const isHeading = highlightCurrentPage && isLastBreadcrumb && !link;

        return (
          <Box
            key={label}
            display="flex"
            alignItems="center"
            minWidth={isLastBreadcrumb ? '0' : undefined}
            color="textSecondary"
            data-cy={`breadcrumbs-${label}`}
          >
            {link && (
              <Text fontSize={fontSize} as="span" mb="0">
                <StyledLink
                  to={link.to}
                  params={link.params}
                  search={link.search}
                >
                  {label}
                </StyledLink>
              </Text>
            )}
            {!link && !isHeading && (
              <Text color="textSecondary" fontSize={fontSize} as="span" mb="0">
                {label}
              </Text>
            )}
            {isHeading && <HeadingCrumb>{label}</HeadingCrumb>}
            {!isLastBreadcrumb &&
              (separator === 'chevron' ? (
                <Icon
                  name="chevron-right"
                  width="16px"
                  height="16px"
                  fill={colors.coolGrey500}
                  m="0 8px"
                />
              ) : (
                <Text
                  color="borderDark"
                  ml="16px"
                  as="span"
                  mr="16px"
                  fontSize={fontSize}
                  mb="0"
                >
                  /
                </Text>
              ))}
          </Box>
        );
      })}
    </Box>
  );
};

export default Breadcrumbs;
