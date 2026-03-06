import React from 'react';

import {
  Box,
  Toggle,
  Text,
  Accordion,
  Label,
  Input,
} from '@citizenlab/cl2-component-library';

import Warning from 'components/UI/Warning';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  useConsistentHeight: boolean;
  onToggleConsistentHeight: () => void;
  desktopHeight?: number;
  tabletHeight?: number;
  phoneHeight?: number;
  onDesktopHeightChange: (value?: number) => void;
  onTabletHeightChange: (value?: number) => void;
  onPhoneHeightChange: (value?: number) => void;
  desktopPlaceholder: string;
  tabletPlaceholder: string;
  phonePlaceholder: string;
  disabled: boolean;
  showToggle?: boolean;
  bannerVersion?: 'signedIn' | 'signedOut';
}

const BannerHeightSettings = ({
  useConsistentHeight,
  onToggleConsistentHeight,
  desktopHeight,
  tabletHeight,
  phoneHeight,
  onDesktopHeightChange,
  onTabletHeightChange,
  onPhoneHeightChange,
  desktopPlaceholder,
  tabletPlaceholder,
  phonePlaceholder,
  disabled,
  showToggle = true,
  bannerVersion = 'signedIn',
}: Props) => {
  const { formatMessage } = useIntl();

  const heightInputs = [
    {
      key: 'desktop',
      label: messages.desktopHeightPx,
      value: desktopHeight,
      placeholder: desktopPlaceholder,
      onChange: onDesktopHeightChange,
    },
    {
      key: 'tablet',
      label: messages.tabletHeightPx,
      value: tabletHeight,
      placeholder: tabletPlaceholder,
      onChange: onTabletHeightChange,
    },
    {
      key: 'phone',
      label: messages.phoneHeightPx,
      value: phoneHeight,
      placeholder: phonePlaceholder,
      onChange: onPhoneHeightChange,
    },
  ];

  return (
    <Box>
      {showToggle && (
        <Toggle
          label={
            <Box>
              <Text m={'0px'} color="primary">
                {formatMessage(messages.useSameHeight)}
              </Text>
              <Text m={'0px'} color="textSecondary" fontSize="s">
                {formatMessage(messages.useSameHeightDescription)}
              </Text>
            </Box>
          }
          checked={useConsistentHeight}
          onChange={onToggleConsistentHeight}
        />
      )}

      <Box mb="18px">
        <Accordion
          mt="12px"
          p="8px"
          isOpenByDefault={false}
          title={
            <Text m="0px" color="primary">
              {formatMessage(messages.advancedHeightCustomization)}
            </Text>
          }
        >
          <Box>
            <Text mt="0px" mb="8px" fontSize="s" color="textSecondary">
              <FormattedMessage
                {...(bannerVersion === 'signedIn'
                  ? messages.advancedHeightCustomizationInfoSignedIn
                  : messages.advancedHeightCustomizationInfoSignedOut)}
                values={{
                  bold: (chunks) => <strong>{chunks}</strong>,
                }}
              />
            </Text>
            <Box display="flex" flexDirection="column" gap="12px" mt="12px">
              {heightInputs.map(
                ({ key, label, value, placeholder, onChange }) => (
                  <Box key={key}>
                    <Label
                      htmlFor={`headerHeight${
                        key.charAt(0).toUpperCase() + key.slice(1)
                      }`}
                    >
                      {formatMessage(label)}
                    </Label>
                    <Input
                      id={`headerHeight${
                        key.charAt(0).toUpperCase() + key.slice(1)
                      }`}
                      type="number"
                      min="50"
                      max="800"
                      placeholder={placeholder}
                      value={value?.toString() || ''}
                      onChange={(inputValue) => {
                        const numValue = inputValue
                          ? parseInt(inputValue, 10)
                          : undefined;
                        onChange(numValue);
                      }}
                      disabled={disabled}
                    />
                  </Box>
                )
              )}
            </Box>
          </Box>
          {disabled && (
            <Warning mt="12px">
              <Text m="0px" fontSize="s" color="teal700">
                <FormattedMessage {...messages.disableSameHeightInfo} />
              </Text>
            </Warning>
          )}
        </Accordion>
      </Box>
    </Box>
  );
};

export default BannerHeightSettings;
