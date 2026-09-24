import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  NewBOText,
  Text,
  colors,
} from '@citizenlab/cl2-component-library';

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
  /** Icon shown once, before the first crumb. */
  icon?: IconNames;
  /** Defaults to the "/" character; "chevron" swaps in a > icon. */
  separator?: 'slash' | 'chevron';
  /** Crumb text size. Defaults to the body scale. */
  fontSize?: 's' | 'm';
  /** Renders the current (last, unlinked) crumb as a page heading. */
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
    <Box display="flex" alignItems="center">
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
            {isHeading && (
              <NewBOText variant="section" as="span">
                {label}
              </NewBOText>
            )}
            {!isLastBreadcrumb &&
              (separator === 'chevron' ? (
                <Icon
                  name="chevron-right"
                  width="16px"
                  height="16px"
                  fill={colors.coolGrey500}
                  mx="8px"
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
