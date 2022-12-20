import React, { useState, useMemo } from 'react';
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
    typeof bannerOverlayOpacity === 'number'
  );
  const theme = useTheme();
  const { formatMessage } = useIntl();

  const handleOverlayEnabling = () => {
    // Ideally we should also change the color here
    // but if we call with two individual setting handlers,
    // they will overwrite each other setting one of the two
    // values to null. We need a new handler that updates
    // multiple settings at the same time but this requires
    // refactoring of components used in the GenericHeroBannerForm
    // to home/custom page specific versions to make the types fit.
    if (overlayEnabled) {
      handleOverlayOpacityOnChange(null);
    } else {
      handleOverlayOpacityOnChange(
        bannerOverlayOpacity || theme.signedOutHeaderOverlayOpacity
      );
    }

    setOverlayEnabled((overlayEnabled) => !overlayEnabled);
  };

  const handleOverlayOpacityOnChange = (
    opacity: Props['bannerOverlayOpacity']
  ) => {
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
      {/*
        We check for typeof of opacity because 0 would coerce to false.
        We don't do a similar thing for the color because we don't set
        it in the toggle hander, so we handle the type check with the
        theme default as fallback
      */}
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
              // Should be replaced, value should only be
              // bannerOverlayColor. Default needs to be set by the
              // toggle handler, but it requires significant refactoring
              value={bannerOverlayColor || theme.colors.tenantPrimary}
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
            value={bannerOverlayOpacity}
            onChange={debouncedHandleOverlayOpacityOnChange}
          />
        </StyledBox>
      )}
    </>
  );
};

export default OverlayControls;
