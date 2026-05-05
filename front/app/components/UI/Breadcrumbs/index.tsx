import React from 'react';

import { Box, Text, colors } from '@citizenlab/cl2-component-library';

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

interface Props {
  breadcrumbs: TBreadcrumbs;
}

const Breadcrumbs = ({ breadcrumbs }: Props) => {
  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Box display="flex">
      {breadcrumbs.map(({ label, link }, index) => {
        const isLastBreadcrumb = index === breadcrumbs.length - 1;

        return (
          <Box
            key={label}
            display="flex"
            alignItems="center"
            color="textSecondary"
            data-cy={`breadcrumbs-${label}`}
          >
            {link && (
              <Text fontSize="m" as="span">
                <StyledLink
                  to={link.to}
                  params={link.params}
                  search={link.search}
                >
                  {label}
                </StyledLink>
              </Text>
            )}
            {!link && (
              <Text color="textSecondary" fontSize="m" as="span">
                {label}
              </Text>
            )}
            {!isLastBreadcrumb && (
              <Text
                color="borderDark"
                ml="16px"
                as="span"
                mr="16px"
                fontSize="m"
              >
                /
              </Text>
            )}
          </Box>
        );
      })}
    </Box>
  );
};

export default Breadcrumbs;
