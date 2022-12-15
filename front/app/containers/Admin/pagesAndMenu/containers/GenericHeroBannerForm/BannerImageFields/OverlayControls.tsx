import React, { useState, useMemo, useEffect } from 'react';
import styled, { useTheme } from 'styled-components';
import {
  Box,
  ColorPickerInput,
  Label,
  Toggle,
} from '@citizenlab/cl2-component-library';
import { debounce } from 'lodash-es';
import { FormattedMessage, useIntl } from 'utils/cl-intl';
import messages from '../messages';
import { colors } from 'utils/styleUtils';
import RangeInput from 'components/UI/RangeInput';
import { Props as BannerImageFieldsProps } from '.';

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
  bannerOverlayOpacity: BannerImageFieldsProps['bannerOverlayOpacity'];
  bannerOverlayColor: BannerImageFieldsProps['bannerOverlayColor'];
  onOverlayOpacityChange: BannerImageFieldsProps['onOverlayOpacityChange'];
  onOverlayColorChange: BannerImageFieldsProps['onOverlayColorChange'];
}

const OverlayControls = ({
  bannerOverlayOpacity,
  bannerOverlayColor,
  onOverlayOpacityChange,
  onOverlayColorChange,
}: Props) => {
  const [overlayEnabled, setOverlayEnabled] = useState(
    typeof bannerOverlayOpacity === 'number' && bannerOverlayOpacity > 0
  );
  const theme = useTheme();
  const { formatMessage } = useIntl();

  const handleOverlayEnabling = () => {
    if (overlayEnabled) {
      handleOverlayOpacityOnChange(0);
    } else {
      handleOverlayOpacityOnChange(
        bannerOverlayOpacity || theme.signedOutHeaderOverlayOpacity
      );
    }

    setOverlayEnabled(!overlayEnabled);
  };

  const handleOverlayOpacityOnChange = (opacity: number) => {
    onOverlayOpacityChange(opacity);
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
      <Box mb={overlayEnabled ? '20px' : '0'}>
        <Toggle
          onChange={handleOverlayEnabling}
          checked={overlayEnabled}
          label={
            <Box color={colors.blue500}>
              {formatMessage(messages.overlayToggleLabel)}
            </Box>
          }
        />
      </Box>
      {overlayEnabled && (
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
              value={
                // default values come from the theme
                bannerOverlayColor ?? theme.colors.tenantPrimary
              }
              onChange={onOverlayColorChange}
            />
          </Box>
          <Label>
            <FormattedMessage {...messages.imageOverlayOpacity} />
          </Label>
          <RangeInput
            step={1}
            min={0}
            max={100}
            value={
              typeof bannerOverlayOpacity === 'number'
                ? bannerOverlayOpacity
                : theme.signedOutHeaderOverlayOpacity
            }
            onChange={debouncedHandleOverlayOpacityOnChange}
          />
        </StyledBox>
      )}
    </>
  );
};

export default OverlayControls;
