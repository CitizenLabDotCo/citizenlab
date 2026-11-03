import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  bo,
  colors,
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

type Variant = 'default' | 'backofficeRedesign';

const ICON_AND_SEPARATOR: Record<
  Variant,
  {
    iconSize: string;
    iconGap: string;
    chevronSize: string;
    chevronColor: string;
    chevronMargin: string;
  }
> = {
  default: {
    iconSize: '18px',
    iconGap: '8px',
    chevronSize: '16px',
    chevronColor: colors.coolGrey500,
    chevronMargin: '0 8px',
  },
  backofficeRedesign: {
    iconSize: '15px',
    iconGap: '5px',
    chevronSize: '13px',
    chevronColor: bo.colors.crumbSeparator,
    chevronMargin: '0 0 0 4px',
  },
};

// The back office redesign's header text size has no Text font size.
const HeaderCrumb = styled.span`
  font-size: ${bo.headerFontSize};
  font-weight: 400;
  line-height: 1.5;
  color: ${colors.textSecondary};
`;

const HeaderCurrentCrumb = styled(HeaderCrumb)`
  font-weight: 500;
  color: ${bo.colors.textHeadingStrong};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

interface Props {
  breadcrumbs: TBreadcrumbs;
  icon?: IconNames;
  separator?: 'slash' | 'chevron';
  fontSize?: 's' | 'm';
  highlightCurrentPage?: boolean;
  variant?: Variant;
}

const Breadcrumbs = ({
  breadcrumbs,
  icon,
  separator = 'slash',
  fontSize = 'm',
  highlightCurrentPage = false,
  variant = 'default',
}: Props) => {
  if (breadcrumbs.length === 0) {
    return null;
  }

  const redesign = variant === 'backofficeRedesign';
  const { iconSize, iconGap, chevronSize, chevronColor, chevronMargin } =
    ICON_AND_SEPARATOR[variant];

  return (
    <Box display="flex" alignItems="center" minWidth="0">
      {icon && (
        <Icon
          name={icon}
          width={iconSize}
          height={iconSize}
          fill={colors.coolGrey500}
          mr={iconGap}
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
            {link && redesign && (
              <HeaderCrumb>
                <StyledLink
                  to={link.to}
                  params={link.params}
                  search={link.search}
                >
                  {label}
                </StyledLink>
              </HeaderCrumb>
            )}
            {link && !redesign && (
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
            {!link && !isHeading && redesign && (
              <HeaderCrumb>{label}</HeaderCrumb>
            )}
            {!link && !isHeading && !redesign && (
              <Text color="textSecondary" fontSize={fontSize} as="span" mb="0">
                {label}
              </Text>
            )}
            {isHeading && redesign && (
              <HeaderCurrentCrumb>{label}</HeaderCurrentCrumb>
            )}
            {isHeading && !redesign && (
              <Text variant="boSection" as="span">
                {label}
              </Text>
            )}
            {!isLastBreadcrumb &&
              (separator === 'chevron' ? (
                <Icon
                  name="chevron-right"
                  width={chevronSize}
                  height={chevronSize}
                  fill={chevronColor}
                  m={chevronMargin}
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
