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
  disabled: boolean;
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
  disabled,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box mt="8px">
      <Toggle
        disabled={disabled}
        label={
          <Box>
            <Text m={'0px'} color="primary">
              {formatMessage(messages.useConsistentBannerHeight)}
            </Text>
            <Text m={'0px'} color="textSecondary" fontSize="s">
              {formatMessage(messages.useConsistentBannerHeightDescription)}
            </Text>
          </Box>
        }
        checked={useConsistentHeight}
        onChange={onToggleConsistentHeight}
      />

      <Box>
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
                {...messages.advancedHeightCustomizationInfoSignedIn}
                values={{
                  bold: (chunks) => <strong>{chunks}</strong>,
                }}
              />
            </Text>
            <Box display="flex" flexDirection="column" gap="12px" mt="12px">
              <Box>
                <Label htmlFor="headerHeightDesktop">
                  {formatMessage(messages.desktopHeightPx)}
                </Label>
                <Input
                  id="headerHeightDesktop"
                  type="number"
                  min="50"
                  max="800"
                  placeholder={'200'}
                  value={desktopHeight?.toString() || ''}
                  onChange={(value) => {
                    const numValue = value ? parseInt(value, 10) : undefined;
                    onDesktopHeightChange(numValue);
                  }}
                  disabled={disabled || useConsistentHeight}
                />
              </Box>
              <Box>
                <Label htmlFor="headerHeightTablet">
                  {formatMessage(messages.tabletHeightPx)}
                </Label>
                <Input
                  id="headerHeightTablet"
                  type="number"
                  min="50"
                  max="800"
                  placeholder={'250'}
                  value={tabletHeight?.toString() || ''}
                  onChange={(value) => {
                    const numValue = value ? parseInt(value, 10) : undefined;
                    onTabletHeightChange(numValue);
                  }}
                  disabled={disabled || useConsistentHeight}
                />
              </Box>
              <Box>
                <Label htmlFor="headerHeightPhone">
                  {formatMessage(messages.phoneHeightPx)}
                </Label>
                <Input
                  id="headerHeightPhone"
                  type="number"
                  min="50"
                  max="800"
                  placeholder={'300'}
                  value={phoneHeight?.toString() || ''}
                  onChange={(value) => {
                    const numValue = value ? parseInt(value, 10) : undefined;
                    onPhoneHeightChange(numValue);
                  }}
                  disabled={disabled || useConsistentHeight}
                />
              </Box>
            </Box>
          </Box>
          {useConsistentHeight && (
            <Warning mt="12px">
              <Text m="0px" fontSize="s" color="teal700">
                <FormattedMessage {...messages.disableConsistentHeightInfo} />
              </Text>
            </Warning>
          )}
        </Accordion>
      </Box>
    </Box>
  );
};

export default BannerHeightSettings;
