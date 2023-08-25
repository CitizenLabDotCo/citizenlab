import React from 'react';

// components
import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';
import { StyledSectionDescription } from '.';
import { Box, Toggle, Text } from '@citizenlab/cl2-component-library';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// typings
import { Multiloc, Locale } from 'typings';

interface Props {
  useCustomPostingTips: boolean;
  onChangeUseCustomPostingTips: (value: boolean) => void;
  postingTips: Multiloc;
  onChangePostingTips: (value: Multiloc) => void;
}

export default ({
  useCustomPostingTips,
  onChangeUseCustomPostingTips,
  postingTips,
  onChangePostingTips,
}: Props) => {
  const handlePostingTipsOnChange = (
    valueMultiloc: Multiloc,
    locale: Locale | undefined
  ) => {
    if (locale) {
      onChangePostingTips(valueMultiloc);
    }
  };

  return (
    <SectionField>
      <SubSectionTitleWithDescription>
        <FormattedMessage {...messages.postingTips} />
      </SubSectionTitleWithDescription>
      <Box mb={useCustomPostingTips ? '8px' : '0'}>
        <Toggle
          checked={
            typeof useCustomPostingTips === 'boolean'
              ? useCustomPostingTips
              : false
          }
          onChange={() => {
            onChangeUseCustomPostingTips(!useCustomPostingTips);
          }}
          label={
            // copied from front/app/components/admin/AnonymousPostingToggle/AnonymousPostingToggle.tsx
            <Box ml="8px">
              <Box display="flex">
                <Text
                  color="primary"
                  mb="0px"
                  fontSize="m"
                  style={{ fontWeight: 600 }}
                >
                  <FormattedMessage {...messages.useCustomPostingTips} />
                </Text>
              </Box>

              <Text color="coolGrey600" mt="0px" fontSize="m">
                <FormattedMessage {...messages.useCustomPostingTipsInfo} />
              </Text>
            </Box>
          }
        />
      </Box>
      {useCustomPostingTips && (
        <Box>
          <StyledSectionDescription>
            <FormattedMessage {...messages.postingTipsInfo} />
          </StyledSectionDescription>
          <QuillMultilocWithLocaleSwitcher
            id="posting_tips"
            valueMultiloc={postingTips}
            onChange={handlePostingTipsOnChange}
            noImages={true}
            noVideos={true}
            noAlign={true}
            withCTAButton
          />
        </Box>
      )}
    </SectionField>
  );
};
