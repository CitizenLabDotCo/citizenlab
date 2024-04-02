import React from 'react';

import { Multiloc, SupportedLocale } from 'typings';

import {
  SectionField,
  SubSectionTitleWithDescription,
} from 'components/admin/Section';
import QuillMultilocWithLocaleSwitcher from 'components/UI/QuillEditor/QuillMultilocWithLocaleSwitcher';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

import { StyledSectionDescription } from '.';

interface Props {
  postingTips: Multiloc;
  onChangePostingTips: (value: Multiloc) => void;
}

export default ({ postingTips, onChangePostingTips }: Props) => {
  const handlePostingTipsOnChange = (
    valueMultiloc: Multiloc,
    locale: SupportedLocale | undefined
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
    </SectionField>
  );
};
