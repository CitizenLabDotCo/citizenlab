import React from 'react';
import { Box, Text } from '@citizenlab/cl2-component-library';
import Link from 'utils/cl-router/Link';

interface SingleBreadcrumbProps {
  label: string;
  linkTo?: string;
  isCurrentPage?: boolean;
}

interface BreadcrumbsProps {
  breadcrumbs: SingleBreadcrumbProps[];
}

const SingleBreadcrumb = ({
  label,
  linkTo,
  isCurrentPage,
}: SingleBreadcrumbProps) => {
  const Divider = () => {
    return (
      <Box display="inline" mr="16px" ml="16px">
        /
      </Box>
    );
  };

  if (isCurrentPage) {
    return (
      <Box display="inline">
        <Text color="adminTextColor" as="span" fontSize="m">
          {label}
        </Text>
      </Box>
    );
  }

  if (linkTo) {
    return (
      <Box display="inline">
        <Box display="inline-block" pb="4px" borderBottom="1px solid gray">
          <Text color="adminTextColor" as="span" fontSize="m">
            <Link color="adminTextColor" to={linkTo}>
              {label}
            </Link>
          </Text>
        </Box>
        <Divider />
      </Box>
    );
  }

  return (
    <Box display="inline">
      <Text color="adminTextColor" as="span" fontSize="m">
        {label}
      </Text>
      {!isCurrentPage && <Divider />}
    </Box>
  );
};

const BreadcrumbsContainer = ({ children }) => {
  return (
    <Box display="flex" flexDirection="row">
      {children}
    </Box>
  );
};

const Breadcrumbs = ({ breadcrumbs }: BreadcrumbsProps) => {
  if (!breadcrumbs || breadcrumbs.length === 0) {
    return null;
  }

  if (breadcrumbs.length === 1) {
    const [onlyBreadcrumb] = breadcrumbs;
    return (
      <BreadcrumbsContainer>
        <SingleBreadcrumb label={onlyBreadcrumb.label} isCurrentPage={true} />
      </BreadcrumbsContainer>
    );
  }

  return (
    <>
      {breadcrumbs.map(({ label, linkTo }, index) => {
        return (
          <SingleBreadcrumb
            key={index}
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
