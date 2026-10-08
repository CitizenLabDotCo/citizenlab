import React, { ReactNode } from 'react';

import {
  Box,
  Icon,
  IconButton,
  IconNames,
  Text,
  Tooltip,
  colors,
  stylingConsts,
} from '@citizenlab/cl2-component-library';

import ButtonWithLink from 'components/UI/ButtonWithLink';

import { useIntl } from 'utils/cl-intl';
import { type TypedLinkProps } from 'utils/cl-router/Link';

import messages from './messages';

interface Props extends TypedLinkProps {
  icon: IconNames;
  title: ReactNode;
  description: ReactNode;
  linkText?: ReactNode;
  linkTo?: string;
  disabledTooltipContent?: ReactNode;
  tooltipDisabled?: boolean;
  onDismiss?: () => void;
}

const FeatureCallout = ({
  icon,
  title,
  description,
  linkText,
  to,
  params,
  search,
  linkTo,
  disabledTooltipContent,
  tooltipDisabled,
  onDismiss,
}: Props) => {
  const { formatMessage } = useIntl();
  const iconElement = (
    <Icon name={icon} fill={colors.teal700} height="20px" mt="2px" />
  );
  const hasLink = !!(to || linkTo);

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
      {disabledTooltipContent ? (
        <Tooltip
          content={disabledTooltipContent}
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

      {hasLink && linkText && (
        <ButtonWithLink
          to={to}
          params={params}
          search={search}
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

      {onDismiss && (
        <IconButton
          ml="auto"
          iconName="close"
          iconColor={colors.teal700}
          iconColorOnHover={colors.textPrimary}
          a11y_buttonActionMessage={formatMessage(messages.dismiss)}
          onClick={onDismiss}
        />
      )}
    </Box>
  );
};

export default FeatureCallout;
