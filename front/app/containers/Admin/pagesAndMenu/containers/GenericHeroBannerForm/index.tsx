import React, { ReactElement } from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { Section } from 'components/admin/Section';
import SubmitWrapper, { ISubmitState } from 'components/admin/SubmitWrapper';
import SectionFormWrapper from '../../components/SectionFormWrapper';
import ViewCustomPageButton from '../CustomPages/Edit/ViewCustomPageButton';

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
  onSaveAndEnable?: () => void | undefined;
  isLoading: boolean;
  outletSectionStart?: ReactElement;
  layoutSettingFieldComponent?: ReactElement;
  bannerImageFieldsComponent: ReactElement;
  bannerHeaderFieldsComponent: ReactElement;
  bannerMultilocFieldComponent?: ReactElement;
  avatarsFieldComponent?: ReactElement;
  ctaButtonFieldsComponent?: ReactElement;
  outletSectionEnd?: ReactElement;
  badge?: JSX.Element;
  linkToViewPage?: string;
}

const GenericHeroBannerForm = ({
  onSave,
  onSaveAndEnable,
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
  badge,
  linkToViewPage,
}: Props) => {
  return (
    <>
      <SectionFormWrapper
        breadcrumbs={breadcrumbs}
        title={title}
        badge={badge}
        stickyMenuContents={
          <SubmitWrapper
            status={formStatus}
            buttonStyle="primary"
            loading={isLoading}
            onClick={onSave}
            enableFormOnSuccess
            messages={{
              buttonSave: messages.heroBannerSaveButton,
              buttonSuccess: messages.heroBannerButtonSuccess,
              messageSuccess: messages.heroBannerMessageSuccess,
              messageError: messages.heroBannerError,
            }}
            secondaryButtonOnClick={onSaveAndEnable}
            secondaryButtonSaveMessage={messages.saveAndEnable}
          />
        }
        rightSideCTA={
          linkToViewPage ? (
            <ViewCustomPageButton linkTo={linkToViewPage} />
          ) : null
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
