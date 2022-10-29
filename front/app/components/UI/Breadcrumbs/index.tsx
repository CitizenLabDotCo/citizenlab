import React from 'react';
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

const StyledLink = styled(Link)`
  color: ${colors.textSecondary};
  &:hover {
    border-bottom: 2px solid ${colors.textSecondary};
    color: inherit;
    margin-bottom: -2px;
  }
`;

type TBreadcrumb = {
  label: string;
  linkTo?: string;
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
      {breadcrumbs.map(({ label, linkTo }, index) => {
        const isLastBreadcrumb = index === breadcrumbs.length - 1;

        return (
          <Box
            key={label}
            display="flex"
            alignItems="center"
            color="textSecondary"
            data-cy={`breadcrumbs-${label}`}
          >
            {linkTo && (
              <Text fontSize="m" as="span">
                <StyledLink to={linkTo}>{label}</StyledLink>
              </Text>
            )}
            {!linkTo && (
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
