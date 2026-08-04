// The little glyph that stands for a contact requirement: one or two icons,
// joined by a "+" (both are needed) or an "or" (either one will do). It is what
// makes the five options tellable apart at a glance, on the trigger and on the
// cards alike, so it lives in one place and is used by both.

import React from "react";

import { Box, Text, Icon, colors } from "@citizenlab/cl2-component-library";

import { useIntl } from "utils/cl-intl";

import { ContactOption } from "./constants";
import messages from "./messages";

interface Props {
  option: ContactOption;
  // 'large' on the trigger, where the glyph is the main thing to read;
  // 'compact' on the modal cards, so five of them fit without scrolling.
  size: "compact" | "large";
  // Teal when the option is the current one, muted grey otherwise.
  active: boolean;
  muted?: boolean;
}

const SIZES = {
  compact: {
    icon: "18px",
    gap: "5px",
    minWidth: "46px",
    height: "36px",
    px: "8px",
    radius: "8px",
  },
  large: {
    icon: "22px",
    gap: "6px",
    minWidth: "58px",
    height: "46px",
    px: "10px",
    radius: "10px",
  },
} as const;

const IconCluster = ({ option, size, active, muted = false }: Props) => {
  const { formatMessage } = useIntl();
  const dims = SIZES[size];
  const large = size === "large";

  const fill = muted
    ? colors.coolGrey300
    : active
    ? colors.teal500
    : colors.coolGrey600;
  const connectorColor = muted ? colors.coolGrey300 : colors.coolGrey500;

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="center"
      gap={dims.gap}
      flexShrink={0}
      minWidth={dims.minWidth}
      h={dims.height}
      px={dims.px}
      borderRadius={dims.radius}
      bgColor={active ? colors.white : colors.grey100}
      // Transparent rather than absent, so the badge keeps its height either way.
      border={`1px solid ${active ? colors.teal200 : "transparent"}`}
    >
      {option.icons.map((icon, i) => (
        <React.Fragment key={icon}>
          {i > 0 && option.connector === "plus" && (
            <Text
              as="span"
              m="0"
              fontSize={large ? "s" : "xs"}
              color="coolGrey500"
              style={{ color: connectorColor, lineHeight: 1 }}
            >
              +
            </Text>
          )}
          {i > 0 && option.connector === "or" && (
            <Text
              as="span"
              m="0"
              fontSize="xs"
              fontWeight="bold"
              style={{
                color: connectorColor,
                lineHeight: 1,
                fontSize: large ? "11px" : "10px",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
              }}
            >
              {formatMessage(messages.or)}
            </Text>
          )}
          <Icon name={icon} width={dims.icon} height={dims.icon} fill={fill} />
        </React.Fragment>
      ))}
    </Box>
  );
};

export default IconCluster;
