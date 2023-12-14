import React, { useState, useMemo } from 'react';
import styled, { useTheme } from 'styled-components';
import {
  Box,
  Text,
  ColorPickerInput,
  Label,
  Toggle,
  colors,
} from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from './messages';
import RangeInput from 'components/UI/RangeInput';

const StyledBox = styled(Box)`
  position: relative;

  ::before,
  ::after {
    content: '';
    display: block;
    position: absolute;
    width: 0;
    height: 0;
    border-style: solid;
  }

  ::after {
    top: -20px;
    left: 25px;
    border-color: transparent transparent #fff transparent;
    border-width: 10px;
  }

  ::before {
    top: -22px;
    left: 24px;
    border-color: transparent transparent ${colors.grey300} transparent;
    border-width: 11px;
  }
`;

interface Props {
  bannerOverlayOpacity: number | null;
  bannerOverlayColor: string;
  onOverlayChange: (opacity: number | null, color: string | null) => void;
  variant: 'signedIn' | 'signedOut';
  noOpacitySlider?: boolean;
}

const OverlayControls = ({
  bannerOverlayOpacity,
  bannerOverlayColor,
  onOverlayChange,
  variant,
  noOpacitySlider,
}: Props) => {
  const [overlayEnabled, setOverlayEnabled] = useState(
    typeof bannerOverlayOpacity === 'number' && bannerOverlayOpacity !== 0
  );
  const theme = useTheme();
  const { formatMessage } = useIntl();

  const handleOverlayEnabling = () => {
    if (overlayEnabled) {
      onOverlayChange(0, theme.colors.tenantPrimary);
    } else {
      onOverlayChange(
        bannerOverlayOpacity ||
          (variant === 'signedOut'
            ? theme.signedOutHeaderOverlayOpacity
            : theme.signedInHeaderOverlayOpacity),
        bannerOverlayColor ||
          (variant === 'signedIn'
            ? theme.colors.tenantPrimary
            : theme.signedInHeaderOverlayColor) ||
          null
      );
    }

    setOverlayEnabled((overlayEnabled) => !overlayEnabled);
  };

  const handleOverlayOpacityOnChange = (
    opacity: Props['bannerOverlayOpacity']
  ) => {
    onOverlayChange(opacity, bannerOverlayColor || theme.colors.tenantPrimary);
  };

  const handleOverlayColorOnChange = (color: Props['bannerOverlayColor']) => {
    onOverlayChange(
      bannerOverlayOpacity ||
        (variant === 'signedOut'
          ? theme.signedOutHeaderOverlayOpacity
          : theme.signedInHeaderOverlayOpacity),
      color
    );
  };

  const debounceHandleOverlayOpacityOnChange = debounce(
    handleOverlayOpacityOnChange,
    1
  );

  const debouncedHandleOverlayOpacityOnChange = useMemo(
    () => debounceHandleOverlayOpacityOnChange,
    [debounceHandleOverlayOpacityOnChange]
  );

  return (
    <>
      <Box mb={overlayEnabled ? '20px' : '0'} data-cy="e2e-overlay-toggle">
        <Toggle
          id="overlay-toggle"
          onChange={handleOverlayEnabling}
          checked={overlayEnabled}
          label={
            <Text as="span" color="blue500">
              {formatMessage(messages.overlayToggleLabel)}
            </Text>
          }
        />
      </Box>
      {/* We check for typeof of opacity because 0 would coerce to false. */}
      {overlayEnabled && typeof bannerOverlayOpacity === 'number' && (
        <StyledBox
          p="40px"
          border={`1px solid ${colors.grey300}`}
          borderRadius={theme.borderRadius}
        >
          <Box mb="36px">
            <ColorPickerInput
              id="image-overlay-color"
              label={formatMessage(messages.imageOverlayColor)}
              type="text"
              value={bannerOverlayColor}
              onChange={handleOverlayColorOnChange}
            />
          </Box>
          {!noOpacitySlider && (
            <>
              <Label>
                <FormattedMessage {...messages.imageOverlayOpacity} />
              </Label>
              <RangeInput
                step={1}
                min={0}
                max={100}
                value={bannerOverlayOpacity}
                onChange={debouncedHandleOverlayOpacityOnChange}
              />
            </>
          )}
        </StyledBox>
      )}
    </>
  );
};

export default OverlayControls;
