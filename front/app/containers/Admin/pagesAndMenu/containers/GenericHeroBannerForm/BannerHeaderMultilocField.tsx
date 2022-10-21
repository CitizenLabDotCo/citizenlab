import React from 'react';
// components
import { SectionField } from 'components/admin/Section';
import InputMultilocWithLocaleSwitcher from 'components/UI/InputMultilocWithLocaleSwitcher';
// i18n
import { WrappedComponentProps } from 'react-intl';
import { Multiloc } from 'typings';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

interface Props {
  headerMultiloc: Multiloc;
  onChange: (value: Multiloc) => void;
}

const BannerHeaderMultilocField = ({
  intl: { formatMessage },
  headerMultiloc,
  onChange,
}: Props & WrappedComponentProps) => {
  return (
    <SectionField>
      <InputMultilocWithLocaleSwitcher
        type="text"
        valueMultiloc={headerMultiloc}
        label={formatMessage(messages.bannerHeaderSignedIn)}
        onChange={onChange}
      />
    </SectionField>
  );
};

export default injectIntl(BannerHeaderMultilocField);
