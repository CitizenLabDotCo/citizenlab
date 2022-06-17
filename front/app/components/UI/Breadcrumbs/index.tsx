import React from 'react';
import { colors } from 'utils/styleUtils';

// components
import { Box, Text } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

// types
type SingleBreadcrumbProps = {
  label: string;
  linkTo?: string;
  isCurrentPage?: boolean;
};

type BreadcrumbsProps = {
  breadcrumbs: SingleBreadcrumbProps[];
};

const SingleBreadcrumb = ({
  label,
  linkTo,
  isCurrentPage = false,
}: SingleBreadcrumbProps) => {
  const SingleBreadcrumbWrapper = ({ children }) => {
    return (
      <Box display="inline">
        <Text color="adminSecondaryTextColor" as="span" fontSize="m">
          {children}
        </Text>
      </Box>
    );
  };

  const Divider = () => {
    return (
      <Box display="inline" mr="16px" ml="16px">
        <Text color="adminSecondaryTextColor" as="span" fontSize="m">
          /
        </Text>
      </Box>
    );
  };

  if (linkTo) {
    return (
      <SingleBreadcrumbWrapper>
        <Box
          display="inline-block"
          borderBottom={`2px solid ${colors.adminSecondaryTextColor}`}
        >
          <Link
            style={{
              color: colors.adminSecondaryTextColor,
            }}
            to={linkTo}
          >
            {label}
          </Link>
        </Box>
        <Divider />
      </SingleBreadcrumbWrapper>
    );
  }

  return (
    <SingleBreadcrumbWrapper>
      {label}
      {!isCurrentPage && <Divider />}
    </SingleBreadcrumbWrapper>
  );
};

const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  return (
    <>
      {breadcrumbs.map(({ label, linkTo }, index) => {
        return (
          <SingleBreadcrumb
            key={label}
            label={label}
            linkTo={linkTo}
            isCurrentPage={index === breadcrumbs.length - 1}
          />
        );
      })}
    </>
  );
};

export default Breadcrumbs;
