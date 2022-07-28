import React from 'react';
import { colors } from 'utils/styleUtils';
import styled from 'styled-components';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

const StyledLink = styled(Link)`
  color: ${colors.label};
  &:hover {
    border-bottom: 2px solid ${colors.label};
    color: inherit;
    margin-bottom: -2px;
  }
`;

interface Props {
  breadcrumbs: {
    label: string;
    linkTo?: string;
  }[];
}

const Breadcrumbs = ({ breadcrumbs }: Props) => {
  if (!breadcrumbs || breadcrumbs.length === 0) {
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
            color="label"
            data-cy={`breadcrumbs-${label}`}
          >
            {linkTo && (
              <Text fontSize="m" as="span">
                <StyledLink to={linkTo}>{label}</StyledLink>
              </Text>
            )}
            {!linkTo && (
              <Text color="label" fontSize="m" as="span">
                {label}
              </Text>
            )}
            {!isLastBreadcrumb && (
              <Text
                color="separationDark"
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
