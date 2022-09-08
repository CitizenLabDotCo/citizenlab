import React, { ReactElement } from 'react';

// components
import { Section, SubSectionTitle } from 'components/admin/Section';

import SectionFormWrapper from '../../components/SectionFormWrapper';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';

import { IconTooltip } from '@citizenlab/cl2-component-library';

import BannerImageFields from './BannerImageFields';
// i18n
import { InjectedIntlProps } from 'react-intl';
import { injectIntl, FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';
import { HomepageHeroBannerInputSettings } from 'containers/Admin/pagesAndMenu/EditHomepage/HeroBanner';
import { CustomPageHeroBannerInputSettings } from 'containers/Admin/pagesAndMenu/containers/CustomPages/Edit/HeroBanner';

// constants
import Warning from 'components/UI/Warning';

export interface HeaderImageProps {
  onAddImage: (newImageBase64: string) => void;
  onRemoveImage: () => void;
  onOverlayColorChange: (color: string) => void;
  onOverlayOpacityChange: (color: number) => void;
}

// names differ slightly between HomePage and CustomPage
interface Props extends HeaderImageProps {
  breadcrumbs: TBreadcrumbs;
  title?: string | JSX.Element;
  formStatus: ISubmitState;
  setFormStatus: (submitState: ISubmitState) => void;
  onSave: () => void;
  isLoading: boolean;
  inputSettings: HeroBannerInputSettings;
  outletSectionStart?: ReactElement;
  avatarsFieldComponent?: ReactElement;
  outletSectionEnd?: ReactElement;
  bannerMultilocFieldComponent?: ReactElement;
  bannerHeaderFieldsComponent?: ReactElement;
}

export type HeroBannerInputSettings =
  | HomepageHeroBannerInputSettings
  | CustomPageHeroBannerInputSettings;

const GenericHeroBannerForm = ({
  onSave,
  setFormStatus,
  formStatus,
  isLoading,
  title,
  breadcrumbs,
  intl: { formatMessage },
  outletSectionStart,
  avatarsFieldComponent,
  outletSectionEnd,
  bannerMultilocFieldComponent,
  bannerHeaderFieldsComponent,
  onAddImage,
  onRemoveImage,
  onOverlayColorChange,
  onOverlayOpacityChange,
}: Props & InjectedIntlProps) => {
  return (
    <SectionFormWrapper
      breadcrumbs={breadcrumbs}
      title={title}
      stickyMenuContents={
        <SubmitWrapper
          status={formStatus}
          buttonStyle="primary"
          loading={isLoading}
          onClick={onSave}
          messages={{
            buttonSave: messages.heroBannerSaveButton,
            buttonSuccess: messages.heroBannerButtonSuccess,
            messageSuccess: messages.heroBannerMessageSuccess,
            messageError: messages.heroBannerError,
          }}
        />
      }
    >
      <Section key={'header'}>
        <Warning>
          <FormattedMessage {...messages.heroBannerInfoBar} />
        </Warning>
        {outletSectionStart}
        <SubSectionTitle>
          <FormattedMessage {...messages.header_bg} />
          <IconTooltip
            content={
              <FormattedMessage
                {...messages.headerBgTooltip}
                values={{
                  supportPageLink: (
                    <a
                      href={formatMessage(messages.headerImageSupportPageURL)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <FormattedMessage
                        {...messages.headerImageSupportPageText}
                      />
                    </a>
                  ),
                }}
              />
            }
          />
        </SubSectionTitle>

        <BannerImageFields
          bannerLayout={localSettings.banner_layout}
          bannerOverlayColor={localSettings.banner_overlay_color}
          bannerOverlayOpacity={localSettings.banner_overlay_opacity}
          headerBg={localSettings.header_bg}
          onAddImage={onAddImage}
          onRemoveImage={onRemoveImage}
          setFormStatus={setFormStatus}
          onOverlayColorChange={onOverlayColorChange}
          onOverlayOpacityChange={onOverlayOpacityChange}
        />
        {bannerHeaderFieldsComponent}
        {bannerMultilocFieldComponent}
        {avatarsFieldComponent}
        {outletSectionEnd}
      </Section>
    </SectionFormWrapper>
  );
};

export default injectIntl(GenericHeroBannerForm);
