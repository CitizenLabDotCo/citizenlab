import React, { ReactNode } from 'react';

import {
  Box,
  Icon,
  IconNames,
  Text,
  Tooltip,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

interface Props {
  icon: IconNames;
  title: ReactNode;
  description: ReactNode;
  linkText?: ReactNode;
  linkTo?: string;
  tooltipContent?: ReactNode;
  tooltipDisabled?: boolean;
}

const Callout = ({
  icon,
  title,
  description,
  linkText,
  linkTo,
  tooltipContent,
  tooltipDisabled,
}: Props) => {
  const iconElement = <Icon name={icon} fill={colors.teal700} width="20px" />;

  return (
    <Box
      display="flex"
      alignItems="center"
      gap="16px"
      px="16px"
      py="12px"
      borderRadius={stylingConsts.borderRadius}
      background={colors.teal100}
    >
      {tooltipContent ? (
        <Tooltip
          content={tooltipContent}
          disabled={tooltipDisabled}
          placement="bottom"
          theme="dark"
        >
          {iconElement}
        </Tooltip>
      ) : (
        iconElement
      )}

      <Box>
        <Text m="0px" color="teal700" fontSize="s">
          <b>{title}</b>
          <> {description}</>
        </Text>
      </Box>

      {linkTo && linkText && (
        <ButtonWithLink
          linkTo={linkTo}
          openLinkInNewTab
          buttonStyle="text"
          m="0px"
          fontSize="s"
          textColor={colors.teal700}
        >
          {linkText}
        </ButtonWithLink>
      )}
    </Box>
  );
};

export default Callout;
