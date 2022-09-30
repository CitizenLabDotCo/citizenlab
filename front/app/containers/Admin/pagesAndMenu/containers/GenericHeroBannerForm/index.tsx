import React, { ReactElement } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { Section } from 'components/admin/Section';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';
import SectionFormWrapper from '../../components/SectionFormWrapper';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { TBreadcrumbs } from 'components/UI/Breadcrumbs';

// constants
import Warning from 'components/UI/Warning';

interface Props {
  breadcrumbs: TBreadcrumbs;
  title?: string | JSX.Element;
  formStatus: ISubmitState;
  setFormStatus: (submitState: ISubmitState) => void;
  onSave: () => void;
  isLoading: boolean;
  outletSectionStart?: ReactElement;
  layoutSettingFieldComponent?: ReactElement;
  bannerImageFieldsComponent: ReactElement;
  bannerHeaderFieldsComponent: ReactElement;
  bannerMultilocFieldComponent?: ReactElement;
  avatarsFieldComponent?: ReactElement;
  ctaButtonFieldsComponent?: ReactElement;
  outletSectionEnd?: ReactElement;
}

const GenericHeroBannerForm = ({
  onSave,
  formStatus,
  isLoading,
  title,
  breadcrumbs,
  outletSectionStart,
  avatarsFieldComponent,
  outletSectionEnd,
  bannerMultilocFieldComponent,
  bannerHeaderFieldsComponent,
  bannerImageFieldsComponent,
  layoutSettingFieldComponent,
  ctaButtonFieldsComponent,
}: Props) => {
  return (
    <>
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
          {/*
            Padding equal to the height of the sticky bar with the submit button.
          */}
          <Box pb="78px">
            <Warning>
              <FormattedMessage {...messages.heroBannerInfoBar} />
            </Warning>
            {outletSectionStart}
            {layoutSettingFieldComponent}
            {bannerImageFieldsComponent}
            {bannerHeaderFieldsComponent}
            {bannerMultilocFieldComponent}
            {avatarsFieldComponent}
            {/* The custom page hero banner form has the CTA button fields inserted via the core */}
            {ctaButtonFieldsComponent}
            {/*
          The home page hero banner form has CTA button fields inserted
          via the outlet below (customizable_homepage_banner module)
        */}
            {outletSectionEnd}
          </Box>
        </Section>
      </SectionFormWrapper>
    </>
  );
};

export default GenericHeroBannerForm;
